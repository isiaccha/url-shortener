"""
API tests for link routes.
Tests the link management endpoints with a real FastAPI test client.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock

from src.models.user import User
from src.models.link import Link
from src.models.click_event import ClickEvent
from src.links.service import create_link


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        display_name="Test User",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def authenticated_client(client, db_session, test_user):
    """Create a test client with an authenticated session."""
    from src.auth.dependencies import get_current_user
    from src.main import app
    
    def override_get_current_user():
        return test_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    yield client
    
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def test_link(db_session, test_user):
    """Create a test link."""
    link = create_link(db_session, user_id=test_user.id, target_url="https://example.com")
    return link


class TestCreateLink:
    """Test POST /api/links endpoint."""
    
    def test_create_link_success(self, authenticated_client, test_user):
        """Test creating a link successfully."""
        payload = {"target_url": "https://example.com/test"}
        response = authenticated_client.post("/api/links", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["target_url"] == "https://example.com/test"
        assert data["slug"] is not None
        assert data["is_active"] is True
        assert data["click_count"] == 0
        assert "short_url" in data
        assert data["id"] is not None
    
    def test_create_link_unauthenticated(self, client):
        """Test creating a link without authentication."""
        payload = {"target_url": "https://example.com/test"}
        response = client.post("/api/links", json=payload)
        
        assert response.status_code == 401
    
    def test_create_link_invalid_url(self, authenticated_client):
        """Test creating a link with invalid URL."""
        payload = {"target_url": "not-a-valid-url"}
        response = authenticated_client.post("/api/links", json=payload)
        
        assert response.status_code == 422  # Validation error


class TestListLinks:
    """Test GET /api/links endpoint."""
    
    def test_list_links_empty(self, authenticated_client):
        """Test listing links when user has none."""
        response = authenticated_client.get("/api/links")
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_links_with_data(self, authenticated_client, db_session, test_user, test_link):
        """Test listing links when user has some."""
        # Create another link
        link2 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/2")
        
        response = authenticated_client.get("/api/links")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all("id" in link for link in data)
        assert all("slug" in link for link in data)
        assert all("short_url" in link for link in data)
    
    def test_list_links_pagination(self, authenticated_client, db_session, test_user):
        """Test pagination parameters."""
        # Create 5 links
        for i in range(5):
            create_link(db_session, user_id=test_user.id, target_url=f"https://example.com/{i}")
        
        # Get first 2
        response = authenticated_client.get("/api/links?limit=2&offset=0")
        assert response.status_code == 200
        assert len(response.json()) == 2
        
        # Get next 2
        response = authenticated_client.get("/api/links?limit=2&offset=2")
        assert response.status_code == 200
        assert len(response.json()) == 2
    
    def test_list_links_unauthenticated(self, client):
        """Test listing links without authentication."""
        response = client.get("/api/links")
        assert response.status_code == 401
    
    def test_list_links_only_own(self, authenticated_client, db_session, test_user):
        """Test that users only see their own links."""
        # Create another user and their link
        other_user = User(email="other@example.com", display_name="Other")
        db_session.add(other_user)
        db_session.commit()
        
        other_link = create_link(db_session, user_id=other_user.id, target_url="https://example.com/other")
        
        # Create own link
        my_link = create_link(db_session, user_id=test_user.id, target_url="https://example.com/mine")
        
        response = authenticated_client.get("/api/links")
        
        assert response.status_code == 200
        link_ids = [link["id"] for link in response.json()]
        assert my_link.id in link_ids
        assert other_link.id not in link_ids


class TestLinkStats:
    """Test GET /api/links/{link_id}/stats endpoint."""
    
    def test_link_stats_success(self, authenticated_client, db_session, test_user, test_link):
        """Test getting link stats successfully."""
        # Create some click events
        from src.links.utils import make_visitor_hash, get_ua_raw
        mock_request = Mock()
        mock_request.client = Mock()
        mock_request.client.host = "192.168.1.100"
        mock_request.headers = {"user-agent": "Mozilla/5.0"}
        
        ua = get_ua_raw(mock_request)
        ip = mock_request.client.host
        visitor_hash = make_visitor_hash(ip, ua)
        
        event = ClickEvent(
            link_id=test_link.id,
            visitor_hash=visitor_hash,
            clicked_at=datetime.now(timezone.utc),
        )
        db_session.add(event)
        db_session.commit()
        
        response = authenticated_client.get(f"/api/links/{test_link.id}/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert "link" in data
        assert data["link"]["id"] == test_link.id
        assert "clicks_last_24h" in data
        assert "unique_visitors" in data
        assert "recent_clicks" in data
    
    def test_link_stats_not_found(self, authenticated_client, test_user):
        """Test getting stats for non-existent link."""
        response = authenticated_client.get("/api/links/99999/stats")
        assert response.status_code == 404
    
    def test_link_stats_wrong_user(self, authenticated_client, db_session):
        """Test getting stats for another user's link."""
        # Create another user and their link
        other_user = User(email="other@example.com", display_name="Other")
        db_session.add(other_user)
        db_session.commit()
        
        other_link = create_link(db_session, user_id=other_user.id, target_url="https://example.com/other")
        
        response = authenticated_client.get(f"/api/links/{other_link.id}/stats")
        assert response.status_code == 404
    
    def test_link_stats_unauthenticated(self, client, test_link):
        """Test getting link stats without authentication."""
        response = client.get(f"/api/links/{test_link.id}/stats")
        assert response.status_code == 401


class TestUpdateLinkStatus:
    """Test PATCH /api/links/{link_id}/status endpoint."""
    
    def test_update_link_status_activate(self, authenticated_client, db_session, test_user, test_link):
        """Test activating a link."""
        # Deactivate first
        test_link.is_active = False
        db_session.commit()
        
        response = authenticated_client.patch(f"/api/links/{test_link.id}/status?is_active=true")
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True
    
    def test_update_link_status_deactivate(self, authenticated_client, test_link):
        """Test deactivating a link."""
        response = authenticated_client.patch(f"/api/links/{test_link.id}/status?is_active=false")
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False
    
    def test_update_link_status_not_found(self, authenticated_client):
        """Test updating status for non-existent link."""
        response = authenticated_client.patch("/api/links/99999/status?is_active=false")
        assert response.status_code == 404
    
    def test_update_link_status_wrong_user(self, authenticated_client, db_session):
        """Test updating status for another user's link."""
        other_user = User(email="other@example.com", display_name="Other")
        db_session.add(other_user)
        db_session.commit()
        
        other_link = create_link(db_session, user_id=other_user.id, target_url="https://example.com/other")
        
        response = authenticated_client.patch(f"/api/links/{other_link.id}/status?is_active=false")
        assert response.status_code == 404
    
    def test_update_link_status_unauthenticated(self, client, test_link):
        """Test updating link status without authentication."""
        response = client.patch(f"/api/links/{test_link.id}/status?is_active=false")
        assert response.status_code == 401


class TestDashboard:
    """Test GET /api/links/dashboard endpoint."""
    
    def test_dashboard_success(self, authenticated_client, db_session, test_user, test_link):
        """Test getting dashboard data successfully."""
        # Create some click events
        from src.links.utils import make_visitor_hash
        mock_request = Mock()
        mock_request.client = Mock()
        mock_request.client.host = "192.168.1.100"
        
        ip = mock_request.client.host
        ua = "Mozilla/5.0"
        visitor_hash = make_visitor_hash(ip, ua)
        
        event = ClickEvent(
            link_id=test_link.id,
            visitor_hash=visitor_hash,
            country="US",
            clicked_at=datetime.now(timezone.utc),
        )
        db_session.add(event)
        db_session.commit()
        
        # Set date range - need to format dates properly for query parameter
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=7)
        
        # Format dates as ISO strings - use Z for UTC timezone
        # The code handles both Z and +00:00, but Z is cleaner for URLs
        start_date_str = start_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        end_date_str = end_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        response = authenticated_client.get(
            f"/api/links/dashboard?start_date={start_date_str}&end_date={end_date_str}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "kpis" in data
        assert "sparkline_data" in data
        assert "countries" in data
        assert "links" in data
        
        # Check KPI structure
        assert "total_clicks" in data["kpis"]
        assert "total_links" in data["kpis"]
        assert "unique_visitors" in data["kpis"]
    
    def test_dashboard_invalid_date_format(self, authenticated_client):
        """Test dashboard with invalid date format."""
        response = authenticated_client.get(
            "/api/links/dashboard?start_date=invalid&end_date=invalid"
        )
        assert response.status_code == 400
    
    def test_dashboard_unauthenticated(self, client):
        """Test getting dashboard without authentication."""
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=7)
        
        start_date_str = start_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        end_date_str = end_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        response = client.get(
            f"/api/links/dashboard?start_date={start_date_str}&end_date={end_date_str}"
        )
        assert response.status_code == 401


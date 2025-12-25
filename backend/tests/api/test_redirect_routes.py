"""
API tests for redirect routes.
Tests the link redirection endpoint with a real FastAPI test client.
"""
import pytest
from datetime import datetime, timezone
from unittest.mock import Mock, patch

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
def test_link(db_session, test_user):
    """Create a test link."""
    link = create_link(db_session, user_id=test_user.id, target_url="https://example.com")
    return link


class TestRedirect:
    """Test GET /{slug} endpoint."""
    
    def test_redirect_success(self, client, db_session, test_link):
        """Test successful redirect to target URL."""
        response = client.get(f"/{test_link.slug}", follow_redirects=False)
        
        assert response.status_code == 302
        assert response.headers["location"] == test_link.target_url
    
    def test_redirect_not_found(self, client):
        """Test redirect with non-existent slug."""
        response = client.get("/nonexistentslug")
        
        assert response.status_code == 404
        assert "Link not found" in response.json()["detail"]
    
    def test_redirect_inactive_link(self, client, db_session, test_link):
        """Test redirect with inactive link."""
        test_link.is_active = False
        db_session.commit()
        
        response = client.get(f"/{test_link.slug}")
        
        assert response.status_code == 404
        assert "Link not found" in response.json()["detail"]
    
    def test_redirect_records_click(self, client, db_session, test_link):
        """Test that redirect records a click event."""
        initial_count = test_link.click_count
        initial_events = db_session.query(ClickEvent).filter_by(link_id=test_link.id).count()
        
        # Mock the utility functions used by record_click
        with patch('src.links.service.get_client_ip', return_value="192.168.1.100"):
            with patch('src.links.service.get_ua_raw', return_value="Mozilla/5.0"):
                with patch('src.links.service.get_referrer_host', return_value="google.com"):
                    with patch('src.links.service.get_country_from_ip', return_value="US"):
                        response = client.get(f"/{test_link.slug}", follow_redirects=False)
        
        assert response.status_code == 302
        
        # Verify click was recorded
        db_session.refresh(test_link)
        assert test_link.click_count == initial_count + 1
        assert test_link.last_clicked_at is not None
        
        # Verify click event was created
        event_count = db_session.query(ClickEvent).filter_by(link_id=test_link.id).count()
        assert event_count == initial_events + 1
    
    def test_redirect_analytics_failure_doesnt_block(self, client, db_session, test_link):
        """Test that analytics failures don't block the redirect."""
        # Mock record_click to raise an exception
        with patch('src.links.redirect_router.record_click', side_effect=Exception("Analytics error")):
            response = client.get(f"/{test_link.slug}", follow_redirects=False)
        
        # Should still redirect successfully
        assert response.status_code == 302
        assert response.headers["location"] == test_link.target_url
    
    def test_redirect_updates_link_stats(self, client, db_session, test_link):
        """Test that redirect updates link click count and last_clicked_at."""
        assert test_link.click_count == 0
        assert test_link.last_clicked_at is None
        
        # Mock the utility functions used by record_click
        with patch('src.links.service.get_client_ip', return_value="192.168.1.100"):
            with patch('src.links.service.get_ua_raw', return_value="Mozilla/5.0"):
                with patch('src.links.service.get_referrer_host', return_value=None):
                    with patch('src.links.service.get_country_from_ip', return_value=None):
                        response = client.get(f"/{test_link.slug}", follow_redirects=False)
        
        assert response.status_code == 302
        
        db_session.refresh(test_link)
        assert test_link.click_count == 1
        assert test_link.last_clicked_at is not None
        assert isinstance(test_link.last_clicked_at, datetime)
    
    def test_redirect_multiple_clicks(self, client, db_session, test_link):
        """Test that multiple redirects increment click count."""
        # Mock the utility functions used by record_click
        with patch('src.links.service.get_client_ip', return_value="192.168.1.100"):
            with patch('src.links.service.get_ua_raw', return_value="Mozilla/5.0"):
                with patch('src.links.service.get_referrer_host', return_value=None):
                    with patch('src.links.service.get_country_from_ip', return_value=None):
                        # First click
                        response1 = client.get(f"/{test_link.slug}", follow_redirects=False)
                        assert response1.status_code == 302
                        
                        db_session.refresh(test_link)
                        assert test_link.click_count == 1
                        
                        # Second click
                        response2 = client.get(f"/{test_link.slug}", follow_redirects=False)
                        assert response2.status_code == 302
                        
                        db_session.refresh(test_link)
                        assert test_link.click_count == 2


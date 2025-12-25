"""
Integration tests for links/service.py.
These tests use a real database (in-memory SQLite) to test service functions.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock

from src.models.user import User
from src.models.link import Link
from src.models.click_event import ClickEvent
from src.links.service import (
    create_link,
    get_active_link_by_slug,
    record_click,
    list_links_for_user,
    get_link_for_user,
    count_clicks_last_24h,
    recent_click_events,
    get_total_clicks_for_user,
    get_total_links_for_user,
    get_unique_visitors_for_user,
    get_unique_visitors_per_link,
    get_unique_visitors_for_link,
    get_clicks_by_country,
    get_clicks_time_series,
    get_previous_period_metrics,
    update_link_status,
)


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


@pytest.fixture
def mock_request():
    """Create a mock FastAPI Request object."""
    request = Mock()
    request.client = Mock()
    request.client.host = "192.168.1.100"
    request.headers = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "referer": "https://google.com/search",
    }
    return request


class TestCreateLink:
    """Test create_link function."""
    
    def test_create_link_basic(self, db_session, test_user):
        """Test basic link creation."""
        link = create_link(db_session, user_id=test_user.id, target_url="https://example.com")
        
        assert link is not None
        assert link.id is not None
        assert link.user_id == test_user.id
        assert link.target_url == "https://example.com"
        assert link.is_active is True
        assert link.slug is not None
        assert len(link.slug) > 0
        assert link.click_count == 0
        assert link.created_at is not None
    
    def test_create_link_slug_assigned(self, db_session, test_user):
        """Test that slug is properly assigned based on link ID."""
        link = create_link(db_session, user_id=test_user.id, target_url="https://example.com")
        
        # Slug should be generated from the link ID
        assert link.slug is not None
        # Same ID should produce same slug
        from src.links.slug import slug_for_id
        expected_slug = slug_for_id(link.id)
        assert link.slug == expected_slug
    
    def test_create_multiple_links(self, db_session, test_user):
        """Test creating multiple links for the same user."""
        link1 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/1")
        link2 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/2")
        
        assert link1.id != link2.id
        assert link1.slug != link2.slug
        assert link1.target_url != link2.target_url


class TestGetActiveLinkBySlug:
    """Test get_active_link_by_slug function."""
    
    def test_get_active_link_by_slug_exists(self, db_session, test_link):
        """Test retrieving an active link by slug."""
        found_link = get_active_link_by_slug(db_session, slug=test_link.slug)
        
        assert found_link is not None
        assert found_link.id == test_link.id
        assert found_link.slug == test_link.slug
        assert found_link.is_active is True
    
    def test_get_active_link_by_slug_not_found(self, db_session):
        """Test retrieving a non-existent slug."""
        found_link = get_active_link_by_slug(db_session, slug="nonexistent")
        assert found_link is None
    
    def test_get_active_link_by_slug_inactive(self, db_session, test_link):
        """Test that inactive links are not returned."""
        test_link.is_active = False
        db_session.commit()
        
        found_link = get_active_link_by_slug(db_session, slug=test_link.slug)
        assert found_link is None


class TestRecordClick:
    """Test record_click function."""
    
    def test_record_click_basic(self, db_session, test_link, mock_request):
        """Test basic click recording."""
        initial_count = test_link.click_count
        
        record_click(db_session, link=test_link, request=mock_request)
        
        db_session.refresh(test_link)
        assert test_link.click_count == initial_count + 1
        assert test_link.last_clicked_at is not None
    
    def test_record_click_creates_event(self, db_session, test_link, mock_request):
        """Test that a click event is created."""
        initial_event_count = db_session.query(ClickEvent).filter_by(link_id=test_link.id).count()
        
        record_click(db_session, link=test_link, request=mock_request)
        
        event_count = db_session.query(ClickEvent).filter_by(link_id=test_link.id).count()
        assert event_count == initial_event_count + 1
        
        # Check the event details
        event = db_session.query(ClickEvent).filter_by(link_id=test_link.id).order_by(ClickEvent.clicked_at.desc()).first()
        assert event is not None
        assert event.link_id == test_link.id
        assert event.visitor_hash is not None
        assert event.clicked_at is not None
    
    def test_record_click_updates_last_clicked(self, db_session, test_link, mock_request):
        """Test that last_clicked_at is updated."""
        assert test_link.last_clicked_at is None
        
        record_click(db_session, link=test_link, request=mock_request)
        
        db_session.refresh(test_link)
        assert test_link.last_clicked_at is not None
        assert isinstance(test_link.last_clicked_at, datetime)


class TestListLinksForUser:
    """Test list_links_for_user function."""
    
    def test_list_links_for_user_basic(self, db_session, test_user):
        """Test listing links for a user."""
        # Create multiple links
        link1 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/1")
        link2 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/2")
        
        links = list_links_for_user(db_session, user_id=test_user.id, limit=10, offset=0)
        
        assert len(links) >= 2
        link_ids = [l.id for l in links]
        assert link1.id in link_ids
        assert link2.id in link_ids
    
    def test_list_links_for_user_ordered_by_created_at(self, db_session, test_user):
        """Test that links are ordered by created_at descending."""
        link1 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/1")
        # Small delay to ensure different timestamps
        import time
        time.sleep(0.01)
        link2 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/2")
        
        links = list_links_for_user(db_session, user_id=test_user.id, limit=10, offset=0)
        
        # Most recent should be first
        assert links[0].id == link2.id
        assert links[1].id == link1.id
    
    def test_list_links_for_user_pagination(self, db_session, test_user):
        """Test pagination with limit and offset."""
        # Create 5 links
        for i in range(5):
            create_link(db_session, user_id=test_user.id, target_url=f"https://example.com/{i}")
        
        # Get first 2
        links_page1 = list_links_for_user(db_session, user_id=test_user.id, limit=2, offset=0)
        assert len(links_page1) == 2
        
        # Get next 2
        links_page2 = list_links_for_user(db_session, user_id=test_user.id, limit=2, offset=2)
        assert len(links_page2) == 2
        
        # IDs should be different
        page1_ids = {l.id for l in links_page1}
        page2_ids = {l.id for l in links_page2}
        assert page1_ids.isdisjoint(page2_ids)
    
    def test_list_links_for_user_only_own_links(self, db_session, test_user):
        """Test that users only see their own links."""
        # Create another user
        other_user = User(email="other@example.com", display_name="Other User")
        db_session.add(other_user)
        db_session.commit()
        
        # Create links for both users
        my_link = create_link(db_session, user_id=test_user.id, target_url="https://example.com/mine")
        other_link = create_link(db_session, user_id=other_user.id, target_url="https://example.com/other")
        
        links = list_links_for_user(db_session, user_id=test_user.id, limit=10, offset=0)
        
        link_ids = [l.id for l in links]
        assert my_link.id in link_ids
        assert other_link.id not in link_ids


class TestGetLinkForUser:
    """Test get_link_for_user function."""
    
    def test_get_link_for_user_exists(self, db_session, test_link, test_user):
        """Test retrieving a link that belongs to the user."""
        found_link = get_link_for_user(db_session, user_id=test_user.id, link_id=test_link.id)
        
        assert found_link is not None
        assert found_link.id == test_link.id
        assert found_link.user_id == test_user.id
    
    def test_get_link_for_user_not_found(self, db_session, test_user):
        """Test retrieving a non-existent link."""
        found_link = get_link_for_user(db_session, user_id=test_user.id, link_id=99999)
        assert found_link is None
    
    def test_get_link_for_user_wrong_user(self, db_session, test_link):
        """Test that users can't access other users' links."""
        # Create another user
        other_user = User(email="other@example.com", display_name="Other User")
        db_session.add(other_user)
        db_session.commit()
        
        found_link = get_link_for_user(db_session, user_id=other_user.id, link_id=test_link.id)
        assert found_link is None


class TestCountClicksLast24h:
    """Test count_clicks_last_24h function."""
    
    def test_count_clicks_last_24h_no_clicks(self, db_session, test_link):
        """Test counting clicks when there are none."""
        count = count_clicks_last_24h(db_session, link_id=test_link.id)
        assert count == 0
    
    def test_count_clicks_last_24h_with_recent_clicks(self, db_session, test_link, mock_request):
        """Test counting clicks from the last 24 hours."""
        # Record some clicks
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        count = count_clicks_last_24h(db_session, link_id=test_link.id)
        assert count == 2
    
    def test_count_clicks_last_24h_excludes_old_clicks(self, db_session, test_link, mock_request):
        """Test that clicks older than 24 hours are excluded."""
        # Record a click
        record_click(db_session, link=test_link, request=mock_request)
        
        # Manually create an old click event
        old_event = ClickEvent(
            link_id=test_link.id,
            clicked_at=datetime.now(timezone.utc) - timedelta(hours=25),
            visitor_hash="old_hash",
        )
        db_session.add(old_event)
        db_session.commit()
        
        count = count_clicks_last_24h(db_session, link_id=test_link.id)
        # Should only count the recent click, not the old one
        assert count == 1


class TestRecentClickEvents:
    """Test recent_click_events function."""
    
    def test_recent_click_events_basic(self, db_session, test_link, mock_request):
        """Test retrieving recent click events."""
        # Record some clicks
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        events = recent_click_events(db_session, link_id=test_link.id, limit=10)
        
        assert len(events) == 2
        # Should be ordered by clicked_at descending
        assert events[0].clicked_at >= events[1].clicked_at
    
    def test_recent_click_events_limit(self, db_session, test_link, mock_request):
        """Test that limit is respected."""
        # Record 5 clicks
        for _ in range(5):
            record_click(db_session, link=test_link, request=mock_request)
        
        events = recent_click_events(db_session, link_id=test_link.id, limit=3)
        assert len(events) == 3


class TestUpdateLinkStatus:
    """Test update_link_status function."""
    
    def test_update_link_status_activate(self, db_session, test_link, test_user):
        """Test activating a link."""
        test_link.is_active = False
        db_session.commit()
        
        updated_link = update_link_status(db_session, user_id=test_user.id, link_id=test_link.id, is_active=True)
        
        assert updated_link is not None
        assert updated_link.is_active is True
    
    def test_update_link_status_deactivate(self, db_session, test_link, test_user):
        """Test deactivating a link."""
        updated_link = update_link_status(db_session, user_id=test_user.id, link_id=test_link.id, is_active=False)
        
        assert updated_link is not None
        assert updated_link.is_active is False
    
    def test_update_link_status_wrong_user(self, db_session, test_link):
        """Test that users can't update other users' links."""
        other_user = User(email="other@example.com", display_name="Other User")
        db_session.add(other_user)
        db_session.commit()
        
        updated_link = update_link_status(db_session, user_id=other_user.id, link_id=test_link.id, is_active=False)
        assert updated_link is None


class TestAnalyticsFunctions:
    """Test analytics functions."""
    
    def test_get_total_links_for_user(self, db_session, test_user):
        """Test counting total links for a user."""
        assert get_total_links_for_user(db_session, user_id=test_user.id) == 0
        
        create_link(db_session, user_id=test_user.id, target_url="https://example.com/1")
        create_link(db_session, user_id=test_user.id, target_url="https://example.com/2")
        
        assert get_total_links_for_user(db_session, user_id=test_user.id) == 2
    
    def test_get_total_clicks_for_user_no_date_range(self, db_session, test_user, test_link, mock_request):
        """Test counting total clicks without date filtering."""
        # Record some clicks
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        total = get_total_clicks_for_user(db_session, user_id=test_user.id)
        assert total == 2
    
    def test_get_total_clicks_for_user_with_date_range(self, db_session, test_user, test_link, mock_request):
        """Test counting total clicks with date range filtering."""
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=2)
        end_date = now + timedelta(days=1)
        
        # Record clicks
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        total = get_total_clicks_for_user(
            db_session, user_id=test_user.id, start_date=start_date, end_date=end_date
        )
        assert total == 2
    
    def test_get_unique_visitors_for_user(self, db_session, test_user, test_link, mock_request):
        """Test counting unique visitors."""
        # Record clicks from same visitor (same IP/UA = same hash)
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        # Should be 1 unique visitor (same hash)
        unique = get_unique_visitors_for_user(db_session, user_id=test_user.id)
        assert unique == 1
        
        # Create a different request (different IP = different hash)
        different_request = Mock()
        different_request.client = Mock()
        different_request.client.host = "192.168.1.101"  # Different IP
        different_request.headers = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
        
        record_click(db_session, link=test_link, request=different_request)
        
        # Should now be 2 unique visitors
        unique = get_unique_visitors_for_user(db_session, user_id=test_user.id)
        assert unique == 2
    
    def test_get_unique_visitors_for_link(self, db_session, test_link, mock_request):
        """Test counting unique visitors for a specific link."""
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        unique = get_unique_visitors_for_link(db_session, link_id=test_link.id)
        assert unique == 1
    
    def test_get_unique_visitors_per_link(self, db_session, test_user, mock_request):
        """Test getting unique visitors per link."""
        link1 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/1")
        link2 = create_link(db_session, user_id=test_user.id, target_url="https://example.com/2")
        
        # Record clicks on both links
        record_click(db_session, link=link1, request=mock_request)
        record_click(db_session, link=link2, request=mock_request)
        
        result = get_unique_visitors_per_link(db_session, link_ids=[link1.id, link2.id])
        
        assert link1.id in result
        assert link2.id in result
        assert result[link1.id] == 1
        assert result[link2.id] == 1
    
    def test_get_clicks_by_country(self, db_session, test_user, test_link, mock_request):
        """Test getting clicks grouped by country."""
        # Mock the get_country_from_ip to return a specific country
        # Patch it where it's used (in service module) not where it's defined
        from unittest.mock import patch
        
        # Create click events directly with country set, since mocking the function is tricky
        # This tests the aggregation logic without relying on the external function
        from src.models.click_event import ClickEvent
        from src.links.utils import make_visitor_hash, get_ua_raw
        
        ua = get_ua_raw(mock_request)
        ip = mock_request.client.host
        visitor_hash = make_visitor_hash(ip, ua)
        
        # Create events with different countries
        event1 = ClickEvent(
            link_id=test_link.id,
            visitor_hash=visitor_hash,
            country="US",
            clicked_at=datetime.now(timezone.utc),
        )
        event2 = ClickEvent(
            link_id=test_link.id,
            visitor_hash=visitor_hash,
            country="US",
            clicked_at=datetime.now(timezone.utc),
        )
        event3 = ClickEvent(
            link_id=test_link.id,
            visitor_hash=visitor_hash,
            country="GB",
            clicked_at=datetime.now(timezone.utc),
        )
        
        db_session.add(event1)
        db_session.add(event2)
        db_session.add(event3)
        db_session.commit()
        
        # Update link click count
        test_link.click_count = 3
        db_session.commit()
        
        result = get_clicks_by_country(db_session, user_id=test_user.id)
        
        # Should have entries for both countries
        country_codes = [r["country_code"] for r in result]
        assert "US" in country_codes
        assert "GB" in country_codes
        
        # US should have 2 clicks, GB should have 1
        us_data = next(r for r in result if r["country_code"] == "US")
        gb_data = next(r for r in result if r["country_code"] == "GB")
        assert us_data["clicks"] == 2
        assert gb_data["clicks"] == 1
    
    def test_get_clicks_time_series(self, db_session, test_user, test_link, mock_request):
        """Test getting time series data."""
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=1)
        end_date = now + timedelta(hours=1)
        
        # Record some clicks
        record_click(db_session, link=test_link, request=mock_request)
        record_click(db_session, link=test_link, request=mock_request)
        
        result = get_clicks_time_series(
            db_session, user_id=test_user.id, start_date=start_date, end_date=end_date, granularity="hour"
        )
        
        assert len(result) > 0
        assert "timestamp" in result[0]
        assert "value" in result[0]
        assert result[0]["value"] > 0
    
    def test_get_previous_period_metrics(self, db_session, test_user, test_link, mock_request):
        """Test getting previous period metrics."""
        now = datetime.now(timezone.utc)
        current_start = now - timedelta(days=7)
        current_end = now
        
        # Record some clicks in current period
        record_click(db_session, link=test_link, request=mock_request)
        
        result = get_previous_period_metrics(
            db_session, user_id=test_user.id, current_start=current_start, current_end=current_end
        )
        
        assert "total_clicks" in result
        assert "total_links" in result
        assert "unique_visitors" in result
        assert isinstance(result["total_clicks"], int)
        assert isinstance(result["total_links"], int)
        assert isinstance(result["unique_visitors"], int)


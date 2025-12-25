"""
Pytest configuration and shared fixtures for all tests.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment variables before importing app modules
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test_client_id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test_client_secret")
os.environ.setdefault("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
os.environ.setdefault("SESSION_SECRET_KEY", "test_secret_key_for_testing_only")

# Import all models to ensure they're registered with SQLAlchemy Base
import src.models.user
import src.models.oauth_account
import src.models.link
import src.models.click_event

from src.main import app
from src.db.session import Base, get_db

# Create a test database (temporary file-based SQLite for testing)
# File-based ensures all connections share the same database
import tempfile

# Create a temporary database file
temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
temp_db.close()
TEST_DATABASE_URL = f"sqlite:///{temp_db.name}"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Clean up function to delete temp file
def cleanup_test_db():
    try:
        if os.path.exists(temp_db.name):
            os.unlink(temp_db.name)
    except Exception:
        pass
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Create a fresh database session for each test.
    Creates all tables and cleans up after test.
    """
    # Drop any existing tables first (in case of previous test failure)
    Base.metadata.drop_all(bind=test_engine)
    
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create a new session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()  # Rollback any uncommitted changes
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a test client with database dependency overridden.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # Don't close, we manage it in the fixture
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up dependency override
    app.dependency_overrides.clear()


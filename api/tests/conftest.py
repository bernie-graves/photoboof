import pytest
import os
import sys
from pathlib import Path

# Add the api directory to the path so we can import the api module
sys.path.insert(0, str(Path(__file__).parent.parent))

from api import create_app, db
from api.models import Template, Photo


@pytest.fixture(scope='function')
def app():
    """Create and configure a new app instance for each test."""
    # Set test configuration
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['AWS_ACCESS_KEY_ID'] = 'test-key'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'test-secret'
    os.environ['S3_BUCKET_NAME'] = 'test-bucket'
    os.environ['TESTING'] = 'true'
    
    # Create fresh app instance
    app = create_app()
    app.config['TESTING'] = True
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's CLI commands."""
    return app.test_cli_runner()


@pytest.fixture
def sample_template(app):
    """Create a sample template for testing."""
    with app.app_context():
        template = Template(
            name='Test Template',
            filename='test_template.png'
        )
        db.session.add(template)
        db.session.commit()
        # Store ID and create a dict representation instead of returning the object
        return {
            'id': template.id,
            'name': template.name,
            'filename': template.filename
        }


@pytest.fixture
def sample_photo(app, sample_template):
    """Create a sample photo for testing."""
    with app.app_context():
        photo = Photo(
            filename='test_photo.png',
            template_id=sample_template['id'],
            session_id='test-session-123'
        )
        db.session.add(photo)
        db.session.commit()
        # Store ID and create a dict representation instead of returning the object
        return {
            'id': photo.id,
            'filename': photo.filename,
            'template_id': photo.template_id,
            'session_id': photo.session_id
        }

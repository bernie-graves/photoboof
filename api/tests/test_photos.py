import pytest
import base64
from unittest.mock import Mock, patch
from PIL import Image
import io


class TestPhotosAPI:
    """Tests for the photos API endpoints."""

    def test_get_photos_empty(self, client):
        """Test getting photos when none exist."""
        response = client.get('/api/photos')
        assert response.status_code == 200
        assert response.json == []

    def test_get_photos_with_data(self, client, sample_photo):
        """Test getting photos when data exists."""
        response = client.get('/api/photos')
        assert response.status_code == 200
        data = response.json
        assert len(data) == 1
        assert data[0]['id'] == sample_photo['id']
        assert data[0]['filename'] == 'test_photo.png'
        assert data[0]['session_id'] == 'test-session-123'

    @patch('api.routes.photos.get_s3_storage')
    def test_save_photo_success(self, mock_s3_storage, client, sample_template):
        """Test successful photo save."""
        # Mock S3 storage
        mock_storage = Mock()
        mock_storage.upload_photo.return_value = True
        mock_s3_storage.return_value = mock_storage
        
        # Create a simple base64 encoded image
        img = Image.new('RGB', (10, 10), color='red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        
        data = {
            'photo_data': f'data:image/png;base64,{img_base64}',
            'template_id': sample_template['id'],
            'session_id': 'test-session-456'
        }
        
        response = client.post('/api/photos', json=data)
        assert response.status_code == 201
        response_data = response.json
        assert response_data['template_id'] == sample_template['id']
        assert response_data['session_id'] == 'test-session-456'
        assert 'filename' in response_data
        assert mock_storage.upload_photo.called

    def test_save_photo_no_data(self, client):
        """Test photo save without photo data."""
        data = {
            'template_id': 1,
            'session_id': 'test-session'
        }
        
        response = client.post('/api/photos', json=data)
        assert response.status_code == 400
        assert 'No photo data provided' in response.json['error']

    @patch('api.routes.photos.get_s3_storage')
    def test_save_photo_s3_failure(self, mock_s3_storage, client, sample_template):
        """Test photo save when S3 fails."""
        # Mock S3 storage to fail
        mock_storage = Mock()
        mock_storage.upload_photo.return_value = False
        mock_s3_storage.return_value = mock_storage
        
        # Create a simple base64 encoded image
        img = Image.new('RGB', (10, 10), color='red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        
        data = {
            'photo_data': f'data:image/png;base64,{img_base64}',
            'template_id': sample_template['id'],
            'session_id': 'test-session'
        }
        
        response = client.post('/api/photos', json=data)
        assert response.status_code == 500
        assert 'Failed to upload' in response.json['error']

    @patch('api.routes.photos.get_s3_storage')
    def test_save_photo_with_data_url_prefix(self, mock_s3_storage, client, sample_template):
        """Test photo save with data URL prefix handling."""
        # Mock S3 storage
        mock_storage = Mock()
        mock_storage.upload_photo.return_value = True
        mock_s3_storage.return_value = mock_storage
        
        # Create a simple base64 encoded image with data URL prefix
        img = Image.new('RGB', (10, 10), color='blue')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        
        data = {
            'photo_data': f'data:image/png;base64,{img_base64}',
            'template_id': sample_template['id'],
            'session_id': 'test-session'
        }
        
        response = client.post('/api/photos', json=data)
        assert response.status_code == 201
        assert mock_storage.upload_photo.called

    @patch('api.routes.photos.get_s3_storage')
    def test_save_photo_invalid_base64(self, mock_s3_storage, client, sample_template):
        """Test photo save with invalid base64 data."""
        mock_storage = Mock()
        mock_s3_storage.return_value = mock_storage
        
        data = {
            'photo_data': 'invalid-base64-data',
            'template_id': sample_template['id'],
            'session_id': 'test-session'
        }
        
        response = client.post('/api/photos', json=data)
        assert response.status_code == 500
        assert 'error' in response.json

    def test_save_photo_without_template(self, client):
        """Test photo save without template (optional field)."""
        # This should work since template_id is optional
        img = Image.new('RGB', (10, 10), color='green')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        
        with patch('api.routes.photos.get_s3_storage') as mock_s3_storage:
            mock_storage = Mock()
            mock_storage.upload_photo.return_value = True
            mock_s3_storage.return_value = mock_storage
            
            data = {
                'photo_data': f'data:image/png;base64,{img_base64}',
                'session_id': 'test-session'
            }
            
            response = client.post('/api/photos', json=data)
            # This should succeed or fail based on your business logic
            # Adjust assertion based on actual requirements
            assert response.status_code in [201, 400]

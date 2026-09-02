import pytest
import io
from unittest.mock import Mock, patch


class TestTemplatesAPI:
    """Tests for the templates API endpoints."""

    def test_get_templates_empty(self, client):
        """Test getting templates when none exist."""
        response = client.get('/api/templates')
        assert response.status_code == 200
        assert response.json == []

    def test_get_templates_with_data(self, client, sample_template):
        """Test getting templates when data exists."""
        response = client.get('/api/templates')
        assert response.status_code == 200
        data = response.json
        assert len(data) == 1
        assert data[0]['id'] == sample_template['id']
        assert data[0]['name'] == 'Test Template'
        assert data[0]['filename'] == 'test_template.png'

    @patch('api.routes.templates.get_s3_storage')
    def test_upload_template_success(self, mock_s3_storage, client):
        """Test successful template upload."""
        # Mock S3 storage
        mock_storage = Mock()
        mock_storage.upload_template.return_value = True
        mock_s3_storage.return_value = mock_storage
        
        # Create a mock file
        data = {
            'file': (io.BytesIO(b'fake image data'), 'test.png'),
            'name': 'New Template'
        }
        
        response = client.post('/api/templates', data=data, content_type='multipart/form-data')
        assert response.status_code == 201
        response_data = response.json
        assert response_data['name'] == 'New Template'
        assert 'filename' in response_data
        assert mock_storage.upload_template.called

    def test_upload_template_no_file(self, client):
        """Test template upload without file."""
        response = client.post('/api/templates', data={}, content_type='multipart/form-data')
        assert response.status_code == 400
        assert 'error' in response.json

    def test_upload_template_empty_filename(self, client):
        """Test template upload with empty filename."""
        data = {
            'file': (io.BytesIO(b'fake image data'), ''),
            'name': 'Test Template'
        }
        
        response = client.post('/api/templates', data=data, content_type='multipart/form-data')
        assert response.status_code == 400
        assert 'error' in response.json

    def test_upload_template_non_png(self, client):
        """Test template upload with non-PNG file."""
        data = {
            'file': (io.BytesIO(b'fake image data'), 'test.jpg'),
            'name': 'Test Template'
        }
        
        response = client.post('/api/templates', data=data, content_type='multipart/form-data')
        assert response.status_code == 400
        assert 'Only PNG files are allowed' in response.json['error']

    @patch('api.routes.templates.get_s3_storage')
    def test_upload_template_s3_failure(self, mock_s3_storage, client):
        """Test template upload when S3 fails."""
        # Mock S3 storage to fail
        mock_storage = Mock()
        mock_storage.upload_template.return_value = False
        mock_s3_storage.return_value = mock_storage
        
        data = {
            'file': (io.BytesIO(b'fake image data'), 'test.png'),
            'name': 'Test Template'
        }
        
        response = client.post('/api/templates', data=data, content_type='multipart/form-data')
        assert response.status_code == 500
        assert 'Failed to upload' in response.json['error']

    @patch('api.routes.templates.get_s3_storage')
    def test_delete_template_success(self, mock_s3_storage, client, sample_template):
        """Test successful template deletion."""
        # Mock S3 storage
        mock_storage = Mock()
        mock_storage.delete_template.return_value = True
        mock_s3_storage.return_value = mock_storage
        
        response = client.delete(f"/api/templates/{sample_template['id']}")
        assert response.status_code == 200
        assert mock_storage.delete_template.called

    @patch('api.routes.templates.get_s3_storage')
    def test_delete_template_not_found(self, mock_s3_storage, client):
        """Test deleting non-existent template."""
        mock_storage = Mock()
        mock_s3_storage.return_value = mock_storage
        
        response = client.delete('/api/templates/99999')
        assert response.status_code == 404

    @patch('api.routes.templates.get_s3_storage')
    def test_delete_template_s3_failure(self, mock_s3_storage, client, sample_template):
        """Test template deletion when S3 fails."""
        # Mock S3 storage to fail
        mock_storage = Mock()
        mock_storage.delete_template.return_value = False
        mock_s3_storage.return_value = mock_storage
        
        response = client.delete(f"/api/templates/{sample_template['id']}")
        # The delete should still succeed from DB perspective
        assert response.status_code == 200

import pytest
from unittest.mock import Mock, patch, MagicMock
from botocore.exceptions import ClientError
import io


class TestS3Storage:
    """Tests for the S3 storage service."""

    @patch('api.services.s3_storage.Config')
    def test_s3_storage_init_without_credentials(self, mock_config):
        """Test S3Storage initialization fails without credentials."""
        mock_config.USE_S3 = False
        
        from api.services.s3_storage import S3Storage
        
        with pytest.raises(ValueError, match="S3 is not configured"):
            S3Storage()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_s3_storage_init_success(self, mock_config, mock_boto3_client):
        """Test successful S3Storage initialization."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        assert storage.bucket_name == 'test-bucket'
        mock_boto3_client.assert_called_once()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_upload_template_success(self, mock_config, mock_boto3_client):
        """Test successful template upload."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        mock_config.S3_TEMPLATES_PREFIX = 'templates/'
        
        mock_s3_client = Mock()
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        mock_file = io.BytesIO(b'test data')
        
        result = storage.upload_template(mock_file, 'test.png')
        
        assert result is True
        mock_s3_client.upload_fileobj.assert_called_once()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_upload_template_failure(self, mock_config, mock_boto3_client):
        """Test template upload failure."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        mock_config.S3_TEMPLATES_PREFIX = 'templates/'
        
        mock_s3_client = Mock()
        mock_s3_client.upload_fileobj.side_effect = ClientError({}, 'UploadFile')
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        mock_file = io.BytesIO(b'test data')
        
        result = storage.upload_template(mock_file, 'test.png')
        
        assert result is False

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_delete_template_success(self, mock_config, mock_boto3_client):
        """Test successful template deletion."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        mock_config.S3_TEMPLATES_PREFIX = 'templates/'
        
        mock_s3_client = Mock()
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        result = storage.delete_template('test.png')
        
        assert result is True
        mock_s3_client.delete_object.assert_called_once()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_upload_photo_success(self, mock_config, mock_boto3_client):
        """Test successful photo upload."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        mock_config.S3_UPLOADS_PREFIX = 'uploads/'
        
        mock_s3_client = Mock()
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        image_data = b'test image data'
        
        result = storage.upload_photo(image_data, 'photo.png')
        
        assert result is True
        mock_s3_client.put_object.assert_called_once()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_get_template_url_success(self, mock_config, mock_boto3_client):
        """Test successful template URL generation."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        mock_config.S3_TEMPLATES_PREFIX = 'templates/'
        
        mock_s3_client = Mock()
        mock_s3_client.generate_presigned_url.return_value = 'https://test-url.com'
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        url = storage.get_template_url('test.png')
        
        assert url == 'https://test-url.com'
        mock_s3_client.generate_presigned_url.assert_called_once()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_get_template_url_failure(self, mock_config, mock_boto3_client):
        """Test template URL generation failure."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        mock_config.S3_TEMPLATES_PREFIX = 'templates/'
        
        mock_s3_client = Mock()
        mock_s3_client.generate_presigned_url.side_effect = ClientError({}, 'GeneratePresignedUrl')
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        url = storage.get_template_url('test.png')
        
        assert url is None

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_file_exists_true(self, mock_config, mock_boto3_client):
        """Test file exists check returns True."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        
        mock_s3_client = Mock()
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        exists = storage.file_exists('test.png', 'uploads/')
        
        assert exists is True
        mock_s3_client.head_object.assert_called_once()

    @patch('api.services.s3_storage.boto3.client')
    @patch('api.services.s3_storage.Config')
    def test_file_exists_false(self, mock_config, mock_boto3_client):
        """Test file exists check returns False."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        
        mock_s3_client = Mock()
        mock_s3_client.head_object.side_effect = ClientError({}, 'HeadObject')
        mock_boto3_client.return_value = mock_s3_client
        
        from api.services.s3_storage import S3Storage
        
        storage = S3Storage()
        exists = storage.file_exists('test.png', 'uploads/')
        
        assert exists is False

    @patch('api.services.s3_storage.Config')
    def test_get_s3_storage_singleton(self, mock_config):
        """Test that get_s3_storage returns singleton instance."""
        mock_config.USE_S3 = True
        mock_config.AWS_ACCESS_KEY_ID = 'test-key'
        mock_config.AWS_SECRET_ACCESS_KEY = 'test-secret'
        mock_config.AWS_REGION = 'us-east-2'
        mock_config.S3_BUCKET_NAME = 'test-bucket'
        
        with patch('api.services.s3_storage.S3Storage') as mock_s3_class:
            mock_instance = Mock()
            mock_s3_class.return_value = mock_instance
            
            from api.services.s3_storage import get_s3_storage
            
            # First call should create instance
            storage1 = get_s3_storage()
            # Second call should return same instance
            storage2 = get_s3_storage()
            
            assert storage1 is storage2
            mock_s3_class.assert_called_once()

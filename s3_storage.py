import boto3
import os
from config import Config
from botocore.exceptions import ClientError

class S3Storage:
    def __init__(self):
        if not Config.USE_S3:
            raise ValueError("S3 is not configured. Please set AWS credentials and bucket name.")
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
            region_name=Config.AWS_REGION
        )
        self.bucket_name = Config.S3_BUCKET_NAME
    
    def upload_template(self, file, filename):
        """Upload a template file to S3"""
        key = f"{Config.S3_TEMPLATES_PREFIX}{filename}"
        try:
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs={'ContentType': 'image/png'}
            )
            return True
        except ClientError as e:
            print(f"Error uploading template to S3: {e}")
            return False
    
    def delete_template(self, filename):
        """Delete a template file from S3"""
        key = f"{Config.S3_TEMPLATES_PREFIX}{filename}"
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            print(f"Error deleting template from S3: {e}")
            return False
    
    def upload_photo(self, image_data, filename):
        """Upload a photo to S3"""
        key = f"{Config.S3_UPLOADS_PREFIX}{filename}"
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=image_data,
                ContentType='image/png'
            )
            return True
        except ClientError as e:
            print(f"Error uploading photo to S3: {e}")
            return False
    
    def get_template_url(self, filename, expires_in=3600):
        """Generate a presigned URL for a template"""
        key = f"{Config.S3_TEMPLATES_PREFIX}{filename}"
        try:
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
        except ClientError as e:
            print(f"Error generating template URL: {e}")
            return None
    
    def get_photo_url(self, filename, expires_in=3600):
        """Generate a presigned URL for a photo"""
        key = f"{Config.S3_UPLOADS_PREFIX}{filename}"
        try:
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
        except ClientError as e:
            print(f"Error generating photo URL: {e}")
            return None
    
    def list_templates(self):
        """List all templates in S3"""
        prefix = Config.S3_TEMPLATES_PREFIX
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            if 'Contents' in response:
                return [obj['Key'].replace(prefix, '') for obj in response['Contents'] if obj['Key'] != prefix]
            return []
        except ClientError as e:
            print(f"Error listing templates: {e}")
            return []
    
    def list_photos(self):
        """List all photos in S3"""
        prefix = Config.S3_UPLOADS_PREFIX
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            if 'Contents' in response:
                return [obj['Key'].replace(prefix, '') for obj in response['Contents'] if obj['Key'] != prefix]
            return []
        except ClientError as e:
            print(f"Error listing photos: {e}")
            return []
    
    def file_exists(self, filename, prefix):
        """Check if a file exists in S3"""
        key = f"{prefix}{filename}"
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False

# Global S3 storage instance
s3_storage = None

def get_s3_storage():
    """Get or create the S3 storage instance"""
    global s3_storage
    if s3_storage is None and Config.USE_S3:
        s3_storage = S3Storage()
    return s3_storage
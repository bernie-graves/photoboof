import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'admin123'
    
    # Database
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    if not DATABASE_URL:
        DATABASE_URL = 'sqlite:///photoboof.db'
    
    # Storage paths
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
    UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
    TEMP_DIR = os.path.join(BASE_DIR, 'temp')
    
    # Photobooth settings
    COUNTDOWN_SECONDS = 3
    PHOTOS_PER_SESSION = 4
    
    # Camera proxy (for Raspberry Pi)
    CAMERA_PROXY_URL = os.environ.get('CAMERA_PROXY_URL')
    
    # Render deployment
    RENDER = os.environ.get('RENDER') == 'true'
    
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-2')
    S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', 'photobooth-abby-bernie')
    S3_TEMPLATES_PREFIX = 'templates/'
    S3_UPLOADS_PREFIX = 'uploads/'
    
    # Use S3 if credentials are provided
    USE_S3 = bool(AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME)
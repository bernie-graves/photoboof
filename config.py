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
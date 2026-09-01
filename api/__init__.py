from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from .config import Config
import os

# Initialize extensions
db = SQLAlchemy()

def create_app():
    """Application factory pattern for Flask app"""
    app = Flask(__name__, static_folder='../react-frontend/dist')
    app.config.from_object(Config)

    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DATABASE_URL']
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    CORS(app)
    db.init_app(app)

    # Import models and create tables
    with app.app_context():
        from .models import Template, Photo
        db.create_all()

    # Register blueprints
    from .routes.templates import templates_bp
    from .routes.photos import photos_bp
    from .routes.static import static_bp
    
    app.register_blueprint(templates_bp)
    app.register_blueprint(photos_bp)
    app.register_blueprint(static_bp)

    return app

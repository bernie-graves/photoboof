from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os
import base64
from datetime import datetime
from PIL import Image
import io
from s3_storage import get_s3_storage

app = Flask(__name__, static_folder='react-frontend/dist')
app.config.from_object(Config)

# Fix PostgreSQL URL format for SQLAlchemy
if app.config['DATABASE_URL'] and app.config['DATABASE_URL'].startswith('postgres://'):
    app.config['DATABASE_URL'] = app.config['DATABASE_URL'].replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

# Initialize database
db = SQLAlchemy(app)

# Database models
class Template(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'filename': self.filename,
            'upload_date': self.upload_date.isoformat()
        }

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('template.id'))
    capture_date = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100))
    
    template = db.relationship('Template', backref='photos')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'template_id': self.template_id,
            'capture_date': self.capture_date.isoformat(),
            'session_id': self.session_id
        }

# Create tables (only for SQLite)
if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI']:
    with app.app_context():
        db.create_all()

# Routes
@app.route('/')
def index():
    return send_from_directory('react-frontend/dist', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Try to serve the file directly if it exists
    try:
        return send_from_directory('react-frontend/dist', path)
    except:
        # If file doesn't exist, serve index.html for client-side routing
        return send_from_directory('react-frontend/dist', 'index.html')

@app.route('/api/templates', methods=['GET'])
def get_templates():
    templates = Template.query.all()
    return jsonify([t.to_dict() for t in templates])

@app.route('/api/templates', methods=['POST'])
def upload_template():
    # Admin authentication would go here
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    name = request.form.get('name', file.filename)
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.png'):
        return jsonify({'error': 'Only PNG files are allowed'}), 400
    
    filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
    
    # Use S3 if configured, otherwise local filesystem
    if Config.USE_S3:
        s3 = get_s3_storage()
        if s3.upload_template(file, filename):
            template = Template(name=name, filename=filename)
            db.session.add(template)
            db.session.commit()
            return jsonify(template.to_dict()), 201
        else:
            return jsonify({'error': 'Failed to upload template to S3'}), 500
    else:
        filepath = os.path.join(Config.TEMPLATES_DIR, filename)
        file.save(filepath)
        
        template = Template(name=name, filename=filename)
        db.session.add(template)
        db.session.commit()
        
        return jsonify(template.to_dict()), 201

@app.route('/api/templates/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    # Admin authentication would go here
    template = Template.query.get_or_404(template_id)
    
    # Delete file from S3 or local filesystem
    if Config.USE_S3:
        s3 = get_s3_storage()
        s3.delete_template(template.filename)
    else:
        filepath = os.path.join(Config.TEMPLATES_DIR, template.filename)
        if os.path.exists(filepath):
            os.remove(filepath)
    
    db.session.delete(template)
    db.session.commit()
    
    return jsonify({'message': 'Template deleted'})

@app.route('/api/photos', methods=['POST'])
def save_photo():
    data = request.json
    photo_data = data.get('photo_data')  # Base64 encoded image
    template_id = data.get('template_id')
    session_id = data.get('session_id')
    
    if not photo_data:
        return jsonify({'error': 'No photo data provided'}), 400
    
    # Decode base64 and save photo
    try:
        # Remove data URL prefix if present
        if ',' in photo_data:
            photo_data = photo_data.split(',')[1]
        
        image_data = base64.b64decode(photo_data)
        image = Image.open(io.BytesIO(image_data))
        
        filename = f"{datetime.utcnow().timestamp()}.png"
        
        # Use S3 if configured, otherwise local filesystem
        if Config.USE_S3:
            s3 = get_s3_storage()
            # Convert PIL image to bytes for S3 upload
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            if s3.upload_photo(img_byte_arr.read(), filename):
                photo = Photo(
                    filename=filename,
                    template_id=template_id,
                    session_id=session_id
                )
                db.session.add(photo)
                db.session.commit()
                return jsonify(photo.to_dict()), 201
            else:
                return jsonify({'error': 'Failed to upload photo to S3'}), 500
        else:
            filepath = os.path.join(Config.UPLOADS_DIR, filename)
            image.save(filepath)
            
            photo = Photo(
                filename=filename,
                template_id=template_id,
                session_id=session_id
            )
            db.session.add(photo)
            db.session.commit()
            
            return jsonify(photo.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/photos', methods=['GET'])
def get_photos():
    photos = Photo.query.order_by(Photo.capture_date.desc()).all()
    return jsonify([p.to_dict() for p in photos])

@app.route('/uploads/<filename>')
def serve_upload(filename):
    if Config.USE_S3:
        s3 = get_s3_storage()
        # URL decode the filename since Flask routes are URL-encoded
        from urllib.parse import unquote
        decoded_filename = unquote(filename)
        url = s3.get_photo_url(decoded_filename)
        if url:
            return redirect(url)
        else:
            return jsonify({'error': 'Photo not found'}), 404
    else:
        return send_from_directory(Config.UPLOADS_DIR, filename)

@app.route('/templates/<filename>')
def serve_template(filename):
    if Config.USE_S3:
        s3 = get_s3_storage()
        # URL decode the filename since Flask routes are URL-encoded
        from urllib.parse import unquote
        decoded_filename = unquote(filename)
        url = s3.get_template_url(decoded_filename)
        if url:
            return redirect(url)
        else:
            return jsonify({'error': 'Template not found'}), 404
    else:
        return send_from_directory(Config.TEMPLATES_DIR, filename)

if __name__ == '__main__':
    # Create directories if they don't exist (only for local development)
    if not Config.USE_S3:
        os.makedirs(Config.TEMPLATES_DIR, exist_ok=True)
        os.makedirs(Config.UPLOADS_DIR, exist_ok=True)
        os.makedirs(Config.TEMP_DIR, exist_ok=True)
    os.makedirs('react-frontend/dist', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
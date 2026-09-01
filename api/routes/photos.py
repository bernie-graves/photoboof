from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models import Photo
from .. import db
from ..services.s3_storage import get_s3_storage
import base64
from PIL import Image
import io

photos_bp = Blueprint('photos', __name__, url_prefix='/api/photos')

@photos_bp.route('', methods=['POST'])
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
        
        # Use S3 for file storage
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
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@photos_bp.route('', methods=['GET'])
def get_photos():
    photos = Photo.query.order_by(Photo.capture_date.desc()).all()
    return jsonify([p.to_dict() for p in photos])

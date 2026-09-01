from flask import Blueprint, send_from_directory, redirect, jsonify
from ..services.s3_storage import get_s3_storage
from urllib.parse import unquote

static_bp = Blueprint('static', __name__)

@static_bp.route('/')
def index():
    return send_from_directory('../react-frontend/dist', 'index.html')

@static_bp.route('/<path:path>')
def serve_static(path):
    # Try to serve the file directly if it exists
    try:
        return send_from_directory('../react-frontend/dist', path)
    except:
        # If file doesn't exist, serve index.html for client-side routing
        return send_from_directory('../react-frontend/dist', 'index.html')

@static_bp.route('/uploads/<filename>')
def serve_upload(filename):
    s3 = get_s3_storage()
    # URL decode the filename since Flask routes are URL-encoded
    decoded_filename = unquote(filename)
    url = s3.get_photo_url(decoded_filename)
    if url:
        return redirect(url)
    else:
        return jsonify({'error': 'Photo not found'}), 404

@static_bp.route('/templates/<filename>')
def serve_template(filename):
    s3 = get_s3_storage()
    # URL decode the filename since Flask routes are URL-encoded
    decoded_filename = unquote(filename)
    url = s3.get_template_url(decoded_filename)
    if url:
        return redirect(url)
    else:
        return jsonify({'error': 'Template not found'}), 404

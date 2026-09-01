from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models import Template
from .. import db
from ..services.s3_storage import get_s3_storage

templates_bp = Blueprint('templates', __name__, url_prefix='/api/templates')

@templates_bp.route('', methods=['GET'])
def get_templates():
    templates = Template.query.all()
    return jsonify([t.to_dict() for t in templates])

@templates_bp.route('', methods=['POST'])
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
    
    # Use S3 for file storage
    s3 = get_s3_storage()
    if s3.upload_template(file, filename):
        template = Template(name=name, filename=filename)
        db.session.add(template)
        db.session.commit()
        return jsonify(template.to_dict()), 201
    else:
        return jsonify({'error': 'Failed to upload template to S3'}), 500

@templates_bp.route('/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    # Admin authentication would go here
    template = Template.query.get_or_404(template_id)
    
    # Delete file from S3
    s3 = get_s3_storage()
    s3.delete_template(template.filename)
    
    db.session.delete(template)
    db.session.commit()
    
    return jsonify({'message': 'Template deleted'})

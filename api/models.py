from datetime import datetime
from . import db

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

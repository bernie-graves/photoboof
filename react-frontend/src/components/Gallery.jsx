import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Calendar } from 'lucide-react'
import './Gallery.css'

function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = () => {
    fetch('/api/photos')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch photos')
        }
        return res.json()
      })
      .then(data => {
        setPhotos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch photos:', err)
        setPhotos([])
        setLoading(false)
      })
  }

  const handleDownload = (photo) => {
    if (!photo || !photo.filename) {
      console.error('Invalid photo data for download')
      return
    }
    const link = document.createElement('a')
    link.href = `/uploads/${photo.filename}`
    link.download = photo.filename
    link.click()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="gallery loading">
        <p>Loading gallery...</p>
      </div>
    )
  }

  return (
    <div className="gallery">
      <header className="gallery-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
          Back
        </Link>
        <h1>Photo Gallery</h1>
        <div className="spacer"></div>
      </header>

      <main className="gallery-main">
        {!photos || photos.length === 0 ? (
          <div className="no-photos">
            <p>No photos yet. Be the first to use the photobooth!</p>
            <Link to="/photobooth" className="btn btn-primary">
              Start Photobooth
            </Link>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map(photo => (
              photo.filename && (
                <div 
                  key={photo.id}
                  className="photo-card"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img 
                    src={`/uploads/${photo.filename}`}
                    alt="Photobooth photo"
                    className="photo-thumbnail"
                  />
                  <div className="photo-info">
                    <Calendar size={16} />
                    <span>{formatDate(photo.capture_date)}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && selectedPhoto.filename && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="close-button"
              onClick={() => setSelectedPhoto(null)}
            >
              ×
            </button>
            <img 
              src={`/uploads/${selectedPhoto.filename}`}
              alt="Full size photo"
              className="modal-image"
            />
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handleDownload(selectedPhoto)}
              >
                <Download size={20} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
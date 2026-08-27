import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Image as ImageIcon, Loader } from 'lucide-react'
import './LandingPage.css'

function LandingPage() {
  const [recentPhotos, setRecentPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentPhotos()
  }, [])

  const fetchRecentPhotos = () => {
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => {
        // Get the 6 most recent photos
        setRecentPhotos(data.slice(0, 6))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch recent photos:', err)
        setLoading(false)
      })
  }

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Wedding Photobooth</h1>
        <p>Capture memories at Abby & Bernie's wedding</p>
        
        <div className="action-buttons">
          <Link to="/photobooth" className="btn btn-primary">
            <Camera size={24} />
            Start Photobooth
          </Link>
          <Link to="/gallery" className="btn btn-secondary">
            <ImageIcon size={24} />
            View Gallery
          </Link>
        </div>
      </div>
      
      <div className="preview-section">
        <h2>Recent Photos</h2>
        <div className="photo-grid">
          {loading ? (
            <div className="placeholder">
              <Loader className="spinner" size={32} />
              <p>Loading recent photos...</p>
            </div>
          ) : recentPhotos.length === 0 ? (
            <div className="placeholder">
              <p>No photos yet. Be the first to use the photobooth!</p>
            </div>
          ) : (
            recentPhotos.map(photo => (
              <Link key={photo.id} to="/gallery" className="photo-card">
                <img 
                  src={`/uploads/${photo.filename}`}
                  alt="Recent photobooth photo"
                  className="photo-thumbnail"
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
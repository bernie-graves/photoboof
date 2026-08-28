import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Calendar, X } from 'lucide-react'
import BotanicalDivider from './botanical/BotanicalDivider'
import { handleDownload as handleDownloadWithShare } from '../utils/downloadHelper'

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
    handleDownloadWithShare(`/uploads/${photo.filename}`, photo.filename)
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
      <div className="flex min-h-screen items-center justify-center bg-bone">
        <p className="text-muted">Loading gallery…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-line">
        <div className="container-page flex items-center justify-between gap-4 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.12em] text-muted motion-safe:transition-colors motion-safe:duration-200 hover:text-sage-deep"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl">Photo Gallery</h1>
          <span className="w-16" aria-hidden="true" />
        </div>
      </header>

      <main className="container-page section-y">
        {!photos || photos.length === 0 ? (
          <div className="card-paper mx-auto max-w-2xl px-6 py-16 text-center">
            <p className="mx-auto max-w-[65ch] text-muted">
              No photos yet. Be the first to use the photobooth.
            </p>
            <Link to="/photobooth" className="btn-primary mt-8">
              Start Photobooth
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {photos.map(photo => (
                photo.filename && (
                  <button
                    key={photo.id}
                    type="button"
                    className="card-paper block w-full overflow-hidden p-2 text-left motion-safe:transition-colors motion-safe:duration-200 hover:border-sage"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={`/uploads/${photo.filename}`}
                      alt="Photobooth photo"
                      className="aspect-[2/3] w-full bg-bone object-cover"
                    />
                    <span className="mt-3 flex items-center gap-2 px-1 pb-1 font-sans text-xs uppercase tracking-[0.12em] text-muted">
                      <Calendar size={14} aria-hidden="true" />
                      {formatDate(photo.capture_date)}
                    </span>
                  </button>
                )
              ))}
            </div>
            <BotanicalDivider className="mt-16" />
          </>
        )}
      </main>

      {selectedPhoto && selectedPhoto.filename && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-md border border-line bg-bone p-4 md:p-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close photo"
              className="absolute right-3 top-3 rounded-md border border-line bg-bone p-2 text-muted motion-safe:transition-colors motion-safe:duration-200 hover:border-sage-deep hover:text-sage-deep"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={18} />
            </button>
            <img
              src={`/uploads/${selectedPhoto.filename}`}
              alt="Full size photo"
              className="mx-auto max-h-[70vh] w-auto"
            />
            <div className="mt-6 flex justify-center">
              <button className="btn-primary" onClick={() => handleDownload(selectedPhoto)}>
                <Download size={16} />
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

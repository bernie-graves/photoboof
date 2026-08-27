import { Download, Share2, RotateCcw } from 'lucide-react'
import './ResultDisplay.css'

function ResultDisplay({ image, onRetake, onSave }) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image
    link.download = `photobooth-${Date.now()}.png`
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Photobooth',
          text: 'Check out my photo from Abby & Bernie\'s wedding!',
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback - copy to clipboard
      alert('Sharing not supported on this browser. You can download the photo instead.')
    }
  }

  return (
    <div className="result-display">
      <h2>Your Photo is Ready!</h2>
      
      <div className="result-image-container">
        <img src={image} alt="Final photobooth photo" className="result-image" />
      </div>

      <div className="result-actions">
        <button className="btn btn-secondary" onClick={onRetake}>
          <RotateCcw size={20} />
          Retake
        </button>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={20} />
          Download
        </button>
        <button className="btn btn-primary" onClick={handleShare}>
          <Share2 size={20} />
          Share
        </button>
        <button className="btn btn-success" onClick={onSave}>
          Save to Gallery
        </button>
      </div>
    </div>
  )
}

export default ResultDisplay
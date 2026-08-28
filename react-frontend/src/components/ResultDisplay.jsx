import { Download, Share2, RotateCcw, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import EucalyptusSprig from './botanical/EucalyptusSprig'

function ResultDisplay({ image, onRetake }) {
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
    <div className="relative mx-auto max-w-2xl">
      <EucalyptusSprig className="pointer-events-none absolute -right-6 -top-10 hidden h-48 w-32 text-sage opacity-15 md:block" />

      <div className="text-center">
        <p className="eyebrow">Step Three</p>
        <h2 className="mt-4">Your Photo is Ready</h2>
      </div>

      <div className="card-paper mt-10 p-4 md:p-6">
        <img src={image} alt="Final photobooth photo" className="mx-auto w-full max-w-md bg-bone" />
      </div>

      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button className="btn-secondary" onClick={onRetake}>
          <RotateCcw size={16} />
          Back to Photobooth
        </button>
        <button className="btn-secondary" onClick={handleDownload}>
          <Download size={16} />
          Download
        </button>
        <button className="btn-secondary" onClick={handleShare}>
          <Share2 size={16} />
          Share
        </button>
        <Link to="/gallery" className="btn-primary flex items-center justify-center gap-2">
          <ImageIcon size={16} />
          View Gallery
        </Link>
      </div>
    </div>
  )
}

export default ResultDisplay

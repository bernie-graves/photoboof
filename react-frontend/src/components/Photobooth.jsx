import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import TemplateSelector from './TemplateSelector'
import PhotoCapture from './PhotoCapture'
import ResultDisplay from './ResultDisplay'
import './Photobooth.css'

// Function to composite photos with template
const compositePhotosWithTemplate = async (photos, template) => {
  return new Promise((resolve, reject) => {
    if (!template) {
      // If no template, just return the first photo
      resolve(photos[0])
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Load template image
    const templateImg = new Image()
    templateImg.crossOrigin = 'anonymous'
    templateImg.onload = () => {
      // Set canvas size to template size
      canvas.width = templateImg.width
      canvas.height = templateImg.height

      // Draw template
      ctx.drawImage(templateImg, 0, 0)

      // Calculate photo positions for a template with header/footer
      // Layout: Header (15%), Photo Grid (70%), Footer (15%)
      const headerHeight = canvas.height * 0.15
      const photoGridHeight = canvas.height * 0.7
      const borderWidth = 8 // Thicker border between photos
      
      // Calculate photo dimensions accounting for borders
      const photoWidth = (canvas.width - borderWidth) / 2
      const photoHeight = (photoGridHeight - borderWidth) / 2
      
      const positions = [
        { x: 0, y: headerHeight },
        { x: photoWidth + borderWidth, y: headerHeight },
        { x: 0, y: headerHeight + photoHeight + borderWidth },
        { x: photoWidth + borderWidth, y: headerHeight + photoHeight + borderWidth }
      ]

      // Load and draw each photo
      let loadedPhotos = 0
      const totalPhotos = Math.min(photos.length, 4)

      photos.slice(0, 4).forEach((photoData, index) => {
        const photoImg = new Image()
        photoImg.onload = () => {
          const pos = positions[index]
          
          // Use cover mode: scale image to completely fill the cell, cropping overflow
          // This matches what users see in the preview
          const targetAspectRatio = photoWidth / photoHeight
          const photoAspectRatio = photoImg.width / photoImg.height
          
          let scale, scaledWidth, scaledHeight, offsetX, offsetY
          
          if (photoAspectRatio > targetAspectRatio) {
            // Photo is wider than cell - scale to height (cover mode)
            scale = photoHeight / photoImg.height
            scaledHeight = photoHeight
            scaledWidth = photoImg.width * scale
            offsetX = (photoWidth - scaledWidth) / 2
            offsetY = 0
          } else {
            // Photo is taller than cell - scale to width (cover mode)
            scale = photoWidth / photoImg.width
            scaledWidth = photoWidth
            scaledHeight = photoImg.height * scale
            offsetX = 0
            offsetY = (photoHeight - scaledHeight) / 2
          }
          
          ctx.drawImage(
            photoImg,
            pos.x + offsetX,
            pos.y + offsetY,
            scaledWidth,
            scaledHeight
          )

          loadedPhotos++
          if (loadedPhotos === totalPhotos) {
            resolve(canvas.toDataURL('image/png'))
          }
        }
        photoImg.onerror = () => {
          loadedPhotos++
          if (loadedPhotos === totalPhotos) {
            resolve(canvas.toDataURL('image/png'))
          }
        }
        photoImg.src = photoData
      })
    }
    templateImg.onerror = () => {
      // If template fails to load, just return the first photo
      resolve(photos[0])
    }
    templateImg.src = `/templates/${template.filename}`
  })
}

function Photobooth() {
  const [step, setStep] = useState('template') // template, capture, result
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [finalImage, setFinalImage] = useState(null)
  const [isCompositing, setIsCompositing] = useState(false)

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setStep('capture')
  }

  const handlePhotosCaptured = async (photos) => {
    setCapturedPhotos(photos)
    setIsCompositing(true)
    
    if (photos.length > 0) {
      // Composite photos with template
      const compositeImage = await compositePhotosWithTemplate(photos, selectedTemplate)
      setFinalImage(compositeImage)
      setIsCompositing(false)
      setStep('result')
    } else {
      setIsCompositing(false)
    }
  }

  const handleRetake = () => {
    setCapturedPhotos([])
    setFinalImage(null)
    setStep('capture')
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo_data: finalImage,
          template_id: selectedTemplate?.id,
          session_id: Date.now().toString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save photo')
      }

      alert('Photo saved to gallery!')
      setStep('template')
      setSelectedTemplate(null)
      setCapturedPhotos([])
      setFinalImage(null)
    } catch (error) {
      console.error('Error saving photo:', error)
      alert('Failed to save photo. Please try again.')
    }
  }

  return (
    <div className="photobooth">
      <header className="photobooth-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
          Back
        </Link>
        <h1>Photobooth</h1>
        <div className="spacer"></div>
      </header>

      <main className="photobooth-main">
        {isCompositing && (
          <div className="compositing-overlay">
            <div className="loading-spinner"></div>
            <p>Creating your photobooth strip...</p>
          </div>
        )}

        {step === 'template' && (
          <TemplateSelector 
            onSelect={handleTemplateSelect}
          />
        )}

        {step === 'capture' && (
          <PhotoCapture 
            template={selectedTemplate}
            onCapture={handlePhotosCaptured}
            onCancel={() => setStep('template')}
          />
        )}

        {step === 'result' && (
          <ResultDisplay 
            image={finalImage}
            onRetake={handleRetake}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  )
}

export default Photobooth
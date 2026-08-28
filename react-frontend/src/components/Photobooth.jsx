import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import TemplateSelector from './TemplateSelector'
import PhotoCapture from './PhotoCapture'
import ResultDisplay from './ResultDisplay'

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
      
      // Auto-save to gallery
      try {
        await fetch('/api/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photo_data: compositeImage,
            template_id: selectedTemplate?.id,
            session_id: Date.now().toString()
          })
        })
      } catch (error) {
        console.error('Error auto-saving photo:', error)
      }
      
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
          <h1 className="text-2xl md:text-3xl">Photobooth</h1>
          <span className="w-16" aria-hidden="true" />
        </div>
      </header>

      <main className="container-page py-10 md:py-16">
        {isCompositing && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bone/95 px-6 text-center">
            <Camera size={28} className="text-sage-deep motion-safe:animate-pulse" aria-hidden="true" />
            <p className="font-display text-2xl text-sage-deep md:text-3xl">
              Creating your photobooth strip…
            </p>
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
          />
        )}
      </main>
    </div>
  )
}

export default Photobooth
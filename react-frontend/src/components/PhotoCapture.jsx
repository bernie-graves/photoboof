import { useState, useEffect, useRef } from 'react'
import { X, Camera as CameraIcon } from 'lucide-react'
import './PhotoCapture.css'

function PhotoCapture({ template, onCapture, onCancel }) {
  const [countdown, setCountdown] = useState(null)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [photos, setPhotos] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [stream, setStream] = useState(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const PHOTOS_PER_SESSION = 4
  const COUNTDOWN_SECONDS = 3

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Ensure video is playing when switching back to camera mode
  useEffect(() => {
    if (!showPreview && videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(err => {
        console.error('Error ensuring video playback:', err)
      })
    }
  }, [showPreview, stream])

  // Handle video readiness
  const handleVideoReady = () => {
    setIsVideoReady(true)
    console.log('Video ready, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
  }

  const startCamera = async () => {
    try {
      // Check if running on HTTPS or localhost
      const isSecureContext = window.isSecureContext || 
                             window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1'
      
      if (!isSecureContext) {
        console.error('Camera access requires HTTPS or localhost')
        alert('Camera access requires HTTPS. Please use a secure connection or localhost.')
        return
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported')
        alert('Camera access is not supported in this browser or context.')
        return
      }

      // Try with mobile-friendly constraints first
      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        })
      } catch (mobileErr) {
        console.warn('Initial camera request failed, trying with basic constraints:', mobileErr)
        // Fallback to basic constraints for mobile
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user'
          },
          audio: false 
        })
      }
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(err => {
          console.error('Error playing video stream:', err)
        })
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        alert('No camera found on this device.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        alert('Camera is already in use by another application.')
      } else {
        alert(`Unable to access camera: ${err.message || 'Unknown error'}. Please ensure you have granted camera permissions and are using HTTPS.`)
      }
    }
  }

  const startCountdown = () => {
    if (!isVideoReady) {
      console.log('Video not ready, waiting...')
      // Wait for video to be ready before starting countdown
      setTimeout(() => {
        if (isVideoReady) {
          setCountdown(COUNTDOWN_SECONDS)
        } else {
          console.warn('Video still not ready, starting countdown anyway')
          setCountdown(COUNTDOWN_SECONDS)
        }
      }, 500)
      return
    }
    setCountdown(COUNTDOWN_SECONDS)
  }

  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      capturePhoto()
    }
  }, [countdown])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Ensure video is ready and playing
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.error('Video not ready, readyState:', video.readyState)
      return
    }

    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    
    if (videoWidth === 0 || videoHeight === 0) {
      console.error('Invalid video dimensions:', videoWidth, videoHeight)
      return
    }

    // Target aspect ratio: match template cell dimensions (596px × 626px ≈ 0.95:1)
    const targetAspectRatio = 596 / 626
    
    // Calculate crop dimensions using cover mode (same as CSS object-fit: cover)
    // This ensures the captured image matches exactly what users see in the preview
    let cropWidth, cropHeight, cropX, cropY
    
    if (videoWidth / videoHeight > targetAspectRatio) {
      // Video is wider than target - scale to height (cover mode)
      cropHeight = videoHeight
      cropWidth = cropHeight * targetAspectRatio
      cropX = (videoWidth - cropWidth) / 2
      cropY = 0
    } else {
      // Video is taller than target - scale to width (cover mode)
      cropWidth = videoWidth
      cropHeight = cropWidth / targetAspectRatio
      cropX = 0
      cropY = (videoHeight - cropHeight) / 2
    }

    // Set canvas to target dimensions (600x630 base, but use actual video resolution)
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Draw the cropped portion of the video
    context.drawImage(
      video,
      cropX, cropY, cropWidth, cropHeight,  // Source rectangle
      0, 0, cropWidth, cropHeight           // Destination rectangle
    )

    const imageData = canvas.toDataURL('image/png')
    const newPhotos = [...photos, imageData]
    setPhotos(newPhotos)
    setShowPreview(true)
    setCountdown(null)

    if (newPhotos.length >= PHOTOS_PER_SESSION) {
      // All photos captured - show preview briefly then finish
      setTimeout(() => {
        onCapture(newPhotos)
      }, 2000)
    } else {
      // Auto-start countdown after brief preview
      setTimeout(() => {
        setShowPreview(false)
        setCurrentPhoto(currentPhoto + 1)
        // Ensure video is reconnected to stream after preview
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err)
          })
        }
        startCountdown()
      }, 1500) // 1.5 second preview
    }
  }

  const handleRetakeCurrent = () => {
    setShowPreview(false)
    // Ensure video is reconnected to stream after preview
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }
    startCountdown()
  }

  const handleRetakeAll = () => {
    setPhotos([])
    setCurrentPhoto(0)
    setShowPreview(false)
    onCancel()
  }

  return (
    <div className="photo-capture">
      <div className="capture-header">
        <h2>Photo {currentPhoto + 1} of {PHOTOS_PER_SESSION}</h2>
        <button className="cancel-button" onClick={handleRetakeAll}>
          <X size={24} />
        </button>
      </div>

      {showPreview ? (
        <div className="preview-mode">
          <img src={photos[photos.length - 1]} alt="Captured photo" className="preview-image" />
          <div className="preview-actions">
            <button className="btn btn-secondary" onClick={handleRetakeCurrent}>
              Retake
            </button>
            {photos.length >= PHOTOS_PER_SESSION && (
              <button className="btn btn-primary" onClick={() => onCapture(photos)}>
                Finish
              </button>
            )}
          </div>
          <p className="preview-timer">Next photo in 1.5s...</p>
        </div>
      ) : (
        <div className="camera-mode">
          <div className="video-container">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="camera-feed"
              onLoadedMetadata={handleVideoReady}
              onCanPlay={handleVideoReady}
            />
            <div className="capture-frame" />
            <canvas ref={canvasRef} className="hidden-canvas" />
            
            {countdown !== null && (
              <div className="countdown-overlay">
                <div className="countdown-number">{countdown}</div>
              </div>
            )}
          </div>

          <div className="capture-actions">
            {countdown === null && (
              <button className="btn btn-primary capture-button" onClick={startCountdown}>
                <CameraIcon size={24} />
                Capture
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoCapture
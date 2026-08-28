/**
 * Download helper utility for iOS Photos library integration
 * Uses Web Share API on iOS devices to save directly to Photos
 */

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

/**
 * Handle download with iOS Photos library support
 * @param {string} imageUrl - URL of the image to download
 * @param {string} filename - Suggested filename for the download
 */
export async function handleDownload(imageUrl, filename) {
  // Try Web Share API on iOS for direct Photos library save
  if (isIOS && navigator.share && navigator.canShare) {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      const blob = await response.blob()
      const file = new File([blob], filename, { type: blob.type || 'image/png' })
      
      // Test if we can share files
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
        return // Success - don't proceed to fallback
      }
    } catch (error) {
      // If share fails for any reason (user cancelled, error, etc.), fall back to regular download
      console.log('Web Share failed, falling back to regular download:', error.message)
    }
  }
  
  // Fallback: Regular download for non-iOS or if share fails
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = filename
  link.click()
}
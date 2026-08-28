import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Image as ImageIcon, Loader } from 'lucide-react'
import EucalyptusSprig from './botanical/EucalyptusSprig'
import WildflowerSprig from './botanical/WildflowerSprig'
import BotanicalDivider from './botanical/BotanicalDivider'

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
    <div className="min-h-screen bg-bone">
      <section className="relative overflow-hidden">
        <EucalyptusSprig className="pointer-events-none absolute -right-10 top-0 h-[420px] w-[260px] text-sage opacity-10 md:right-4 md:h-[560px] md:w-[340px]" />
        <WildflowerSprig className="pointer-events-none absolute -left-8 bottom-0 hidden h-[300px] w-[200px] text-sage opacity-10 md:block" />

        <div className="container-page section-y relative">
          <div className="max-w-2xl">
            <p className="eyebrow">The Wedding of Abby &amp; Bernie</p>
            <h1 className="mt-6 text-5xl leading-[1.1] md:text-7xl">
              Wedding
              <br />
              Photobooth
            </h1>
            <p className="mt-8 max-w-[65ch] text-base leading-relaxed text-muted md:text-lg">
              Step in, take four photos, and leave a little piece of the evening behind.
              Every strip is added to the gallery for everyone to keep.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/photobooth" className="btn-primary">
                <Camera size={18} />
                Start Photobooth
              </Link>
              <Link to="/gallery" className="btn-secondary">
                <ImageIcon size={18} />
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page">
        <hr className="rule-gold" />
      </div>

      <section className="section-y bg-sand">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">The Gallery</p>
            <h2 className="mt-4">Recent Photos</h2>
          </div>

          <div className="mt-12">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-16 text-muted">
                <Loader className="motion-safe:animate-spin" size={28} aria-hidden="true" />
                <p>Loading recent photos…</p>
              </div>
            ) : recentPhotos.length === 0 ? (
              <div className="rounded-md border border-line bg-bone px-6 py-16 text-center">
                <p className="mx-auto max-w-[65ch] text-muted">
                  No photos yet. Be the first to use the photobooth.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {recentPhotos.map(photo => (
                  <Link
                    key={photo.id}
                    to="/gallery"
                    className="block overflow-hidden rounded-md border border-line bg-bone p-2 motion-safe:transition-colors motion-safe:duration-200 hover:border-sage"
                  >
                    <img
                      src={`/uploads/${photo.filename}`}
                      alt="Recent photobooth photo"
                      className="aspect-[2/3] w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <BotanicalDivider className="mt-16" />
        </div>
      </section>
    </div>
  )
}

export default LandingPage

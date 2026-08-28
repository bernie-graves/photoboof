import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, Trash2, Lock } from 'lucide-react'

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [templates, setTemplates] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates()
    }
  }, [isAuthenticated])

  const fetchTemplates = () => {
    fetch('/api/templates')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch templates')
        }
        return res.json()
      })
      .then(data => {
        setTemplates(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Failed to fetch templates:', err)
        setTemplates([])
      })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // In production, this would call an API endpoint
    // For now, we'll check against a simple hardcoded value
    if (password === 'admin123') { // This should match the backend config
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const file = e.target.file.files[0]
    const name = e.target.name.value

    if (!file) {
      setError('Please select a file')
      return
    }

    if (!file.name.endsWith('.png')) {
      setError('Only PNG files are allowed')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name || file.name)

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setTemplates([...templates, data])
      e.target.reset()
      setUploading(false)
    } catch (err) {
      setError(err.message || 'Failed to upload template')
      setUploading(false)
    }
  }

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setTemplates(templates.filter(t => t.id !== templateId))
    } catch (err) {
      setError('Failed to delete template')
      console.error('Delete error:', err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bone">
        <div className="container-page section-y">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.12em] text-muted motion-safe:transition-colors motion-safe:duration-200 hover:text-sage-deep"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="card-paper mx-auto mt-12 max-w-md p-8 md:p-10">
            <div className="text-center">
              <Lock size={24} className="mx-auto text-sage-deep" aria-hidden="true" />
              <p className="eyebrow mt-6">Restricted</p>
              <h2 className="mt-3 text-3xl">Admin Login</h2>
            </div>

            <form onSubmit={handleLogin} className="mt-10">
              <label
                htmlFor="password"
                className="block font-sans text-xs uppercase tracking-[0.12em] text-muted"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="field-line mt-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />

              {error && <p className="mt-6 text-sm text-clay-deep">{error}</p>}

              <button type="submit" className="btn-primary mt-8 w-full">
                Login
              </button>
            </form>
          </div>
        </div>
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
          <h1 className="text-2xl md:text-3xl">Admin Panel</h1>
          <button className="btn-secondary px-5 py-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="container-page py-12 md:py-20">
        <section className="mx-auto max-w-2xl">
          <p className="eyebrow">Templates</p>
          <h2 className="mt-4">Upload New Template</h2>

          <form onSubmit={handleUpload} className="card-paper mt-8 p-6 md:p-8">
            <label
              htmlFor="name"
              className="block font-sans text-xs uppercase tracking-[0.12em] text-muted"
            >
              Template Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="field-line mt-3"
              placeholder="Enter template name"
              required
            />

            <label
              htmlFor="file"
              className="mt-8 block font-sans text-xs uppercase tracking-[0.12em] text-muted"
            >
              PNG File
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".png"
              required
              className="mt-3 w-full font-sans text-sm text-muted file:mr-4 file:rounded-md file:border file:border-sage-deep file:bg-transparent file:px-4 file:py-2 file:font-sans file:text-xs file:uppercase file:tracking-wider file:text-sage-deep"
            />

            {error && <p className="mt-6 text-sm text-clay-deep">{error}</p>}

            <button type="submit" className="btn-primary mt-8" disabled={uploading}>
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Upload Template'}
            </button>
          </form>
        </section>

        <hr className="rule-gold mt-16" />

        <section className="mt-16">
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow">Library</p>
            <h2 className="mt-4">Manage Templates</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {!templates || templates.length === 0 ? (
              <p className="max-w-[65ch] text-muted">No templates uploaded yet.</p>
            ) : (
              templates.map(template => (
                template && template.filename && (
                  <div key={template.id} className="card-paper overflow-hidden p-3">
                    <img
                      src={`/templates/${template.filename}`}
                      alt={template.name || 'Template'}
                      className="aspect-[2/3] w-full bg-bone object-contain"
                    />
                    <div className="px-1 pb-1 pt-4">
                      <h3 className="text-xl md:text-2xl">{template.name || 'Unnamed Template'}</h3>
                      <p className="mt-2 font-sans text-xs uppercase tracking-[0.12em] text-muted">
                        Uploaded {template.upload_date ? new Date(template.upload_date).toLocaleDateString() : 'Unknown'}
                      </p>
                      <button
                        className="btn-secondary mt-5 border-clay-deep px-5 py-2 text-clay-deep hover:bg-sand"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminPanel
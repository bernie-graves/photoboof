import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, Trash2, Lock } from 'lucide-react'
import './AdminPanel.css'

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
      <div className="admin-panel">
        <div className="login-container">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          
          <div className="login-box">
            <div className="login-header">
              <Lock size={48} />
              <h2>Admin Login</h2>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              {error && <p className="error">{error}</p>}
              
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
          Back
        </Link>
        <h1>Admin Panel</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-main">
        <section className="upload-section">
          <h2>Upload New Template</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="name">Template Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter template name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="file">PNG File</label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".png"
                required
              />
            </div>
            
            {error && <p className="error">{error}</p>}
            
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload Template'}
            </button>
          </form>
        </section>

        <section className="templates-section">
          <h2>Manage Templates</h2>
          <div className="templates-grid">
            {!templates || templates.length === 0 ? (
              <p className="no-templates">No templates uploaded yet.</p>
            ) : (
              templates.map(template => (
                template && template.filename && (
                  <div key={template.id} className="template-item">
                    <img 
                      src={`/templates/${template.filename}`}
                      alt={template.name || 'Template'}
                      className="template-preview"
                    />
                    <div className="template-details">
                      <h3>{template.name || 'Unnamed Template'}</h3>
                      <p>Uploaded: {template.upload_date ? new Date(template.upload_date).toLocaleDateString() : 'Unknown'}</p>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 size={16} />
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
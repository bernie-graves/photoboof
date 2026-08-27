import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import './TemplateSelector.css'

function TemplateSelector({ onSelect }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch templates from API
    fetch('/api/templates')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch templates')
        }
        return res.json()
      })
      .then(data => {
        setTemplates(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch templates:', err)
        setTemplates([])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="template-selector loading">
        <Loader className="spinner" size={48} />
        <p>Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="template-selector">
      <h2>Choose a Template</h2>
      <div className="template-grid">
        {!templates || templates.length === 0 ? (
          <p className="no-templates">No templates available. Please contact the administrator.</p>
        ) : (
          templates.map(template => (
            <div 
              key={template.id}
              className="template-card"
              onClick={() => onSelect(template)}
            >
              <img 
                src={`/templates/${template.filename}`}
                alt={template.name}
                className="template-preview"
              />
              <div className="template-info">
                <h3>{template.name}</h3>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TemplateSelector
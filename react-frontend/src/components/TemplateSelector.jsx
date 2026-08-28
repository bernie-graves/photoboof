import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'

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
      <div className="flex flex-col items-center gap-4 py-24 text-muted">
        <Loader className="motion-safe:animate-spin" size={32} aria-hidden="true" />
        <p>Loading templates…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-2xl">
        <p className="eyebrow">Step One</p>
        <h2 className="mt-4">Choose a Template</h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!templates || templates.length === 0 ? (
          <p className="max-w-[65ch] text-muted">
            No templates available. Please contact the administrator.
          </p>
        ) : (
          templates.map(template => (
            <button
              key={template.id}
              type="button"
              className="card-paper block w-full overflow-hidden p-3 text-left motion-safe:transition-colors motion-safe:duration-200 hover:border-sage"
              onClick={() => onSelect(template)}
            >
              <img
                src={`/templates/${template.filename}`}
                alt={template.name}
                className="aspect-[2/3] w-full bg-bone object-contain"
              />
              <div className="px-1 pb-1 pt-4">
                <h3 className="text-xl md:text-2xl">{template.name}</h3>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default TemplateSelector

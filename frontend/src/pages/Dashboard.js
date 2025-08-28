import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

/**
 * Dashboard component. Allows authenticated users to upload images, analyse
 * labels, view the structured response and view/update matching rules. It
 * demonstrates dynamic rendering of content and responsive layout, adapting
 * to different screen sizes using flexbox.
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  // Configure axios to include the JWT on each request
  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })

  const handleAnalyse = async () => {
    if (images.length === 0) return
    setLoading(true)
    setError('')
    try {
      const base64Images = await Promise.all(images.map((f) => toBase64(f)))
      const res = await axiosInstance.post('/api/analyze', {
        images: base64Images,
      })
      setAnalysis(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const fetchRules = async () => {
    try {
      const res = await axiosInstance.get('/api/rules')
      setRules(res.data)
    } catch (err) {
      setError('Failed to fetch rules')
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>E‑commerce Label Recognition</h1>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid #ccc',
            padding: '.5rem 1rem',
            borderRadius: '4px',
          }}
        >
          Logout
        </button>
      </header>
      <main
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          marginTop: '1rem',
        }}
      >
        {/* Upload & analysis panel */}
        <section
          style={{
            flex: '1 1 300px',
            background: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h2>Analyse Images</h2>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={handleAnalyse}
            disabled={loading || images.length === 0}
            style={{
              marginTop: '1rem',
              padding: '.5rem 1rem',
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Analyse'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </section>
        {/* Results panel */}
        <section
          style={{
            flex: '1 1 300px',
            background: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h2>Results</h2>
          {analysis ? (
            <div>
              <p>
                <strong>Verdict:</strong> {analysis.verdict}
              </p>
              <h3>Barcodes</h3>
              <ul>
                {analysis.barcodes.map((bc, idx) => (
                  <li key={`bc-${idx}`}>
                    {bc.symbology}: {bc.text} (conf {Math.round(bc.conf * 100)}
                    %)
                  </li>
                ))}
              </ul>
              <h3>Texts</h3>
              <ul>
                {analysis.texts.map((t, idx) => (
                  <li key={`txt-${idx}`}>
                    {t.text} (conf {Math.round(t.conf * 100)}%)
                  </li>
                ))}
              </ul>
              <h3>Flags</h3>
              <ul>
                {analysis.flags.map((f, idx) => (
                  <li key={`flag-${idx}`}>{f}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No analysis performed yet.</p>
          )}
        </section>
        {/* Rules panel */}
        <section
          style={{
            flex: '1 1 300px',
            background: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h2>Rules</h2>
          <button
            type="button"
            onClick={fetchRules}
            style={{
              marginBottom: '1rem',
              padding: '.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#f5f5f5',
            }}
          >
            Load Rules
          </button>
          {rules ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(rules, null, 2)}
            </pre>
          ) : (
            <p>No rules loaded.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard

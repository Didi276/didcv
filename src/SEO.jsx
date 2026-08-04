import { useEffect } from 'react'

export default function SEO({ titre, description, url, image, schema }) {
  useEffect(() => {
    document.title = titre ? `${titre} sur DidJob` : 'DidJob, CV IA en 30 secondes'
    document.querySelector('meta[name="description"]')?.setAttribute('content', description || '')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', titre || '')
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description || '')
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url || 'https://did-job.com')
    if (image) document.querySelector('meta[property="og:image"]')?.setAttribute('content', image)
  }, [titre, description, url, image])

  useEffect(() => {
    if (!schema) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [schema])

  return null
}

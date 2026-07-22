import { useEffect } from 'react'

export default function SEO({ titre, description, url, image }) {
  useEffect(() => {
    document.title = titre ? `${titre} — DidCV` : 'DidCV — CV IA en 30 secondes'
    document.querySelector('meta[name="description"]')?.setAttribute('content', description || '')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', titre || '')
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description || '')
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url || 'https://didcv.vercel.app')
    if (image) document.querySelector('meta[property="og:image"]')?.setAttribute('content', image)
  }, [titre, description, url, image])
  return null
}

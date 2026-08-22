import { useState, useEffect, useCallback } from 'react'
import { listCovers, deleteCover } from '../lib/storage.js'

export function useGallery() {
  const [covers, setCovers] = useState(null)

  useEffect(() => {
    let live = true
    listCovers()
      .then((c) => { if (live) setCovers(c) })
      .catch((e) => console.error('[useGallery] load error:', e))
    return () => { live = false }
  }, [])

  const refresh = useCallback(async () => {
    try {
      setCovers(await listCovers())
    } catch (e) {
      console.error('[useGallery] refresh error:', e)
    }
  }, [])

  const remove = useCallback(async (id) => {
    try {
      await deleteCover(id)
      setCovers(await listCovers())
    } catch (e) {
      console.error('[useGallery] remove error:', e)
    }
  }, [])

  return { covers, refresh, remove }
}

import { useState, useEffect, useCallback } from 'react'
import { listCovers, deleteCover } from '../lib/storage.js'

export function useGallery() {
  const [covers, setCovers] = useState(null)

  useEffect(() => {
    let live = true
    listCovers().then((c) => {
      if (live) setCovers(c)
    })
    return () => { live = false }
  }, [])

  const refresh = useCallback(async () => {
    const c = await listCovers()
    setCovers(c)
  }, [])

  const remove = useCallback(async (id) => {
    await deleteCover(id)
    const c = await listCovers()
    setCovers(c)
  }, [])

  return { covers, refresh, remove }
}

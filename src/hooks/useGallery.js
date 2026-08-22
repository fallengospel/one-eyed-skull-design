import { useState, useEffect, useCallback } from 'react'
import { listCovers, deleteCover, listCollection, deleteCollectionItem } from '../lib/storage.js'

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

export function useCollection() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let live = true
    listCollection()
      .then((c) => { if (live) setItems(c) })
      .catch((e) => console.error('[useCollection] load error:', e))
    return () => { live = false }
  }, [])

  const refresh = useCallback(async () => {
    try {
      setItems(await listCollection())
    } catch (e) {
      console.error('[useCollection] refresh error:', e)
    }
  }, [])

  const remove = useCallback(async (id) => {
    try {
      await deleteCollectionItem(id)
      setItems(await listCollection())
    } catch (e) {
      console.error('[useCollection] remove error:', e)
    }
  }, [])

  return { items, refresh, remove }
}

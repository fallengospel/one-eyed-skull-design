import { useState, useEffect, useCallback } from 'react'
import { listCovers, deleteCover, listCollection, deleteCollectionItem } from '../lib/storage.js'

export function useGallery() {
  const [covers, setCovers] = useState(null)

  useEffect(() => {
    let live = true
    listCovers().then((c) => { if (live) setCovers(c) })
    return () => { live = false }
  }, [])

  const refresh = useCallback(async () => {
    setCovers(await listCovers())
  }, [])

  const remove = useCallback(async (id) => {
    await deleteCover(id)
    setCovers(await listCovers())
  }, [])

  return { covers, refresh, remove }
}

export function useCollection() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let live = true
    listCollection().then((c) => { if (live) setItems(c) })
    return () => { live = false }
  }, [])

  const refresh = useCallback(async () => {
    setItems(await listCollection())
  }, [])

  const remove = useCallback(async (id) => {
    await deleteCollectionItem(id)
    setItems(await listCollection())
  }, [])

  return { items, refresh, remove }
}

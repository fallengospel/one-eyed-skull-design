const COVERS_KEY = 'oesd.covers.v1'

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch (e) {
    console.error('[Storage] read failed:', key, e)
    return []
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('[Storage] write failed:', key, e.message)
    throw e
  }
}

export async function listCovers() {
  return read(COVERS_KEY)
}

export async function getCover(id) {
  return read(COVERS_KEY).find((c) => c.id === id) ?? null
}

export async function createCover(data) {
  console.log('[Storage] createCover:', data.title)
  const covers = read(COVERS_KEY)
  const cover = { ...data, id: crypto.randomUUID(), createdAt: Date.now() }
  write(COVERS_KEY, [cover, ...covers])
  return cover
}

export async function updateCover(id, data) {
  console.log('[Storage] updateCover:', id)
  const covers = read(COVERS_KEY)
  const idx = covers.findIndex((c) => c.id === id)
  if (idx === -1) return null
  covers[idx] = { ...covers[idx], ...data }
  write(COVERS_KEY, covers)
  return covers[idx]
}

export async function deleteCover(id) {
  console.log('[Storage] deleteCover:', id)
  write(COVERS_KEY, read(COVERS_KEY).filter((c) => c.id !== id))
}

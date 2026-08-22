const COVERS_KEY = 'oesd.covers.v1'
const COLLECTION_KEY = 'oesd.collection.v1'
const PROFILE_KEY = 'oesd.profile.v1'

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function readObj(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? null
  } catch {
    return null
  }
}

function writeObj(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export async function listCovers() {
  return read(COVERS_KEY)
}

export async function getCover(id) {
  return read(COVERS_KEY).find((c) => c.id === id) ?? null
}

export async function createCover(data) {
  const covers = read(COVERS_KEY)
  const cover = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  write(COVERS_KEY, [cover, ...covers])
  return cover
}

export async function updateCover(id, data) {
  const covers = read(COVERS_KEY)
  const idx = covers.findIndex((c) => c.id === id)
  if (idx === -1) return null
  covers[idx] = { ...covers[idx], ...data }
  write(COVERS_KEY, covers)
  return covers[idx]
}

export async function deleteCover(id) {
  write(COVERS_KEY, read(COVERS_KEY).filter((c) => c.id !== id))
}

export async function getProfile() {
  return readObj(PROFILE_KEY)
}

export async function saveProfile(data) {
  const profile = readObj(PROFILE_KEY) || { id: crypto.randomUUID(), createdAt: Date.now() }
  const updated = { ...profile, ...data, updatedAt: Date.now() }
  writeObj(PROFILE_KEY, updated)
  return updated
}

export async function listCollection() {
  return read(COLLECTION_KEY)
}

export async function getCollectionItem(id) {
  return read(COLLECTION_KEY).find((c) => c.id === id) ?? null
}

export async function createCollectionItem(data) {
  const items = read(COLLECTION_KEY)
  const item = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  write(COLLECTION_KEY, [item, ...items])
  return item
}

export async function updateCollectionItem(id, data) {
  const items = read(COLLECTION_KEY)
  const idx = items.findIndex((c) => c.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...data }
  write(COLLECTION_KEY, items)
  return items[idx]
}

export async function deleteCollectionItem(id) {
  write(COLLECTION_KEY, read(COLLECTION_KEY).filter((c) => c.id !== id))
}

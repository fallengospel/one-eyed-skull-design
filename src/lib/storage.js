const COVERS_KEY = 'oesd.covers.v1'
const PROFILES_KEY = 'oesd.profiles.v1'
const ACTIVE_PROFILE_KEY = 'oesd.activeProfile.v1'
const COLLECTION_PREFIX = 'oesd.collection.'

const DEFAULT_PROFILE = {
  id: 'default',
  name: 'fallen-One',
  handle: 'fallen-One',
  bio: 'Brain dumping ideas through random Thoughts and Infinite Possibilities...',
  avatar: null,
  isDefault: true,
  createdAt: Date.now(),
}

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
  const cover = { ...data, id: crypto.randomUUID(), createdAt: Date.now() }
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

async function ensureDefaultProfile() {
  const profiles = read(PROFILES_KEY)
  if (!profiles.find((p) => p.id === 'default')) {
    profiles.unshift(DEFAULT_PROFILE)
    write(PROFILES_KEY, profiles)
  }
}

export async function listProfiles() {
  await ensureDefaultProfile()
  return read(PROFILES_KEY)
}

export async function getProfile(id) {
  const profiles = await listProfiles()
  return profiles.find((p) => p.id === id) ?? null
}

export async function getActiveProfile() {
  const activeId = readObj(ACTIVE_PROFILE_KEY) || 'default'
  return getProfile(activeId)
}

export async function setActiveProfile(id) {
  writeObj(ACTIVE_PROFILE_KEY, id)
}

export async function createProfile(data) {
  const profiles = await listProfiles()
  const profile = {
    ...data,
    id: crypto.randomUUID(),
    isDefault: false,
    createdAt: Date.now(),
  }
  profiles.push(profile)
  write(PROFILES_KEY, profiles)
  return profile
}

export async function updateProfile(id, data) {
  const profiles = await listProfiles()
  const idx = profiles.findIndex((p) => p.id === id)
  if (idx === -1) return null
  profiles[idx] = { ...profiles[idx], ...data, updatedAt: Date.now() }
  write(PROFILES_KEY, profiles)
  return profiles[idx]
}

export async function deleteProfile(id) {
  if (id === 'default') return false
  const profiles = await listProfiles()
  write(PROFILES_KEY, profiles.filter((p) => p.id !== id))
  localStorage.removeItem(COLLECTION_PREFIX + id)
  const activeId = readObj(ACTIVE_PROFILE_KEY)
  if (activeId === id) writeObj(ACTIVE_PROFILE_KEY, 'default')
  return true
}

function collectionKey(profileId) {
  return COLLECTION_PREFIX + (profileId || 'default')
}

export async function listCollection(profileId) {
  return read(collectionKey(profileId))
}

export async function getCollectionItem(profileId, itemId) {
  return read(collectionKey(profileId)).find((c) => c.id === itemId) ?? null
}

export async function createCollectionItem(profileId, data) {
  const key = collectionKey(profileId)
  const items = read(key)
  const item = { ...data, id: crypto.randomUUID(), createdAt: Date.now() }
  write(key, [item, ...items])
  return item
}

export async function updateCollectionItem(profileId, itemId, data) {
  const key = collectionKey(profileId)
  const items = read(key)
  const idx = items.findIndex((c) => c.id === itemId)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...data }
  write(key, items)
  return items[idx]
}

export async function deleteCollectionItem(profileId, itemId) {
  const key = collectionKey(profileId)
  write(key, read(key).filter((c) => c.id !== itemId))
}

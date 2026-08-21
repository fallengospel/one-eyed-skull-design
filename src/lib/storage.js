const KEY = 'oesd.covers.v1'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export async function listCovers() {
  return read()
}

export async function getCover(id) {
  return read().find((c) => c.id === id) ?? null
}

export async function createCover(data) {
  const covers = read()
  const cover = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  write([cover, ...covers])
  return cover
}

export async function updateCover(id, data) {
  const covers = read()
  const idx = covers.findIndex((c) => c.id === id)
  if (idx === -1) return null
  covers[idx] = { ...covers[idx], ...data }
  write(covers)
  return covers[idx]
}

export async function deleteCover(id) {
  write(read().filter((c) => c.id !== id))
}

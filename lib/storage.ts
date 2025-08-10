"use client"

import { get, set, del } from "idb-keyval"
import type { Photo } from "@/lib/data"

const IDS_KEY = "lbjrr:photo-ids"
const dataKey = (id: string) => `lbjrr:photo-data:${id}`
const blobKey = (id: string) => `lbjrr:photo-blob:${id}`

export type StoredPhotoData = Omit<Photo, "imageUrl">

/**
 * Obtiene el listado de IDs persistidos.
 */
async function getIds(): Promise<string[]> {
  const ids = (await get(IDS_KEY)) as string[] | undefined
  return Array.isArray(ids) ? ids : []
}

/**
 * Guarda una nueva foto: metadatos + blob de imagen.
 */
export async function savePhotoWithBlob(meta: StoredPhotoData, blob: Blob): Promise<void> {
  const ids = await getIds()
  if (!ids.includes(meta.id)) {
    ids.unshift(meta.id)
    await set(IDS_KEY, ids)
  }
  await set(dataKey(meta.id), meta)
  await set(blobKey(meta.id), blob)
}

/**
 * Carga todas las fotos como objetos Photo listos para mostrar (imageUrl con objectURL).
 */
export async function loadAllPhotos(): Promise<Photo[]> {
  const ids = await getIds()
  const photos: Photo[] = []
  for (const id of ids) {
    const meta = (await get(dataKey(id))) as StoredPhotoData | undefined
    const blob = (await get(blobKey(id))) as Blob | undefined
    if (meta && blob) {
      const url = URL.createObjectURL(blob)
      photos.push({ ...meta, imageUrl: url })
    }
  }
  return photos
}

/**
 * Carga una foto por id.
 */
export async function loadPhotoById(id: string): Promise<Photo | null> {
  const meta = (await get(dataKey(id))) as StoredPhotoData | undefined
  const blob = (await get(blobKey(id))) as Blob | undefined
  if (!meta || !blob) return null
  const url = URL.createObjectURL(blob)
  return { ...meta, imageUrl: url }
}

/**
 * Actualiza parcialmente los metadatos de una foto y devuelve los metadatos resultantes.
 */
export async function updatePhotoData(id: string, partial: Partial<StoredPhotoData>): Promise<StoredPhotoData | null> {
  const current = (await get(dataKey(id))) as StoredPhotoData | undefined
  if (!current) return null
  const next = { ...current, ...partial }
  await set(dataKey(id), next)
  return next
}

/**
 * Elimina una foto (opcional).
 */
export async function removePhoto(id: string): Promise<void> {
  const ids = await getIds()
  const nextIds = ids.filter((x) => x !== id)
  await set(IDS_KEY, nextIds)
  await del(dataKey(id))
  await del(blobKey(id))
}

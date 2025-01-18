import { database } from '@/db'
import { unit } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export type DataUnit = Awaited<ReturnType<typeof getAllUnit>>

export const getAllUnit = async () => {
  return await database.query.unit.findMany()
}

export const saveUnit = async (data: { unit: string; deskripsi?: string; jumlah: number }) => {
  try {
    const result = await database.insert(unit).values(data).returning()
    if (result.length > 0) return result[0]
    return null
  } catch (e) {
    throw new Error(`${(e as Error).message}`)
  }
}

export const deleteUnit = async (id: number) => {
  try {
    const result = await database.delete(unit).where(eq(unit.id, id))
    return result.rows
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export const updateUnit = async (
  id: number,
  data: { unit: string; deskripsi?: string; jumlah: number }
) => {
  try {
    const result = await database.update(unit).set(data).where(eq(unit.id, id)).returning()
    return result[0]
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

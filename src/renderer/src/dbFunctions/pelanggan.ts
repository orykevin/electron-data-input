import { database } from '@/db'
import { PelanganFormData } from '@/page/pelanggan'
import { pelanggan } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export type PelangganData = Awaited<ReturnType<typeof getPelanggan>>

export const getPelanggan = async () => {
  return await database.query.pelanggan.findMany({ columns: { deletedAt: false, updateAt: false } })
}

export const createPelanggan = async (data: PelanganFormData) => {
  try {
    const result = await database
      .insert(pelanggan)
      .values({ ...data })
      .returning()
    return result[0]
  } catch (e) {
    throw new Error('Error when create pelanggan')
  }
}

export const deletePelanggan = async (ids: number[]) => {
  try {
    await Promise.all(
      ids.map(async (id) => {
        await database.delete(pelanggan).where(eq(pelanggan.id, id))
      })
    )
    return 'Succsess'
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export const updatePelanggan = async (
  id: number,
  data: { kode?: string; nama?: string; alamat?: string; deskripsi?: string }
) => {
  try {
    const result = await database
      .update(pelanggan)
      .set({ ...data })
      .where(eq(pelanggan.id, id))
      .returning()
    return result[0]
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

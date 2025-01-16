import { database } from '@/db'
import { PelanganFormData } from '@/page/supplier'
import { supplier } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export type SupplierData = Awaited<ReturnType<typeof getSupplier>>

export const getSupplier = async () => {
  return await database.query.supplier.findMany({ columns: { deletedAt: false, updateAt: false } })
}

export const createSupplier = async (data: PelanganFormData) => {
  try {
    const result = await database
      .insert(supplier)
      .values({ ...data })
      .returning()
    return result[0]
  } catch (e) {
    throw new Error('Error when create supplier')
  }
}

export const deleteSupplier = async (ids: number[]) => {
  try {
    await Promise.all(
      ids.map(async (id) => {
        await database.delete(supplier).where(eq(supplier.id, id))
      })
    )
    return 'Succsess'
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export const updateSupplier = async (
  id: number,
  data: { kode?: string; nama?: string; alamat?: string; deskripsi?: string }
) => {
  try {
    const result = await database
      .update(supplier)
      .set({ ...data })
      .where(eq(supplier.id, id))
      .returning()
    return result[0]
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

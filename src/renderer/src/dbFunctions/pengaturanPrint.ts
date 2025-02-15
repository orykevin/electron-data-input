import { database } from '@/db'
import { eq } from 'drizzle-orm'
import { pengaturanPrint } from '../../../db/schema'

export const getPengaturanPrint = async () => {
  return await database.query.pengaturanPrint.findMany()
}

export const savePengaturanPrint = async (data: { id: number; value: string }[]) => {
  await Promise.all(
    data.map(async (d) => {
      await database
        .update(pengaturanPrint)
        .set({ value: d.value })
        .where(eq(pengaturanPrint.id, d.id))
    })
  )
  return true
}

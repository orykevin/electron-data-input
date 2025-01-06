import { database } from '@/db'

export type DataUnit = Awaited<ReturnType<typeof getAllUnit>>

export const getAllUnit = async () => {
  return await database.query.unit.findMany()
}

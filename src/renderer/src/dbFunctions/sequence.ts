import { database } from '@/db'
import { sql } from 'drizzle-orm'

export const getTableSequence = async (tableName: string) => {
  try {
    const result = await database
      .select({
        seq: sql<number>`seq`
      })
      .from(sql`sqlite_sequence`)
      .where(sql`name = ${tableName}`)
      .get()

    return result?.seq ?? null
  } catch {
    return null
  }
}

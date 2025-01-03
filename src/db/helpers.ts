import { sql } from 'drizzle-orm'
import { int } from 'drizzle-orm/sqlite-core'

export const timeStampRow = {
  updateAt: int('updateAt', { mode: 'timestamp_ms' }),
  createdAt: int('createdAt', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
  deletedAt: int('deleted_at', { mode: 'timestamp_ms' })
}

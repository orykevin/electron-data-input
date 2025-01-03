import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timeStampRow } from '../helpers'

export const supplier = sqliteTable('supplier', {
  id: int('id').primaryKey().default(0),
  kode: text('kode'),
  nama: text('nama').notNull().default(''),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

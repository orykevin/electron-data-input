import { AnySQLiteColumn, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timeStampRow } from '../helpers'
import { supplier } from './supplier'

export const unit = sqliteTable('satuan', {
  id: int('id').primaryKey().default(0),
  unit: text('satuan').notNull().default(''),
  jumlah: int('jumlah').notNull().default(1),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

export const barang = sqliteTable('barang', {
  id: int('id').primaryKey().default(0),
  kode: text('kode').notNull().default(''),
  nama: text('nama').notNull().default(''),
  harga: int('harga').notNull().default(0),
  unit: int('unit').references((): AnySQLiteColumn => unit.id),
  supplier: int('supplier').references((): AnySQLiteColumn => supplier.id),
  ...timeStampRow
})

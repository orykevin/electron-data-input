import {
  AnySQLiteColumn,
  int,
  primaryKey,
  sqliteTable,
  text,
  unique
} from 'drizzle-orm/sqlite-core'
import { timeStampRow } from './helpers'
import { relations } from 'drizzle-orm'

// barang

export const barang = sqliteTable('barang', {
  id: int('id').primaryKey({ autoIncrement: true }),
  kode: text('kode').notNull().default(''),
  nama: text('nama').notNull().default(''),
  modal: int('modal').notNull().default(0),
  stockAwal: int('stockAwal').notNull().default(0),
  ...timeStampRow
})

export const unit = sqliteTable('unit', {
  id: int('id').primaryKey({ autoIncrement: true }),
  unit: text('unit').notNull().default(''),
  jumlah: int('jumlah').notNull().default(1),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

export const unitBarang = sqliteTable('unit_barang', {
  id: int('id').primaryKey({ autoIncrement: true }),
  barangId: int('barangId').references((): AnySQLiteColumn => barang.id),
  unitId: int('unitId').references((): AnySQLiteColumn => unit.id)
})

export const harga = sqliteTable('harga', {
  id: int('id').primaryKey({ autoIncrement: true }),
  unitBarangId: int('unitBarangId').references((): AnySQLiteColumn => unitBarang.id),
  harga: int('harga').notNull().default(0),
  persen: int('persen'),
  deskripsi: text('deskripsi')
})

export const hargaLain = sqliteTable('harga_lain', {
  id: int('id').primaryKey({ autoIncrement: true }),
  unitBarangId: int('unitBarangId').references((): AnySQLiteColumn => unitBarang.id),
  harga: int('harga').notNull().default(0),
  persen: int('persen'),
  deskripsi: text('deskripsi')
})

export const barangRelations = relations(barang, ({ many }) => ({
  // supplier: one(supplier, { fields: [barang.supplierId], references: [supplier.id] }),
  // unit: one(unit, { fields: [barang.unitId], references: [unit.id] }),
  unitBarang: many(unitBarang)
}))

export const unitRelations = relations(unit, ({ many }) => ({
  // barang: many(barang),
  unitBarang: many(unitBarang)
}))

export const unitBarangRelations = relations(unitBarang, ({ one, many }) => ({
  barang: one(barang, {
    fields: [unitBarang.barangId],
    references: [barang.id]
  }),
  unit: one(unit, {
    fields: [unitBarang.unitId],
    references: [unit.id]
  }),
  harga: one(harga, {
    fields: [unitBarang.id],
    references: [harga.unitBarangId]
  }),
  hargaLain: many(hargaLain)
}))

export const hargaRelations = relations(harga, ({ one }) => ({
  unitBarang: one(unitBarang, { fields: [harga.unitBarangId], references: [unitBarang.id] })
}))

export const hargaLainRelations = relations(hargaLain, ({ one }) => ({
  unitBarang: one(unitBarang, { fields: [hargaLain.unitBarangId], references: [unitBarang.id] })
}))

//supplier

export const supplier = sqliteTable('supplier', {
  id: int('id').primaryKey({ autoIncrement: true }),
  kode: text('kode'),
  nama: text('nama').notNull().default(''),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

export const supplierRelations = relations(supplier, ({ many }) => ({
  barang: many(barang)
}))

// user

export const user = sqliteTable('user', {
  id: int('id').primaryKey({ autoIncrement: true }),
  username: text('username'),
  password: text('password'),
  isSuperAdmin: int('isSuperAdmin', { mode: 'boolean' }),
  isAdmin: int('isAdmin', { mode: 'boolean' })
})

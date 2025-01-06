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
  id: int('id').primaryKey().default(0),
  kode: text('kode').notNull().default(''),
  nama: text('nama').notNull().default(''),
  modal: int('modal').notNull().default(0),
  stockAwal: int('stockAwal').notNull().default(0),
  ...timeStampRow
})

export const unit = sqliteTable('unit', {
  id: int('id').primaryKey().default(0),
  unit: text('unit').notNull().default(''),
  jumlah: int('jumlah').notNull().default(1),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

export const unitBarang = sqliteTable(
  'unit_barang',
  {
    barangId: int('barangId').references((): AnySQLiteColumn => barang.id),
    unitId: int('unitId').references((): AnySQLiteColumn => unit.id)
  },
  (t) => ({ relation: primaryKey({ columns: [t.barangId, t.unitId] }) })
)

export const harga = sqliteTable(
  'harga',
  {
    id: int('id').primaryKey().default(0),
    barangId: int('barangId').references((): AnySQLiteColumn => barang.id),
    unitId: int('unitId').references((): AnySQLiteColumn => unit.id),
    harga: int('harga').notNull().default(0),
    persen: int('persen'),
    deskripsi: text('deskripsi')
  },
  (t) => ({
    relation: unique('harga_utama').on(t.barangId, t.unitId)
  })
)

export const hargaLain = sqliteTable('harga_lain', {
  id: int('id').primaryKey().default(0),
  barangId: int('barangId').references((): AnySQLiteColumn => barang.id),
  unitId: int('unitId').references((): AnySQLiteColumn => unit.id),
  harga: int('harga').notNull().default(0),
  persen: int('persen'),
  deskripsi: text('deskripsi')
})

export const barangRelations = relations(barang, ({ many }) => ({
  // supplier: one(supplier, { fields: [barang.supplierId], references: [supplier.id] }),
  // unit: one(unit, { fields: [barang.unitId], references: [unit.id] }),
  unitBarang: many(unitBarang),
  harga: many(harga),
  hargaLain: many(hargaLain)
}))

export const unitRelations = relations(unit, ({ many }) => ({
  // barang: many(barang),
  unitBarang: many(unitBarang),
  harga: many(harga),
  hargaLain: many(hargaLain)
}))

export const unitBarangRelations = relations(unitBarang, ({ one }) => ({
  barang: one(barang, { fields: [unitBarang.barangId], references: [barang.id] }),
  unit: one(unit, { fields: [unitBarang.unitId], references: [unit.id] })
}))

export const hargaRelations = relations(harga, ({ one }) => ({
  barang: one(barang, { fields: [harga.barangId], references: [barang.id] }),
  unit: one(unit, { fields: [harga.unitId], references: [unit.id] })
}))

export const hargaLainRelations = relations(hargaLain, ({ one }) => ({
  barang: one(barang, { fields: [hargaLain.barangId], references: [barang.id] }),
  unit: one(unit, { fields: [hargaLain.unitId], references: [unit.id] })
}))

//supplier

export const supplier = sqliteTable('supplier', {
  id: int('id').primaryKey().default(0),
  kode: text('kode'),
  nama: text('nama').notNull().default(''),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

export const supplierRelations = relations(supplier, ({ many }) => ({
  barang: many(barang)
}))

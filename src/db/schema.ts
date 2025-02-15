import { AnySQLiteColumn, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timeStampRow } from './helpers'
import { relations } from 'drizzle-orm'

// barang

export const barang = sqliteTable('barang', {
  id: int('id').primaryKey({ autoIncrement: true }),
  kode: text('kode').notNull().default(''),
  nama: text('nama').notNull().default(''),
  modal: int('modal').notNull().default(0),
  stockAwal: int('stockAwal').notNull().default(0),
  merek: text('merek'),
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
  hargaLain: many(hargaLain),
  penjualanBarang: many(penjualanBarang),
  pembelianBarang: many(pembelianBarang)
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
  alamat: text('alamat'),
  ...timeStampRow
})

export const pelanggan = sqliteTable('pelanggan', {
  id: int('id').primaryKey({ autoIncrement: true }),
  kode: text('kode'),
  nama: text('nama').notNull().default(''),
  deskripsi: text('deskripsi'),
  alamat: text('alamat'),
  ...timeStampRow
})

export const pembelian = sqliteTable('pembelian', {
  id: int('id').primaryKey({ autoIncrement: true }),
  noInvoice: text('noInvoice').notNull().default(''),
  tanggal: int('tanggal', { mode: 'timestamp_ms' }),
  tanggalBayar: int('tanggalBayar', { mode: 'timestamp_ms' }),
  supplierId: int('supplierId').references((): AnySQLiteColumn => supplier.id),
  diskon: int('diskon'),
  pajak: int('pajak'),
  deskripsi: text('deskripsi'),
  ...timeStampRow
})

export const penjualan = sqliteTable('penjualan', {
  id: int('id').primaryKey({ autoIncrement: true }),
  noInvoice: text('noInvoice').notNull().default(''),
  tanggal: int('tanggal', { mode: 'timestamp_ms' }),
  tanggalBayar: int('tanggalBayar', { mode: 'timestamp_ms' }),
  pelangganId: int('pelangganId').references((): AnySQLiteColumn => pelanggan.id),
  diskon: int('diskon'),
  pajak: int('pajak'),
  deskripsi: text('deskripsi'),

  ...timeStampRow
})

export const pembelianBarang = sqliteTable('pembelian_barang', {
  id: int('id').primaryKey({ autoIncrement: true }),
  pembelianId: int('pembelianId').references((): AnySQLiteColumn => pembelian.id),
  unitBarangId: int('unitBarangId').references((): AnySQLiteColumn => unitBarang.id),
  harga: int('harga').notNull().default(0),
  jumlah: int('jumlah').notNull().default(1),
  diskon: int('diskon'),
  ...timeStampRow
})

export const penjualanBarang = sqliteTable('penjualan_barang', {
  id: int('id').primaryKey({ autoIncrement: true }),
  penjualanId: int('penjualanId').references((): AnySQLiteColumn => penjualan.id),
  unitBarangId: int('unitBarangId').references((): AnySQLiteColumn => unitBarang.id),
  harga: int('harga').notNull().default(0),
  jumlah: int('jumlah').notNull().default(1),
  diskon: int('diskon'),
  ...timeStampRow
})

export const supplierRelations = relations(supplier, ({ many }) => ({
  pembelian: many(pembelian)
}))

export const pelangganRelations = relations(pelanggan, ({ many }) => ({
  pembelian: many(pelanggan)
}))

export const pembelianRelations = relations(pembelian, ({ one, many }) => ({
  supplier: one(supplier, {
    fields: [pembelian.supplierId],
    references: [supplier.id]
  }),
  pembelianBarang: many(pembelianBarang)
}))

export const penjualanRelations = relations(penjualan, ({ one, many }) => ({
  pelanggan: one(pelanggan, {
    fields: [penjualan.pelangganId],
    references: [pelanggan.id]
  }),
  penjualanBarang: many(penjualanBarang)
}))

export const pembelianBarangRelations = relations(pembelianBarang, ({ one }) => ({
  pembelian: one(pembelian, {
    fields: [pembelianBarang.pembelianId],
    references: [pembelian.id]
  }),
  unitBarang: one(unitBarang, {
    fields: [pembelianBarang.unitBarangId],
    references: [unitBarang.id]
  })
}))

export const penjualanBarangRelations = relations(penjualanBarang, ({ one }) => ({
  penjualan: one(penjualan, {
    fields: [penjualanBarang.penjualanId],
    references: [penjualan.id]
  }),
  unitBarang: one(unitBarang, {
    fields: [penjualanBarang.unitBarangId],
    references: [unitBarang.id]
  })
}))

// user

export const user = sqliteTable('user', {
  id: int('id').primaryKey({ autoIncrement: true }),
  username: text('username'),
  password: text('password'),
  isSuperAdmin: int('isSuperAdmin', { mode: 'boolean' }),
  isAdmin: int('isAdmin', { mode: 'boolean' })
})

export const pengaturanPrint = sqliteTable('pengaturan_print', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  value: text('value'),
  options: text('options')
})

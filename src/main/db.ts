import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../db/schema'
import fs from 'fs'
import { app } from 'electron'
import path from 'path'

const dbPath = import.meta.env.DEV ? 'sqlite.db' : path.join(app.getPath('userData'), 'data.db')

// Ensure directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.exec('PRAGMA foreign_keys = ON;')

export const db = drizzle(sqlite, { schema })

const tableExists = (tableName: string): boolean => {
  const result = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(tableName)
  return !!result
}

// ---------------------------------------------------------------------------
// Auto-migration system
// Defines the expected schema and applies CREATE TABLE / ALTER TABLE as needed.
// This is idempotent – safe to run on every app startup.
// ---------------------------------------------------------------------------

interface ColumnDef {
  name: string
  type: string // e.g. "integer", "text"
  primaryKey?: boolean
  autoIncrement?: boolean
  notNull?: boolean
  defaultValue?: string // raw SQL default, e.g. "0", "''", "(CURRENT_TIMESTAMP)"
  references?: { table: string; column: string }
}

interface TableDef {
  name: string
  columns: ColumnDef[]
}

/**
 * The single source-of-truth for the expected database schema.
 * Keep this in sync with src/db/schema.ts whenever you add tables or columns.
 *
 * HOW TO ADD A NEW COLUMN:
 *   1. Add the column to the Drizzle schema in src/db/schema.ts
 *   2. Add the matching ColumnDef entry here
 *   3. Rebuild & ship – the app will ALTER TABLE automatically on first launch.
 */
const expectedSchema: TableDef[] = [
  {
    name: 'barang',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'kode', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'nama', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'modal', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'stockAwal', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'unit',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'unit', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'jumlah', type: 'integer', notNull: true, defaultValue: '1' },
      { name: 'deskripsi', type: 'text' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'unit_barang',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'barangId', type: 'integer', references: { table: 'barang', column: 'id' } },
      { name: 'unitId', type: 'integer', references: { table: 'unit', column: 'id' } }
    ]
  },
  {
    name: 'harga',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'unitBarangId', type: 'integer', references: { table: 'unit_barang', column: 'id' } },
      { name: 'harga', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'persen', type: 'integer' },
      { name: 'deskripsi', type: 'text' }
    ]
  },
  {
    name: 'harga_lain',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'unitBarangId', type: 'integer', references: { table: 'unit_barang', column: 'id' } },
      { name: 'harga', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'persen', type: 'integer' },
      { name: 'mode', type: 'text', notNull: true, defaultValue: "'harga_tetap'" },
      { name: 'nilai', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'deskripsi', type: 'text' }
    ]
  },
  {
    name: 'supplier',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'kode', type: 'text' },
      { name: 'nama', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'deskripsi', type: 'text' },
      { name: 'alamat', type: 'text' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'pelanggan',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'kode', type: 'text' },
      { name: 'nama', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'deskripsi', type: 'text' },
      { name: 'alamat', type: 'text' },
      { name: 'ecer', type: 'integer' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'pembelian',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'noInvoice', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'tanggal', type: 'integer' },
      { name: 'tanggalBayar', type: 'integer' },
      { name: 'supplierId', type: 'integer', references: { table: 'supplier', column: 'id' } },
      { name: 'diskon', type: 'integer' },
      { name: 'pajak', type: 'integer' },
      { name: 'deskripsi', type: 'text' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'penjualan',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'noInvoice', type: 'text', notNull: true, defaultValue: "''" },
      { name: 'tanggal', type: 'integer' },
      { name: 'tanggalBayar', type: 'integer' },
      { name: 'pelangganId', type: 'integer', references: { table: 'pelanggan', column: 'id' } },
      { name: 'diskon', type: 'integer' },
      { name: 'pajak', type: 'integer' },
      { name: 'deskripsi', type: 'text' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'pembelian_barang',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'pembelianId', type: 'integer', references: { table: 'pembelian', column: 'id' } },
      { name: 'unitBarangId', type: 'integer', references: { table: 'unit_barang', column: 'id' } },
      { name: 'harga', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'jumlah', type: 'integer', notNull: true, defaultValue: '1' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'penjualan_barang',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'penjualanId', type: 'integer', references: { table: 'penjualan', column: 'id' } },
      { name: 'unitBarangId', type: 'integer', references: { table: 'unit_barang', column: 'id' } },
      { name: 'harga', type: 'integer', notNull: true, defaultValue: '0' },
      { name: 'jumlah', type: 'integer', notNull: true, defaultValue: '1' },
      { name: 'updateAt', type: 'integer' },
      { name: 'createdAt', type: 'integer', defaultValue: '(CURRENT_TIMESTAMP)' },
      { name: 'deleted_at', type: 'integer' }
    ]
  },
  {
    name: 'user',
    columns: [
      { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true, notNull: true },
      { name: 'username', type: 'text' },
      { name: 'password', type: 'text' },
      { name: 'isSuperAdmin', type: 'integer' },
      { name: 'isAdmin', type: 'integer' }
    ]
  }
]

/** Build a CREATE TABLE statement from a TableDef */
const buildCreateTableSQL = (table: TableDef): string => {
  const colDefs: string[] = []
  const fkDefs: string[] = []

  for (const col of table.columns) {
    let def = `\`${col.name}\` ${col.type}`
    if (col.primaryKey) def += ' PRIMARY KEY'
    if (col.autoIncrement) def += ' AUTOINCREMENT'
    if (col.notNull) def += ' NOT NULL'
    if (col.defaultValue !== undefined) def += ` DEFAULT ${col.defaultValue}`
    colDefs.push(def)

    if (col.references) {
      fkDefs.push(
        `FOREIGN KEY (\`${col.name}\`) REFERENCES \`${col.references.table}\`(\`${col.references.column}\`) ON UPDATE no action ON DELETE no action`
      )
    }
  }

  return `CREATE TABLE \`${table.name}\` (\n\t${[...colDefs, ...fkDefs].join(',\n\t')}\n);`
}

/** Build an ALTER TABLE ADD COLUMN statement */
const buildAlterColumnSQL = (tableName: string, col: ColumnDef): string => {
  let def = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${col.name}\` ${col.type}`
  if (col.notNull) def += ' NOT NULL'
  if (col.defaultValue !== undefined) def += ` DEFAULT ${col.defaultValue}`
  // Note: SQLite ALTER TABLE ADD COLUMN does not support FOREIGN KEY inline,
  // but the reference is still tracked by the ORM at the application level.
  return def
}

/** Get existing column names for a table */
const getTableColumns = (tableName: string): Set<string> => {
  const rows = sqlite.prepare(`PRAGMA table_info(\`${tableName}\`)`).all() as {
    name: string
  }[]
  return new Set(rows.map((r) => r.name))
}

/**
 * Run auto-migration: create missing tables, add missing columns.
 * This is idempotent and safe to call on every app startup.
 */
export const runMigrate = () => {
  console.log('[auto-migrate] Starting schema check...')
  let createdTables = 0
  let addedColumns = 0

  for (const table of expectedSchema) {
    if (!tableExists(table.name)) {
      // --- Create the entire table ---
      const sql = buildCreateTableSQL(table)
      console.log(`[auto-migrate] Creating table "${table.name}"`)
      sqlite.exec(sql)
      createdTables++
    } else {
      // --- Add any missing columns ---
      const existingCols = getTableColumns(table.name)
      for (const col of table.columns) {
        if (!existingCols.has(col.name)) {
          const sql = buildAlterColumnSQL(table.name, col)
          console.log(`[auto-migrate] Adding column "${table.name}.${col.name}" → ${sql}`)
          sqlite.exec(sql)
          addedColumns++
        }
      }
    }
  }

  console.log(
    `[auto-migrate] Done. Created ${createdTables} table(s), added ${addedColumns} column(s).`
  )
}

function toDrizzleResult(rows: Record<string, any> | Array<Record<string, any>>) {
  if (!rows) {
    return []
  }
  if (Array.isArray(rows)) {
    return rows.map((row) => {
      return Object.keys(row).map((key) => row[key])
    })
  } else {
    return Object.keys(rows).map((key) => rows[key])
  }
}

export const execute = async (e, sqlstr, params, method) => {
  console.log(e)
  const result = sqlite.prepare(sqlstr)
  const ret = result[method](...params)
  return toDrizzleResult(ret)
}

export const initializeApp = () => {
  try {
    // Create backup before attempting any migrations
    if (fs.existsSync(dbPath)) {
      const backupPath = `${dbPath}.backup-${Date.now()}`
      fs.copyFileSync(dbPath, backupPath)
      console.log(`Database backed up to: ${backupPath}`)

      // Clean up old backups (keep only the 3 most recent)
      const dir = path.dirname(dbPath)
      const baseName = path.basename(dbPath)
      const backups = fs
        .readdirSync(dir)
        .filter((f) => f.startsWith(baseName + '.backup-'))
        .sort()
        .reverse()
      for (const old of backups.slice(3)) {
        fs.unlinkSync(path.join(dir, old))
        console.log(`[auto-migrate] Removed old backup: ${old}`)
      }
    }

    runMigrate()
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return false
  }
}

// Helper function to check database state
export const getDatabaseInfo = () => {
  const tables = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((row) => row.name)

  return {
    tables,
    hasMigrationTable: tableExists('__drizzle_migrations'),
    path: dbPath
  }
}

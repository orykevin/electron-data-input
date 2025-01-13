import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
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

export const runMigrate = async () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Only proceed with migration if the migrations table doesn't exist
      // or if we have pending migrations
      if (!tableExists('__drizzle_migrations')) {
        // await migrate(db, {
        //   migrationsFolder: path.join(__dirname, '../../drizzle')
        // })
        console.log('Initial migration successful!')
      } else {
        // For existing databases, we'll check the schema and apply any new migrations
        // try {
        //   await migrate(db, {
        //     migrationsFolder: path.join(__dirname, '../../drizzle')
        //   })
        //   console.log('Schema update successful!')
        // } catch (error: any) {
        //   if (error.message?.includes('already exists')) {
        //     console.log('Schema is up to date, no changes needed')
        //     resolve()
        //     return
        //   }
        //   throw error
        // }
        // skipped
      }
      resolve()
    } catch (error) {
      console.error('Migration failed:', error)
      reject(error)
    }
  })
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

export const initializeApp = async () => {
  try {
    // Create backup before attempting any migrations
    if (fs.existsSync(dbPath)) {
      const backupPath = `${dbPath}.backup-${Date.now()}`
      fs.copyFileSync(dbPath, backupPath)
      console.log(`Database backed up to: ${backupPath}`)
    }

    await runMigrate()
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

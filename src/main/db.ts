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
// Temporarily disable foreign key constraints during initialization
sqlite.exec('PRAGMA foreign_keys = OFF;')

export const db = drizzle(sqlite, { schema })

const getAllTables = (): string[] => {
  return sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((row) => row.name)
}

const dropAllTables = (): void => {
  const tables = getAllTables()

  // Drop all tables
  tables.forEach((tableName) => {
    sqlite.exec(`DROP TABLE IF EXISTS "${tableName}";`)
  })
}

const initializeDatabase = async (): Promise<void> => {
  try {
    // Disable foreign key constraints temporarily
    sqlite.exec('PRAGMA foreign_keys = OFF;')

    // Drop all existing tables
    dropAllTables()

    // Re-enable foreign key constraints before running migrations
    sqlite.exec('PRAGMA foreign_keys = ON;')
  } catch (error) {
    console.error('Error during database initialization:', error)
    throw error
  }
}

export const runMigrate = async () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Check if we're in development mode
      if (import.meta.env.DEV) {
        // In development, we reset the database
        await initializeDatabase()
      } else {
        // In production, only initialize if migrations table doesn't exist
        const tables = getAllTables()
        if (!tables.includes('__drizzle_migrations')) {
          await initializeDatabase()
        }
      }

      // Run the migrations
      await migrate(db, {
        migrationsFolder: path.join(__dirname, '../../drizzle')
      })

      console.log('Migration successful!')
      resolve()
    } catch (error) {
      console.error('Migration failed:', error)
      reject(error)
    } finally {
      // Always ensure foreign keys are enabled after migration
      sqlite.exec('PRAGMA foreign_keys = ON;')
    }
  })
}

// Use this in your main process
export const initializeApp = async () => {
  try {
    await runMigrate()
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return false
  }
}

// Helper function to check database state
export const checkDatabaseState = () => {
  const tables = getAllTables()
  console.log('Current database tables:', tables)

  const foreignKeysEnabled = sqlite.prepare('PRAGMA foreign_keys').get().foreign_keys
  console.log('Foreign keys enabled:', !!foreignKeysEnabled)

  return {
    tables,
    foreignKeysEnabled: !!foreignKeysEnabled
  }
}

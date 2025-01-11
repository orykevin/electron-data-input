// import Database from 'better-sqlite3'
// import { drizzle } from 'drizzle-orm/better-sqlite3'
// import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
// import path from 'path'
// import { getDatabasePath } from './config'

// const runMigrations = async () => {
//   try {
//     const dbPath = getDatabasePath()
//     console.log('Running migrations on database:', dbPath)

//     const sqlite = new Database(dbPath)
//     const db = drizzle(sqlite)

//     // Migrations are always in the drizzle folder relative to project root
//     const migrationsFolder = path.join(process.cwd(), 'drizzle')

//     await migrate(db, { migrationsFolder })
//     console.log('Migrations completed successfully')

//     sqlite.close()
//   } catch (error) {
//     console.error('Migration failed:', error)
//     process.exit(1)
//   }
// }

// runMigrations()

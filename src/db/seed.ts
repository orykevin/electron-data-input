import Data from '../data/mstok.json'
import { barang, harga, hargaLain, unitBarang } from './schema'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../db/schema'

const sqlite = new Database('sqlite.db')
const db = drizzle(sqlite, { schema })

const seed = async () => {
  try {
    await db.delete(hargaLain)
    await db.delete(harga)
    await db.delete(unitBarang)
    await db.delete(barang)

    const unitData = await db.query.unit.findMany()

    Promise.all(
      Data.map(async (b, i) => {
        const data = {
          kode: b.noitem,
          nama: b.namaitem,
          modal: 0,
          stockAwal: 0
        }

        const createdBarang = await db
          .insert(barang)
          .values({ ...data })
          .returning({ insertedId: barang.id })
        const unit = unitData.find((u) => u.unit === b.unit1.toLowerCase()) || unitData[0]

        const createdUnitBarang = await db
          .insert(unitBarang)
          .values({
            barangId: createdBarang[0].insertedId,
            unitId: unit.id
          })
          .returning({ insertedId: unitBarang.id })

        await db.insert(harga).values({
          unitBarangId: createdUnitBarang[0].insertedId,
          harga: 0
        })

        console.log('created new Data ' + i + ' ' + b.noitem)
      })
    )
    return 'Success Seed'
  } catch (e) {
    console.log(e)
    throw new Error('error when seed')
  }
}

seed()
  .then((res) => {
    console.log(res)
    console.log('Seeded')
  })
  .catch((e) => {
    console.log('Error When seed', e)
  })

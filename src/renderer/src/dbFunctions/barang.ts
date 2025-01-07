import { database } from '@/db'
import { FormDataBarang } from '@/page/barang/FormBarang'
import { barang, harga, hargaLain, unitBarang } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export type DataBarang = Awaited<ReturnType<typeof getBarang>>

export const getBarang = async () => {
  const result = await database.query.barang.findMany({
    with: {
      unitBarang: {
        with: {
          unit: true,
          harga: true,
          hargaLain: true
        }
      }
    }
  })
  return result
}

export const createBarang = async (data: FormDataBarang) => {
  const dataBarang = {
    kode: data.kode,
    nama: data.nama,
    modal: data.modal,
    stockAwal: data.stockAwal
  }

  try {
    const createdBarang = await database
      .insert(barang)
      .values({ ...dataBarang })
      .returning({ insertedId: barang.id })

    await Promise.all(
      data.listHarga.map(async (h) => {
        const createdUnitBarang = await database
          .insert(unitBarang)
          .values({
            unitId: Number(h.unit),
            barangId: createdBarang[0].insertedId
          })
          .returning({ insertedId: unitBarang.id })

        await database.insert(harga).values({
          unitBarangId: createdUnitBarang[0].insertedId,
          harga: h.harga
        })

        await Promise.all(
          h.hargaLain
            .filter((hl) => hl > 0)
            .map(async (hl) => {
              await database.insert(hargaLain).values({
                unitBarangId: createdUnitBarang[0].insertedId,
                harga: hl
              })
            })
        )
      })
    )

    const createdData = await database.query.barang.findFirst({
      where: (barang, { eq }) => eq(barang.id, createdBarang[0].insertedId),
      with: {
        unitBarang: {
          with: {
            unit: true,
            harga: true,
            hargaLain: true
          }
        }
      }
    })

    return createdData
  } catch (err) {
    console.log(err)
  }
}

export const updateBarang = async (data: FormDataBarang, selectedBarang: DataBarang[number]) => {
  const dataBarang = {
    kode: data.kode,
    nama: data.nama,
    modal: data.modal,
    stockAwal: data.stockAwal
  }

  const eqBarangId = eq(barang.id, selectedBarang.id)

  await database
    .update(barang)
    .set({ ...dataBarang, updateAt: new Date() })
    .where(eqBarangId)

  if (selectedBarang.unitBarang.length > data.listHarga.length) {
    const listUnit = data.listHarga.map((ub) => Number(ub.unit))
    const restUnitBarang = selectedBarang.unitBarang.filter((ub) => !listUnit.includes(ub.unit!.id))

    console.log(restUnitBarang, 'restUnitbarang')

    await Promise.all(
      restUnitBarang.map(async (ub) => {
        await Promise.all(
          ub.hargaLain.map(async (hl) => {
            await database.delete(hargaLain).where(eq(hargaLain.id, hl.id))
          })
        )

        await database.delete(harga).where(eq(harga.id, ub.harga.id))

        await database.delete(unitBarang).where(eq(unitBarang.id, ub.id))
      })
    )
  }

  await Promise.all(
    data.listHarga.map(async (ub, i) => {
      const previousUnitBarang = selectedBarang.unitBarang?.[i] || null
      const previousHarga = previousUnitBarang?.harga || null
      const previousHargaLain = previousUnitBarang?.hargaLain || null

      const eqUnitBarangId = previousUnitBarang ? eq(unitBarang.id, previousUnitBarang.id) : null
      const eqHargaId = previousHarga ? eq(harga.id, previousHarga.id) : null

      if (
        previousHargaLain &&
        previousUnitBarang.hargaLain.length > data.listHarga[i].hargaLain.length
      ) {
        const restHargaLain = previousUnitBarang.hargaLain.splice(
          -data.listHarga[i].hargaLain.length
        )
        await Promise.all(
          restHargaLain.map(async (hl) => {
            await database.delete(hargaLain).where(eq(hargaLain.id, hl.id))
          })
        )
      }

      if (eqUnitBarangId) {
        if (previousUnitBarang.id !== Number(ub.unit))
          await database
            .update(unitBarang)
            .set({ unitId: Number(ub.unit) })
            .where(eqUnitBarangId)

        if (eqHargaId && previousHarga.harga !== ub.harga) {
          await database.update(harga).set({ harga: ub.harga }).where(eqHargaId)
        }

        await Promise.all(
          ub.hargaLain.map(async (hl, il) => {
            const previousHL = previousHargaLain?.[il] || null
            const eqHargaLainId = previousHL ? eq(hargaLain.id, previousHL.id) : null

            if (eqHargaLainId) {
              if (hl > 0 && previousHL.harga !== hl) {
                await database.update(hargaLain).set({ harga: hl }).where(eqHargaLainId)
              }
              if (hl < 1) {
                await database.delete(hargaLain).where(eqHargaLainId)
              }
            } else {
              if (hl > 0) {
                await database.insert(hargaLain).values({
                  unitBarangId: previousUnitBarang.id,
                  harga: hl
                })
              }
            }
          })
        )
      } else {
        const newUnitBarangId = await database
          .insert(unitBarang)
          .values({
            unitId: Number(ub.unit),
            barangId: selectedBarang.id
          })
          .returning({ insertedId: unitBarang.id })

        await database.insert(harga).values({
          unitBarangId: newUnitBarangId[0].insertedId,
          harga: ub.harga
        })

        await Promise.all(
          ub.hargaLain
            .filter((hl) => hl > 0)
            .map(async (hl) => {
              await database.insert(hargaLain).values({
                unitBarangId: newUnitBarangId[0].insertedId,
                harga: hl
              })
            })
        )
      }
    })
  )

  return await database.query.barang.findFirst({
    where: (barang, { eq }) => eq(barang.id, selectedBarang.id),
    with: { unitBarang: { with: { unit: true, harga: true, hargaLain: true } } }
  })
}

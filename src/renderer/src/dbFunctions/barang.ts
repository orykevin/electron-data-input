import { database } from '@/db'
import { FormDataBarang } from '@/page/barang/FormBarang'
import {
  barang,
  harga,
  hargaLain,
  pembelianBarang,
  penjualanBarang,
  unit,
  unitBarang
} from '../../../db/schema'
import { eq, like, sql } from 'drizzle-orm'
import { PenjualanData, PenjualanBarangData } from './penjualan'
import { PembelianData, PembelianBarangData } from './pembelian'

export type DataBarang = Awaited<ReturnType<typeof getBarang>>

type MasukKeluar = PenjualanBarangData | PembelianBarangData
export type DataBarangMasukKeluar = MasukKeluar & {
  penjualan?: PenjualanData
  pembelian?: PembelianData
}

export const getBarang = async (page = 0, field = '', search = '') => {
  const limit = 75
  const offsetVal = page * limit
  const result = await database.query.barang.findMany({
    where: like(field === 'kode' ? barang.kode : barang.nama, `%${search.toUpperCase()}%`),
    with: {
      unitBarang: {
        with: {
          unit: true,
          harga: true,
          hargaLain: true
        }
      }
    },
    offset: offsetVal,
    limit: limit
  })
  const total = await getBarangInventory(offsetVal, limit, search, field)
  return result.map((barang) => {
    const totalBarang = total.find((tb) => tb.id === barang.id)
    return {
      ...barang,
      stokMasuk: totalBarang?.totalPembelian || 0,
      stokKeluar: totalBarang?.totalPenjualan || 0
    }
  })
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
    if (createdData) return { ...createdData, stockMasuk: 0, stockAwal: 0 }
    return null
  } catch (err) {
    console.log(err)
    throw new Error(`Error has found`)
  }
}

export const updateBarang = async (data: FormDataBarang, selectedBarang: DataBarang[number]) => {
  const dataBarang = {
    kode: data.kode,
    nama: data.nama,
    modal: data.modal,
    merek: data.merek,
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
        } else {
          if (ub.harga > 0) {
            await database.insert(harga).values({
              unitBarangId: previousUnitBarang.id,
              harga: ub.harga
            })
          }
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

  const returnedValue = await database.query.barang.findFirst({
    where: (barang, { eq }) => eq(barang.id, selectedBarang.id),
    with: { unitBarang: { with: { unit: true, harga: true, hargaLain: true } } }
  })

  if (returnedValue)
    return {
      ...returnedValue,
      stockMasuk: data.stockMasuk || 0,
      stockKeluar: data.stockKeluar || 0
    }
  return null
}

export const editBarangData = async (field: string, id: number, value: any) => {
  try {
    if (field === 'kode') {
      await database.update(barang).set({ kode: value }).where(eq(barang.id, id))
    } else if (field === 'nama') {
      await database.update(barang).set({ nama: value }).where(eq(barang.id, id))
    } else if (field === 'modal') {
      await database.update(barang).set({ modal: value }).where(eq(barang.id, id))
    } else if (field === 'stockAwal') {
      await database.update(barang).set({ stockAwal: value }).where(eq(barang.id, id))
    } else if (field === 'merek') {
      await database.update(barang).set({ merek: value }).where(eq(barang.id, id))
    }
    return 'Succsess'
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export const deleteBarang = async (dataBarang: DataBarang) => {
  try {
    await Promise.all(
      dataBarang.map(async (b) => {
        await Promise.all(
          b.unitBarang.map(async (ub) => {
            await Promise.all(
              ub.hargaLain.map(async (hl) => {
                await database.delete(hargaLain).where(eq(hargaLain.id, hl.id))
              })
            )
            ub.harga && (await database.delete(harga).where(eq(harga.id, ub.harga.id)))
            await database.delete(unitBarang).where(eq(unitBarang.id, ub.id))
          })
        )
        await database.delete(barang).where(eq(barang.id, b.id))
      })
    )

    return 'Succsess'
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export const createHarga = async (unitBarangId: number, value: number) => {
  try {
    const createdHarga = await database
      .insert(harga)
      .values({ unitBarangId, harga: value })
      .returning()
    return createdHarga[0]
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export const updateHargaBarang = async (id: number, value: number) => {
  try {
    const updatedHarga = await database
      .update(harga)
      .set({ harga: value })
      .where(eq(harga.id, id))
      .returning()
    return updatedHarga[0]
  } catch (e) {
    console.log(e)
    throw new Error(`${(e as Error).message}`)
  }
}

export type QueryBarangTable = Awaited<ReturnType<typeof getQueryBarang>>

export const getQueryBarang = async (text: string, field: string) => {
  const result = await database.query.barang.findMany({
    where: like(field === 'kode' ? barang.kode : barang.nama, `%${text.toUpperCase()}%`),
    limit: 100,
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

export async function getBarangInventory(
  offset: number,
  limit: number,
  search: string,
  field: string
) {
  return await database
    .select({
      id: barang.id,
      totalPembelian: sql<number>`COALESCE(
      (
        SELECT SUM(pemb.jumlah * un.jumlah)
        FROM ${pembelianBarang} as pemb
        JOIN ${unitBarang} as ub1 ON ub1.id = pemb.unitBarangId
        JOIN ${unit} as un ON un.id = ub1.unitId
        WHERE ub1.barangId = barang.id
      ),
      0
    )`,
      totalPenjualan: sql<number>`COALESCE(
      (
        SELECT SUM(penj.jumlah * un.jumlah)
        FROM ${penjualanBarang} as penj
        JOIN ${unitBarang} as ub2 ON ub2.id = penj.unitBarangId
        JOIN ${unit} as un ON un.id = ub2.unitId
        WHERE ub2.barangId = barang.id
      ),
      0
    )`
    })
    .from(barang as any)
    .where(like(field === 'kode' ? barang.kode : barang.nama, `%${search.toUpperCase()}%`))
    .offset(offset)
    .limit(limit)
  // .as('b')
  // .then((rows) => {
  //   return rows.map(row => ({
  //     ...row,
  //     stockSekarang: row.stockAwal + row.totalPembelian - row.totalPenjualan
  //   }));
  // });
}

export type HistoryProps = Awaited<ReturnType<typeof getHistoryBarang>>
export type DataKeluarMasuk = {
  id: number
  updateAt: Date | null
  createdAt: Date | null
  deletedAt: Date | null
  jumlah: number
  harga: number
  unitBarangId: number | null
  pembelianId?: number | null
  penjualanId?: number | null
}

export const getHistoryBarang = async (id: number) => {
  const data = await database.query.barang.findFirst({
    where: eq(barang.id, id),
    columns: {
      updateAt: false,
      deletedAt: false
    },
    with: {
      unitBarang: {
        with: {
          unit: true,
          pembelianBarang: { with: { pembelian: true } },
          penjualanBarang: { with: { penjualan: true } }
        }
      }
    }
  })

  let dataKeluarMasuk: any[] = []

  data?.unitBarang.forEach((ub) => {
    dataKeluarMasuk = [...dataKeluarMasuk, ...ub.pembelianBarang, ...ub.penjualanBarang]
  })

  dataKeluarMasuk.sort(
    (a, b) =>
      (a?.pembelian?.tanggal || a?.penjualan?.tanggal) -
      (b?.pembelian?.tanggal || b?.penjualan?.tanggal)
  )

  return { barangData: data, listHistori: dataKeluarMasuk }
}

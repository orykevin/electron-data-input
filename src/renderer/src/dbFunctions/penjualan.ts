import { database } from '@/db'
import { and, eq, gte, InferSelectModel, lte } from 'drizzle-orm'
import { penjualan, penjualanBarang } from '../../../db/schema'
import { DataPenjualanBarang, PenjualanFormData } from '@/page/penjualan'

export type Penjualan = Awaited<ReturnType<typeof getPenjualan>>

export type PenjualanData = InferSelectModel<typeof penjualan>
export type PenjualanBarangData = InferSelectModel<typeof penjualanBarang>

export const getPenjualanId = async (id: number) => {
  return await database.query.penjualan.findFirst({
    where: eq(penjualan.id, id),
    columns: {
      id: true
    },
    with: { penjualanBarang: true }
  })
}

export const getPenjualan = async (id: number) => {
  return await database.query.penjualan.findFirst({
    where: eq(penjualan.id, id),
    columns: {
      id: true,
      deskripsi: true,
      diskon: true,
      noInvoice: true,
      pajak: true,
      pelangganId: true,
      tanggal: true,
      tanggalBayar: true
    },
    with: {
      penjualanBarang: {
        columns: {
          deletedAt: false,
          updateAt: false,
          penjualanId: false,
          unitBarangId: false
        },
        with: {
          unitBarang: {
            columns: {
              barangId: false,
              unitId: false
            },
            with: {
              barang: {
                columns: {
                  deletedAt: false,
                  updateAt: false
                },
                with: {
                  unitBarang: {
                    columns: {
                      barangId: false,
                      unitId: false
                    },
                    with: {
                      harga: true,
                      hargaLain: true,
                      unit: true
                    }
                  }
                }
              },
              harga: true,
              hargaLain: true,
              unit: true
            }
          }
        }
      }
    }
  })
}

export type AllPenjualanType = Awaited<ReturnType<typeof getAllPenjualan>>

export const getAllPenjualan = async (id: null | number, startDate: Date, endDate: Date) => {
  const selectedId = id ? eq(penjualan.pelangganId, id) : undefined

  return await database.query.penjualan.findMany({
    columns: {
      deletedAt: false,
      updateAt: false
    },
    with: { penjualanBarang: { columns: { deletedAt: false, updateAt: false } } },
    where: and(gte(penjualan.tanggal, startDate), lte(penjualan.tanggal, endDate), selectedId),
    orderBy: penjualan.tanggal
  })
}

export const savePenjualan = async (
  formData: PenjualanFormData,
  listPenjualan: DataPenjualanBarang
) => {
  try {
    const createdPenjualan = await database
      .insert(penjualan)
      .values({
        noInvoice: formData.noInvoice,
        pelangganId: Number(formData.pelanggan),
        tanggal: formData.tanggal,
        tanggalBayar: formData.jatuhTempo,
        deskripsi: formData.deskripsi,
        pajak: formData.pajak,
        diskon: formData.diskon
      })
      .returning()

    console.log('created', createdPenjualan)

    await Promise.all(
      listPenjualan.map(async (h) => {
        await database.insert(penjualanBarang).values({
          unitBarangId: h.unitSelected ? Number(h.unitSelected) : h.unitBarang?.id,
          harga: h.harga,
          jumlah: h.jumlah,
          penjualanId: createdPenjualan[0].id
        })
      })
    )

    return true
  } catch (e) {
    throw new Error('Error whenn create penjualan')
  }
}

export const updatePenjualan = async (
  id: number,
  formData: PenjualanFormData,
  listPenjualan: DataPenjualanBarang
) => {
  try {
    const listBarang = await database.query.penjualanBarang.findMany({
      where: eq(penjualanBarang.penjualanId, id)
    })

    await Promise.all(
      listBarang.map(async (b, i) => {
        const newPenjualan = listPenjualan[i]
        if (!newPenjualan) {
          await database.delete(penjualanBarang).where(eq(penjualanBarang.id, b.id))
        } else {
          await database
            .update(penjualanBarang)
            .set({
              unitBarangId: newPenjualan.unitSelected
                ? Number(newPenjualan.unitSelected)
                : newPenjualan.unitBarang?.id,
              updateAt: new Date(),
              harga: newPenjualan.harga,
              jumlah: newPenjualan.jumlah
            })
            .where(eq(penjualanBarang.id, b.id))
        }
      })
    )

    if (listPenjualan.length > listBarang.length) {
      const restListPenjualan = listPenjualan.slice(listBarang.length)

      await Promise.all(
        restListPenjualan.map(async (h) => {
          await database.insert(penjualanBarang).values({
            unitBarangId: h.unitSelected ? Number(h.unitSelected) : h.unitBarang?.id,
            harga: h.harga,
            jumlah: h.jumlah,
            penjualanId: id
          })
        })
      )
    }

    await database
      .update(penjualan)
      .set({
        noInvoice: formData.noInvoice,
        pelangganId: Number(formData.pelanggan),
        tanggal: formData.tanggal,
        tanggalBayar: formData.jatuhTempo,
        deskripsi: formData.deskripsi,
        pajak: formData.pajak,
        diskon: formData.diskon
      })
      .where(eq(penjualan.id, id))

    return true
  } catch (e) {
    throw new Error('Error ketika menyimpan perubahan penjualan')
  }
}

export const deletePenjualan = async (id: number) => {
  try {
    const listBarang = await database.query.penjualanBarang.findMany({
      where: eq(penjualanBarang.penjualanId, id)
    })

    await Promise.all(
      listBarang.map(async (b) => {
        await database.delete(penjualanBarang).where(eq(penjualanBarang.id, b.id))
      })
    )

    await database.delete(penjualan).where(eq(penjualan.id, id))
    return true
  } catch (e) {
    throw new Error('Error when delete penjualan')
  }
}

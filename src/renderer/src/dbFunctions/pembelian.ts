import { database } from '@/db'
import { and, eq, gte, InferSelectModel, lte } from 'drizzle-orm'
import { pembelian, pembelianBarang } from '../../../db/schema'
import { DataPembelianBarang, PembelianFormData } from '@/page/pembelian'

export type Pembelian = Awaited<ReturnType<typeof getPembelian>>

export type PembelianData = InferSelectModel<typeof pembelian>
export type PembelianBarangData = InferSelectModel<typeof pembelianBarang>
export type LastPembelian = Awaited<ReturnType<typeof getLastPembelian>>

export const getPembelianId = async (id: number) => {
  return await database.query.pembelian.findFirst({
    where: eq(pembelian.id, id),
    columns: {
      id: true
    },
    with: { pembelianBarang: true }
  })
}

export const getLastPembelian = async () => {
  return await database.query.pembelian.findMany({
    with: { pembelianBarang: true },
    limit: 10
  })
}

export const getPembelian = async (id: number) => {
  return await database.query.pembelian.findFirst({
    where: eq(pembelian.id, id),
    columns: {
      id: true,
      deskripsi: true,
      diskon: true,
      noInvoice: true,
      pajak: true,
      supplierId: true,
      tanggal: true,
      tanggalBayar: true
    },
    with: {
      pembelianBarang: {
        columns: {
          deletedAt: false,
          updateAt: false,
          pembelianId: false,
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

export type AllPembelianType = Awaited<ReturnType<typeof getAllPembelian>>

export const getAllPembelian = async (id: null | number, startDate: Date, endDate: Date) => {
  const selectedId = id ? eq(pembelian.supplierId, id) : undefined

  return await database.query.pembelian.findMany({
    columns: {
      deletedAt: false,
      updateAt: false
    },
    with: { pembelianBarang: { columns: { deletedAt: false, updateAt: false } } },
    where: and(gte(pembelian.tanggal, startDate), lte(pembelian.tanggal, endDate), selectedId),
    orderBy: pembelian.tanggal
  })
}

export const savePembelian = async (
  formData: PembelianFormData,
  listPembelian: DataPembelianBarang
) => {
  try {
    const createdPembelian = await database
      .insert(pembelian)
      .values({
        noInvoice: formData.noInvoice,
        supplierId: Number(formData.supplier),
        tanggal: formData.tanggal,
        tanggalBayar: formData.jatuhTempo,
        deskripsi: formData.deskripsi,
        pajak: formData.pajak,
        diskon: formData.diskon
      })
      .returning()

    await Promise.all(
      listPembelian.map(async (h) => {
        await database.insert(pembelianBarang).values({
          unitBarangId: h.unitSelected ? Number(h.unitSelected) : h.unitBarang?.id,
          harga: h.harga,
          jumlah: h.jumlah,
          pembelianId: createdPembelian[0].id
        })
      })
    )

    return true
  } catch (e) {
    throw new Error('Error whenn create pembelian')
  }
}

export const updatePembelian = async (
  id: number,
  formData: PembelianFormData,
  listPembelian: DataPembelianBarang
) => {
  try {
    const listBarang = await database.query.pembelianBarang.findMany({
      where: eq(pembelianBarang.pembelianId, id)
    })

    await Promise.all(
      listBarang.map(async (b, i) => {
        const newPembelian = listPembelian[i]
        if (!newPembelian) {
          await database.delete(pembelianBarang).where(eq(pembelianBarang.id, b.id))
        } else {
          await database
            .update(pembelianBarang)
            .set({
              unitBarangId: newPembelian.unitSelected
                ? Number(newPembelian.unitSelected)
                : newPembelian.unitBarang?.id,
              updateAt: new Date(),
              harga: newPembelian.harga,
              jumlah: newPembelian.jumlah
            })
            .where(eq(pembelianBarang.id, b.id))
        }
      })
    )

    if (listPembelian.length > listBarang.length) {
      const restListPembelian = listPembelian.slice(listBarang.length)

      await Promise.all(
        restListPembelian.map(async (h) => {
          await database.insert(pembelianBarang).values({
            unitBarangId: h.unitSelected ? Number(h.unitSelected) : h.unitBarang?.id,
            harga: h.harga,
            jumlah: h.jumlah,
            pembelianId: id
          })
        })
      )
    }

    await database
      .update(pembelian)
      .set({
        noInvoice: formData.noInvoice,
        supplierId: Number(formData.supplier),
        tanggal: formData.tanggal,
        tanggalBayar: formData.jatuhTempo,
        deskripsi: formData.deskripsi,
        pajak: formData.pajak,
        diskon: formData.diskon
      })
      .where(eq(pembelian.id, id))

    return true
  } catch (e) {
    throw new Error('Error ketika menyimpan perubahan pembelian')
  }
}

export const deletePembelian = async (id: number) => {
  try {
    const listBarang = await database.query.pembelianBarang.findMany({
      where: eq(pembelianBarang.pembelianId, id)
    })

    await Promise.all(
      listBarang.map(async (b) => {
        await database.delete(pembelianBarang).where(eq(pembelianBarang.id, b.id))
      })
    )

    await database.delete(pembelian).where(eq(pembelian.id, id))
    return true
  } catch (e) {
    throw new Error('Error when delete pembelian')
  }
}

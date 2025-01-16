import { database } from '@/db'
import { eq } from 'drizzle-orm'
import { penjualan, penjualanBarang } from '../../../db/schema'
import { DataPenjualanBarang, PenjualanFormData } from '@/page/penjualan'

export type Penjualan = Awaited<ReturnType<typeof getPenjualan>>

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

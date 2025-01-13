import { database } from '@/db'
import { eq } from 'drizzle-orm'
import { penjualan } from '../../../db/schema'

export type Penjualan = Awaited<ReturnType<typeof getPenjualan>>

export const getPenjualan = async (id: number) => {
  return await database.query.penjualan.findFirst({
    where: eq(penjualan.id, id),
    columns: {
      deletedAt: false,
      updateAt: false
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

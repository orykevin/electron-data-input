import { database } from '@/db'

export type DataBarang = Awaited<ReturnType<typeof getBarang>>

export const getBarang = async () => {
  const result = await database.query.barang.findMany({
    with: {
      unitBarang: {
        columns: { barangId: false, unitId: false },
        with: {
          unit: {
            columns: { id: true, jumlah: true, unit: true, deskripsi: true },
            with: { harga: true, hargaLain: true }
          }
        }
      }
    }
  })
  return result
}

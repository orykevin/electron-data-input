import { LinkButtonIcon } from '@/components/ui/link-button'
import { DataBarangMasukKeluar, getHistoryBarang, HistoryProps } from '@/dbFunctions/barang'
import { cn, formatWithThousandSeparator } from '@/lib/utils'
import { getMonthShortName } from '@/misc/utils'
import useAllPelanggan from '@/store/usePelangganStore'
import useAllSupplier from '@/store/useSupplierStore'
import { Forward } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const HistoriBarang = () => {
  const [data, setData] = useState<HistoryProps['barangData'] | null>(null)
  const [histori, setHistori] = useState<DataBarangMasukKeluar[]>([])
  const params = useParams()
  const { data: allPelanggan, fetchData: fetchPelanggan } = useAllPelanggan()
  const { data: allSupplier, fetchData: fetchSupplier } = useAllSupplier()
  const [totalStock, setTotalStock] = useState(0)

  const sumOfStock = (
    list: DataBarangMasukKeluar[],
    dataBarang: HistoryProps['barangData'] | null
  ) => {
    return list.reduce((total, item) => {
      const type = item?.pembelian ? 'pembelian' : 'penjualan'
      const itemTotal = dataBarang?.unitBarang.find((ub) => ub.id === item.unitBarangId)
      const jumlahItem = (itemTotal?.unit?.jumlah || 1) * item.jumlah
      if (type === 'pembelian') {
        return total + jumlahItem
      } else {
        return total - jumlahItem
      }
    }, dataBarang?.stockAwal || 0)
  }

  useEffect(() => {
    if (params.id) {
      getHistoryBarang(params.id as never).then((res) => {
        if (res) {
          setData(res.barangData)
          const listHistori = res.listHistori as unknown as DataBarangMasukKeluar[]
          setHistori(listHistori)
          setTotalStock(sumOfStock(listHistori, res?.barangData))
        }
      })
    }
    if (!allPelanggan) fetchPelanggan()
    if (!allSupplier) fetchSupplier()
  }, [])

  return (
    <div>
      <p className="font-semibold text-base">Histori Barang</p>
      <div className="flex justify-between">
        <p className="font-semibold text-sm text-gray-700">
          {data?.kode || ' - '} - {data?.nama || ' - '}
        </p>
        <div className="font-normal text-xs">
          Stock Sekarang : <span className="font-bold text-[18px]">{totalStock}</span>
        </div>
      </div>

      <div className="w-full border-gray-100 border shadow-md my-3" />
      <div>
        <div className="flex justify-between items-center my-1 border border-gray-200 shadow-md px-3 pr-4 rounded-sm py-3">
          <p className="font-semibold">Stock Awal</p>
          <p className="font-bold text-[18px] text-blue-700">+{data?.stockAwal || 0}</p>
        </div>
        {histori.map((item, index) => {
          const detail = item?.pembelian || item?.penjualan
          const type = item?.pembelian ? 'pembelian' : 'penjualan'
          const sumber = item.pembelian?.supplierId
            ? allSupplier.find((s) => s.id === item.pembelian?.supplierId)
            : allPelanggan.find((s) => s.id === item.penjualan?.pelangganId)
          const unitItem = data?.unitBarang.find((ub) => ub.id === item.unitBarangId)
          const jumlahItem = (unitItem?.unit?.jumlah || 1) * item.jumlah

          return (
            <div className="flex justify-between my-1 border border-gray-200 shadow-md px-3 rounded-sm">
              <div className="flex gap-2 items-center">
                <div className="flex gap-2 items-center mr-2 pr-2 border-r-2 border-gray-200 w-24">
                  <p className="font-semibold text-[36px]">
                    {detail?.tanggal ? String(detail.tanggal?.getDate()).padStart(2, '0') : ' - '}
                  </p>
                  <div className="text-center">
                    <p>
                      {detail && detail.tanggal
                        ? getMonthShortName(detail.tanggal?.getMonth())
                        : '-'}
                    </p>
                    <p>{detail && detail.tanggal ? detail.tanggal.getFullYear() : '-'}</p>
                  </div>
                </div>
                <div key={index}>
                  <p className="font-semibold">
                    {type === 'pembelian' ? 'Pembelian : ' : 'Penjualan : '}{' '}
                    {detail?.noInvoice || ' - '}
                  </p>{' '}
                  <p>
                    {type === 'pembelian' ? 'Supplier : ' : 'Pelanggan : '}
                    {sumber?.nama || ' - '}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p
                    className={cn(
                      'text-[18px] font-bold -mb-1 text-end',
                      type === 'penjualan' ? 'text-red-500' : 'text-blue-700'
                    )}
                  >
                    {type === 'pembelian' ? '+' : '-'}
                    {jumlahItem}
                  </p>
                  <p className="text-[16px]">
                    Rp.{formatWithThousandSeparator(item.harga)} / {unitItem?.unit?.unit}
                  </p>
                </div>
                <div>
                  <LinkButtonIcon
                    to={
                      type === 'penjualan'
                        ? `/histori-penjualan/edit-faktur-penjualan/${detail?.id}`
                        : `/histori-pembelian/edit-faktur-pembelian/${detail?.id}`
                    }
                  >
                    <p className="flex gap-2 items-center text-xs">
                      Lihat Faktur <Forward />
                    </p>
                  </LinkButtonIcon>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HistoriBarang

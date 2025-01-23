import { LinkButtonIcon } from '@/components/ui/link-button'
import { getLastPembelian, LastPembelian } from '@/dbFunctions/pembelian'
import { getLastPenjualan, LastPenjualan } from '@/dbFunctions/penjualan'
import { getMonthShortName, getTotalAfterTax } from '@/misc/utils'
import useAllPelanggan from '@/store/usePelangganStore'
import useAllSupplier from '@/store/useSupplierStore'
import { ArrowRight, Pencil, Plus, ReceiptText, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Main = () => {
  const [penjualanData, setPenjualanData] = useState<LastPenjualan>([])
  const [pembelianData, setPembelianData] = useState<LastPembelian>([])
  const {
    data: allPelanggan,
    fetchData: fetchPelanggan,
    initialized: initPelanggan
  } = useAllPelanggan()
  const {
    data: allSupplier,
    fetchData: fetchSupplier,
    initialized: initSupplier
  } = useAllSupplier()

  useEffect(() => {
    getLastPembelian().then((result) => {
      setPembelianData(result)
    })
    getLastPenjualan().then((result) => {
      setPenjualanData(result)
    })
    if (!initPelanggan) fetchPelanggan()
    if (!initSupplier) fetchSupplier()
  }, [])

  return (
    <div>
      <div className="grid grid-cols-12 gap-3 h-[calc(100vh-112px)]">
        <div className="col-span-6 border border-gray-200 shadow-sm py-1 px-2 rounded-sm">
          <div className="flex justify-between items-center border-b border-gray-200 shadow-sm py-2 mb-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <ReceiptText /> Penjualan
            </p>
            <LinkButtonIcon icon={<Plus />} className="text-xs" to="/buat-faktur-penjualan">
              Buat Penjualan Baru
            </LinkButtonIcon>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold">Penjualan Terakhir</p>
              <Link to="/histori-penjualan" className="underline flex gap-1 items-center">
                Penjualan lainnya
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="mt-3 overflow-auto h-[calc(100vh-225px)]">
            {penjualanData.map((item) => {
              const supplier = allPelanggan.find((pelanggan) => pelanggan.id === item.pelangganId)
              return (
                <div className="flex gap-3 items-center my-2 py-0 px-3 border border-gray-200 rounded-md shadow-sm justify-between  ">
                  <div className="flex gap-3 items-center">
                    <div className="border-r border-gray-200 pr-3">
                      <div className="flex gap-2 items-center">
                        <p className="font-semibold text-[36px]">
                          {item?.tanggal ? String(item.tanggal?.getDate()).padStart(2, '0') : ' - '}
                        </p>
                        <div className="text-center">
                          <p>{item.tanggal ? getMonthShortName(item.tanggal?.getMonth()) : '-'}</p>
                          <p>{item.tanggal ? item.tanggal.getFullYear() : '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{item?.noInvoice || '-'}</p>
                      <p className="text-[16px] leading-[15px] text-gray-700">
                        {supplier?.nama || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold">
                      Rp.
                      {getTotalAfterTax(
                        item.penjualanBarang.reduce(
                          (total, barang) => total + (barang.harga || 0) * barang.jumlah,
                          0
                        ),
                        item?.pajak || 0,
                        item?.diskon || 0
                      )}
                    </p>
                    <div className="flex gap-2">
                      <LinkButtonIcon to={`/histori-penjualan/edit-faktur-penjualan/${item.id}`}>
                        <Pencil />
                      </LinkButtonIcon>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="col-span-6 border border-gray-200 shadow-sm py-1 px-2 rounded-sm">
          <div className="flex justify-between items-center border-b border-gray-200 shadow-sm py-2 mb-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag /> Pembelian
            </p>
            <LinkButtonIcon icon={<Plus />} className="text-xs" to="/buat-faktur-pembelian">
              Buat Pembelian Baru
            </LinkButtonIcon>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold">Pembelian Terakhir</p>
              <Link to="/histori-pembelian" className="underline flex gap-1 items-center">
                Pembelian lainnya
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="mt-3 overflow-auto h-[calc(100vh-225px)]">
            {pembelianData.map((item) => {
              const supplier = allSupplier.find((supplier) => supplier.id === item.supplierId)
              return (
                <div className="flex gap-3 items-center my-2 py-0 px-3 border border-gray-200 rounded-md shadow-sm justify-between  ">
                  <div className="flex gap-3 items-center">
                    <div className="border-r border-gray-200 pr-3">
                      <div className="flex gap-2 items-center">
                        <p className="font-semibold text-[36px]">
                          {item?.tanggal ? String(item.tanggal?.getDate()).padStart(2, '0') : ' - '}
                        </p>
                        <div className="text-center">
                          <p>{item.tanggal ? getMonthShortName(item.tanggal?.getMonth()) : '-'}</p>
                          <p>{item.tanggal ? item.tanggal.getFullYear() : '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{item?.noInvoice || '-'}</p>
                      <p className="text-[16px] leading-[15px] text-gray-700">
                        {supplier?.nama || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold">
                      Rp.
                      {getTotalAfterTax(
                        item.pembelianBarang.reduce(
                          (total, barang) => total + (barang.harga || 0) * barang.jumlah,
                          0
                        ),
                        item?.pajak || 0,
                        item?.diskon || 0
                      )}
                    </p>
                    <div className="flex gap-2">
                      <LinkButtonIcon to={`/histori-pembelian/edit-faktur-pembelian/${item.id}`}>
                        <Pencil />
                      </LinkButtonIcon>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main

import { DataBarangMasukKeluar, getHistoryBarang, HistoryProps } from '@/dbFunctions/barang'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const HistoriBarang = () => {
  const [data, setData] = useState<HistoryProps['barangData'] | null>(null)
  const [histori, setHistori] = useState<DataBarangMasukKeluar[]>([])
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      getHistoryBarang(params.id as never).then((res) => {
        if (res) {
          setData(res.barangData)
          const listHistori = res.listHistori as unknown as DataBarangMasukKeluar[]
          setHistori(listHistori)
          console.log(listHistori, 'histori')
        }
      })
    }
  }, [])

  return (
    <div>
      <p className="font-semibold text-base">Histori Barang</p>
      <p className="font-semibold text-sm text-gray-700">
        {data?.kode || ' - '} - {data?.nama || ' - '}
      </p>
      <div className="w-full border-gray-100 border shadow-md my-3" />
      <div></div>
    </div>
  )
}

export default HistoriBarang

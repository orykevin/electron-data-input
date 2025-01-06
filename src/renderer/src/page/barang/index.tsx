import TableBarang from './TableBarang'
import MenuBarang from './MenuBarang'
import { useEffect, useState } from 'react'
import { DataBarang, getBarang } from '@/dbFunctions/barang'
import useAllUnit from '@/store/useUnitStore'

const Barang = () => {
  const [isEditable, setIsEditable] = useState(false)
  const [barangs, setBarangs] = useState<DataBarang | []>([])
  const [searchBarangs, setSearchBarangs] = useState<DataBarang | []>([])
  const { data: unitData, fetchData, initialized } = useAllUnit()

  useEffect(() => {
    if (unitData && !initialized) {
      fetchData()
    }
  }, [])

  useEffect(() => {
    getBarang().then((result) => {
      setBarangs(result)
      setSearchBarangs(result)
      console.log(result, 'tesult')
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Barang Page</h1>
      <MenuBarang setEditable={setIsEditable} barangs={barangs} setBarangs={setSearchBarangs} />
      <TableBarang isEditable={isEditable} barangs={searchBarangs} />
    </div>
  )
}

export default Barang

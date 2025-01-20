import { getBarang, getBarangInventory } from '@/dbFunctions/barang'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const Main = () => {
  useEffect(() => {
    getBarang().then((res) => console.log(res))
  }, [])
  return (
    <div>
      <p>this is main</p>
      <Link to="barang"> Go to Barang </Link>
    </div>
  )
}

export default Main

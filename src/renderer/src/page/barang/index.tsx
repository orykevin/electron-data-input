import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import TableBarang from './TableBarang'
import MenuBarang from './MenuBarang'
import { useState } from 'react'

const Barang = () => {
  const [isEditable, setIsEditable] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Barang Page</h1>
      <MenuBarang setEditable={setIsEditable} />
      <TableBarang isEditable={isEditable} />
    </div>
  )
}

export default Barang

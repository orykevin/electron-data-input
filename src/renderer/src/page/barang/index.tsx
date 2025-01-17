import TableBarang from './TableBarang'
import MenuBarang from './MenuBarang'
import { useEffect, useMemo, useState } from 'react'
import { DataBarang, getBarang } from '@/dbFunctions/barang'
import useAllUnit from '@/store/useUnitStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FormBarang from './FormBarang'

const Barang = () => {
  const [isEditable, setIsEditable] = useState(false)
  const [barangs, setBarangs] = useState<DataBarang | []>([])
  const [searchBarangs, setSearchBarangs] = useState<DataBarang | []>([])
  const { data: unitData, fetchData, initialized } = useAllUnit()
  const [selectedBarangId, setSelectedBarangId] = useState<number | null>(null)

  const selectedBarang = useMemo(() => {
    const barangData = searchBarangs.find((barang) => barang.id === selectedBarangId)
    const barangData2 = barangs.find((barang) => barang.id === selectedBarangId)
    return barangData || barangData2
  }, [searchBarangs, barangs, selectedBarangId])

  useEffect(() => {
    if (unitData && !initialized) {
      fetchData()
    }
  }, [])

  useEffect(() => {
    getBarang().then((result) => {
      setBarangs(result)
      setSearchBarangs(result)
    })
  }, [])

  return (
    <div>
      <MenuBarang
        setEditable={setIsEditable}
        barangs={barangs}
        setBarangs={setBarangs}
        setSearchBarangs={setSearchBarangs}
      />
      <TableBarang
        isEditable={isEditable}
        barangs={searchBarangs}
        setSelectedBarangId={setSelectedBarangId}
        setSearchBarangs={setSearchBarangs}
      />
      <Dialog
        open={selectedBarangId && selectedBarang ? true : false}
        onOpenChange={() => setSelectedBarangId(null)}
      >
        <DialogContent className="w-[100wh] max-w-[100wh] max-h-[90dvh] overflow-auto">
          <DialogHeader>
            {' '}
            <DialogTitle>Edit Barang</DialogTitle>
          </DialogHeader>
          <div>
            {selectedBarang && (
              <FormBarang
                setSearchBarangs={setSearchBarangs}
                setBarangs={setSearchBarangs}
                type="edit"
                selectedBarang={selectedBarang}
                setSelectedBarangId={setSelectedBarangId}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Barang

import TableBarang from './TableBarang'
import MenuBarang from './MenuBarang'
import { useEffect, useMemo, useState } from 'react'
import { DataBarang, deleteBarang, getBarang } from '@/dbFunctions/barang'
import useAllUnit from '@/store/useUnitStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FormBarang from './FormBarang'
import { Button } from '@/components/ui/button'

const Barang = () => {
  const [isEditable, setIsEditable] = useState(false)
  const [barangs, setBarangs] = useState<DataBarang | []>([])
  const [searchBarangs, setSearchBarangs] = useState<DataBarang | []>([])
  const { data: unitData, fetchData, initialized } = useAllUnit()
  const [selectedBarangId, setSelectedBarangId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedBarang = useMemo(() => {
    const barangData = searchBarangs.find((barang) => barang.id === selectedBarangId)
    const barangData2 = barangs.find((barang) => barang.id === selectedBarangId)
    return barangData || barangData2
  }, [searchBarangs, barangs, selectedBarangId]) as DataBarang[0] | undefined

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState('')

  const reFetching = async () => {
    if (loading) return
    getBarang(page + 1, searchField, search).then((result) => {
      setBarangs((prev) => [...prev, ...result])
      setSearchBarangs(result)
      setLoading(false)
    })
    setPage((prev) => prev + 1)
  }

  const refreshData = () => {
    setLoading(true)
    getBarang(0, searchField, search)
      .then((result) => {
        setBarangs(result)
        setSearchBarangs(result)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
    setPage(0)
  }

  const deleteBarangHandler = async () => {
    if (!selectedBarang) return
    await deleteBarang([selectedBarang])
    setIsDeleting(false)
    setSelectedBarangId(null)
    refreshData()
  }

  useEffect(() => {
    if (unitData && !initialized) {
      fetchData()
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [search, searchField])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
      if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
        setLoading(true)
        reFetching()
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loading, reFetching])

  return (
    <div>
      <MenuBarang
        setEditable={setIsEditable}
        barangs={barangs}
        setBarangs={setBarangs}
        setSearch={setSearch}
        setSearchField={setSearchField}
        onRefresh={refreshData}
        loading={loading}
      />
      <TableBarang
        isEditable={isEditable}
        barangs={barangs}
        setSelectedBarangId={setSelectedBarangId}
        setSearchBarangs={setSearchBarangs}
        loading={loading}
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
                setBarangs={setBarangs}
                type="edit"
                selectedBarang={selectedBarang}
                setSelectedBarangId={setSelectedBarangId}
                onSuccess={refreshData}
                setIsDeleting={setIsDeleting}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleting} onOpenChange={() => setIsDeleting(false)}>
        <DialogContent>
          <DialogHeader>Hapus Barang?</DialogHeader>
          <div>
            <p>
              Apakah kamu yakin mau menghapus <br />{' '}
              <b>{selectedBarang?.nama + ' ' + selectedBarang?.merek}</b>
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setIsDeleting(false)}>
              Batal
            </Button>
            <Button className="flex-1" variant={'destructive'} onClick={deleteBarangHandler}>
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Barang

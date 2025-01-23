import { getSupplier, SupplierData } from '@/dbFunctions/supplier'
import { create } from 'zustand'

interface MyStore {
  data: SupplierData
  isLoading: boolean
  error: string | null
  initialized: boolean
  fetchData: () => Promise<void>
}

const useAllSupplier = create<MyStore>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  initialized: false, // Tracks if the data is already fetched

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const allSuplier = await getSupplier()
      set({ data: allSuplier, isLoading: false, initialized: true })
    } catch (err) {
      set({ error: 'Failed to fetch data', isLoading: false, initialized: true })
    }
  }
}))

export default useAllSupplier

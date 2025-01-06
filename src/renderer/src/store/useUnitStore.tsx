import { DataUnit, getAllUnit } from '@/dbFunctions/unit'
import { create } from 'zustand'

interface MyStore {
  data: DataUnit
  isLoading: boolean
  error: string | null
  initialized: boolean
  fetchData: () => Promise<void>
}

const useAllUnit = create<MyStore>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  initialized: false, // Tracks if the data is already fetched

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const allUnit = await getAllUnit()
      set({ data: allUnit, isLoading: false, initialized: true })
    } catch (err) {
      set({ error: 'Failed to fetch data', isLoading: false, initialized: true })
    }
  }
}))

export default useAllUnit

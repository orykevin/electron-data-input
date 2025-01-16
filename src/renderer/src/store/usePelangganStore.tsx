import { getPelanggan, PelangganData } from '@/dbFunctions/pelanggan'
import { create } from 'zustand'

interface MyStore {
  data: PelangganData
  isLoading: boolean
  error: string | null
  initialized: boolean
  fetchData: () => Promise<void>
}

const useAllPelanggan = create<MyStore>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  initialized: false, // Tracks if the data is already fetched

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const allUnit = await getPelanggan()
      set({ data: allUnit, isLoading: false, initialized: true })
    } catch (err) {
      set({ error: 'Failed to fetch data', isLoading: false, initialized: true })
    }
  }
}))

export default useAllPelanggan

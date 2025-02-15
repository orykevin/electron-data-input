import { getPengaturanPrint } from '@/dbFunctions/pengaturanPrint'
import { InferSelectModel } from 'drizzle-orm'
import { pengaturanPrint } from 'src/db/schema'
import { create } from 'zustand'

interface MyStore {
  data: InferSelectModel<typeof pengaturanPrint>[]
  isLoading: boolean
  error: string | null
  initialized: boolean
  fetchData: () => Promise<void>
}

const usePengaturanPrint = create<MyStore>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  initialized: false, // Tracks if the data is already fetched

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const allSuplier = await getPengaturanPrint()
      set({ data: allSuplier, isLoading: false, initialized: true })
    } catch (err) {
      set({ error: 'Failed to fetch data', isLoading: false, initialized: true })
    }
  }
}))

export default usePengaturanPrint

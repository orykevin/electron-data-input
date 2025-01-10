import { DataUnit, getAllUnit } from '@/dbFunctions/unit'
import { loginWithPassword, UserData } from '@/dbFunctions/user'
import { create } from 'zustand'

interface MyStore {
  data: UserData | null
  isLoading: boolean
  error: string | null
  initialized: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const useUser = create<MyStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  initialized: false, // Tracks if the data is already fetched

  login: async (username: string, password: string) => {
    console.log(username, password, 'login')
    set({ isLoading: true, error: null })
    try {
      const user = await loginWithPassword(username, password)
      set({ data: user, isLoading: false, initialized: true })
    } catch (err: any) {
      set({ error: err.message as string, isLoading: false, initialized: true })
    }
  },
  logout: async () => {
    set({ data: null, isLoading: false, error: null })
  }
}))

export default useUser

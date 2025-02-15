import Main from './page/main'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { Separator } from './components/ui/separator'
import NavBreadcrumbs from './components/nav-breadcrumbs'
import { Route, Routes } from 'react-router-dom'
import Barang from './page/barang'
import useUser from './store/useUserStore'
import LoginForm from './components/login-form'
import PengaturanAkun from './page/pengaturan-akun'
import PelangganPage from './page/pelanggan'
import SupplierPage from './page/supplier'
import PenjualanPage from './page/penjualan'
import HistoriPenjualan from './page/history-penjualan'
import PengaturanUnit from './page/pengaturan-unit'
import PembelianPage from './page/pembelian'
import HistoriPembelian from './page/history-pembelian'
import HistoriBarang from './page/histori-barang'

function App(): JSX.Element {
  const { data: userData } = useUser()

  if (!userData) return <LoginForm />

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-b-gray-200 shadow-sm mb-4">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <NavBreadcrumbs />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 py-0">
            <Routes>
              <Route index element={<Main />}></Route>
              <Route path="/list-barang" element={<Barang />}></Route>
              <Route path="/pengaturan-unit" element={<PengaturanUnit />} />
              {userData && <Route path="/pengaturan-akun" element={<PengaturanAkun />}></Route>}
              <Route path="/daftar-pelanggan" element={<PelangganPage />}></Route>
              <Route path="/daftar-supplier" element={<SupplierPage />}></Route>
              <Route
                path="/buat-faktur-penjualan"
                element={<PenjualanPage mode="baru" key={'buat-penjualan'} />}
              ></Route>
              <Route path="/histori-penjualan" element={<HistoriPenjualan />}></Route>
              <Route path="/histori-pembelian" element={<HistoriPembelian />}></Route>
              <Route
                path="histori-penjualan/edit-faktur-penjualan/:id"
                element={<PenjualanPage mode="edit" key={'edit-penjualan'} />}
              ></Route>
              <Route
                path="/buat-faktur-pembelian"
                element={<PembelianPage mode="baru" key={'buat-pembelian'} />}
              ></Route>
              <Route
                path="histori-pembelian/edit-faktur-pembelian/:id"
                element={<PembelianPage mode="edit" key={'edit-pembelian'} />}
              ></Route>
              <Route path="list-barang/histori-barang/:id" element={<HistoriBarang />}></Route>
            </Routes>

            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default App

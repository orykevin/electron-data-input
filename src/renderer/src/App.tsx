import { useEffect, useState } from 'react'
import { database } from './db'
import Main from './page/main'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { Separator } from './components/ui/separator'
import NavBreadcrumbs from './components/nav-breadcrumbs'
import { Route, Routes } from 'react-router-dom'
import Barang from './page/barang'
import { createUser } from './dbFunctions/user'
import { Button } from './components/ui/button'
import useUser from './store/useUserStore'
import LoginForm from './components/login-form'
import PengaturanAkun from './page/pengaturan-akun'

function App(): JSX.Element {
  // const handleCrateUser = () => {
  //   createUser('admin', 'admin', true, true).then(() => {
  //     console.log('success')
  //   })
  // }

  const { data: userData, login, logout } = useUser()

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
              {/* <Button onClick={handleCrateUser}>Create User</Button> */}
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Routes>
              <Route index element={<Main />}></Route>
              <Route path="/barang" element={<Barang />}></Route>
              {userData && <Route path="/pengaturan-akun" element={<PengaturanAkun />}></Route>}
            </Routes>

            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default App

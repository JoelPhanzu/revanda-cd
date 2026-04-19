import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useUIStore } from '@/store'

export function Layout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="layout">
      <Header />
      <div className="layout-container">
        <Sidebar />
        <main className={`main-content ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
          <Outlet />
        </main>
      </div>
      <NotificationCenter />
    </div>
  )
}

export default Layout
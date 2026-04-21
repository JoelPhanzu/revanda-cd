import { Outlet } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { NotificationCenter } from '@/components/NotificationCenter'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <NotificationCenter />
    </div>
  )
}

export default MainLayout

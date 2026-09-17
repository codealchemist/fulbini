import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export function AppShell() {
  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6 md:pb-10">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}

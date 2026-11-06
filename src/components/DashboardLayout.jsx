import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardHeader from './DashboardHeader.jsx'
import Sidebar from './Sidebar.jsx'
import './DashboardLayout.css'

const pageTitles = {
  '/overview': 'Overview',
  '/orders': 'Orders',
  '/analytics': 'Analytics',
  '/inventory': 'Inventory & Alerts',
}

function getSavedTheme() {
  const savedTheme = window.localStorage.getItem('dashboard-theme')
  return savedTheme === 'dark' ? 'dark' : 'light'
}

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(getSavedTheme)
  const menuButtonRef = useRef(null)
  const pageTitleRef = useRef(null)
  const sidebarRef = useRef(null)
  const { pathname } = useLocation()
  const pageTitle = pageTitles[pathname] ?? 'Overview'

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('dashboard-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined
    }

    sidebarRef.current?.querySelector('a[href]')?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsSidebarOpen(false)
        menuButtonRef.current?.focus()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const links = sidebarRef.current?.querySelectorAll('a[href]')
      const firstLink = links?.[0]
      const lastLink = links?.[links.length - 1]

      if (!firstLink || !lastLink) {
        return
      }

      if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault()
        lastLink.focus()
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault()
        firstLink.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarOpen])

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  function closeSidebarAfterNavigation() {
    setIsSidebarOpen(false)
    requestAnimationFrame(() => pageTitleRef.current?.focus())
  }

  return (
    <div className="dashboard-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onNavigate={closeSidebarAfterNavigation}
        sidebarRef={sidebarRef}
      />
      {isSidebarOpen && (
        <button
          aria-label="Close navigation menu"
          className="sidebar-backdrop"
          onClick={closeSidebar}
          type="button"
        />
      )}
      <div className="dashboard-main">
        <DashboardHeader
          isSidebarOpen={isSidebarOpen}
          menuButtonRef={menuButtonRef}
          onThemeToggle={() =>
            setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')
          }
          onMenuClick={() => setIsSidebarOpen((open) => !open)}
          pageTitle={pageTitle}
          pageTitleRef={pageTitleRef}
          theme={theme}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

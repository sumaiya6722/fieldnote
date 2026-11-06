import { Bell, Menu, Moon, Sun, X } from 'lucide-react'

function DashboardHeader({
  isSidebarOpen,
  menuButtonRef,
  onMenuClick,
  onThemeToggle,
  pageTitle,
  pageTitleRef,
  theme,
}) {
  const MenuIcon = isSidebarOpen ? X : Menu

  return (
    <header className="dashboard-header">
      <div className="header-title-group">
        <button
          aria-controls="dashboard-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          ref={menuButtonRef}
          type="button"
        >
          <MenuIcon aria-hidden="true" size={20} />
        </button>
        <h1 ref={pageTitleRef} tabIndex={-1}>{pageTitle}</h1>
      </div>

      <div className="header-actions">
        <button
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          className="theme-toggle-button"
          onClick={onThemeToggle}
          type="button"
        >
          {theme === 'light' ? (
            <Moon aria-hidden="true" size={17} />
          ) : (
            <Sun aria-hidden="true" size={17} />
          )}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
        <span
          aria-label="Notifications"
          className="icon-button notification-button"
          role="img"
        >
          <Bell aria-hidden="true" size={19} />
        </span>
        <div aria-label="Account" className="profile-area" role="group">
          <span aria-hidden="true" className="profile-avatar">
            A
          </span>
          <span className="profile-name">Account</span>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader

import {
  Activity,
  Boxes,
  LayoutDashboard,
  ShoppingBag,
  Store,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Overview', path: '/overview', Icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', Icon: ShoppingBag },
  { label: 'Analytics', path: '/analytics', Icon: Activity },
  { label: 'Inventory & Alerts', path: '/inventory', Icon: Boxes },
]

function Sidebar({ isOpen, onNavigate, sidebarRef }) {
  return (
    <aside
      className={`sidebar${isOpen ? ' sidebar-open' : ''}`}
      id="dashboard-sidebar"
      ref={sidebarRef}
    >
      <div className="sidebar-brand">
        <span aria-hidden="true" className="brand-icon">
          <Store size={20} />
        </span>
        <span className="brand-copy">
          <span className="brand-name">Fieldnote</span>
          <span className="brand-caption">Merchant operations</span>
        </span>
      </div>

      <nav aria-label="Main navigation" className="sidebar-navigation">
        <p className="navigation-label">Workspace</p>
        {navigationItems.map(({ label, path, Icon }) => (
          <NavLink
            aria-label={label}
            className={({ isActive }) =>
              `navigation-link${isActive ? ' navigation-link-active' : ''}`
            }
            key={path}
            onClick={onNavigate}
            to={path}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
            <span className="navigation-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span aria-hidden="true" className="sidebar-footer-mark" />
        <span>Dhaka desk <strong>BDT</strong></span>
      </div>
    </aside>
  )
}

export default Sidebar

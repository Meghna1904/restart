import { Icon } from '@iconify/react'
import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/home',   label: 'Now',     icon: 'lucide:sun' },
  { to: '/brain',  label: 'Brain',   icon: 'lucide:brain' },
  { to: '/ideas',  label: 'Ideas',   icon: 'lucide:lightbulb' },
  { to: '/vault',  label: 'Vault',   icon: 'lucide:archive' },
  { to: '/me',     label: 'Me',      icon: 'lucide:user' },
  { to: '/insights', label: 'Patterns', icon: 'lucide:sparkles' },
  { to: '/restart', label: 'Restart', icon: 'lucide:rotate-ccw' },
]

export default function TabBar() {
  const location = useLocation()

  return (
    <nav className="tab-bar" role="navigation" aria-label="Main navigation">
      {TABS.map(tab => {
        const active = location.pathname === tab.to
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`tab-item ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon icon={tab.icon} width={24} height={24} style={{ marginBottom: 4 }} />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

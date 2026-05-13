import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Tag,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import './Navbar.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/categories', label: 'Categories', icon: Tag },
]

// Our main navigation bar component that sits at the top of the app.
// It handles showing the right links and the user's profile info.
export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Logs the user out of the app by clearing their session data, 
  // then redirects them back to the login page so they can't access protected areas.
  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <TrendingUp size={22} className="brand-icon" />
        <span className="brand-name">FinTrack</span>
      </div>
      
      <div className="nav-links">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar-end">
        <div className="user-chip">
          <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <span className="username">{user?.username}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  )
}

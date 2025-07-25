import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  FolderOpen,
  Lightbulb,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Award,
  Gift
} from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', color: '#00AEEF' },
    { path: '/proyectos', icon: FolderOpen, label: 'Proyectos', color: '#4CAF50' },
    { path: '/ideas', icon: Lightbulb, label: 'Ideas de IA', color: '#FF9800' },
    { path: '/reuniones', icon: Calendar, label: 'Reuniones', color: '#9C27B0' },
    { path: '/documentos', icon: FileText, label: 'Documentos', color: '#2196F3' },
    { path: '/indicadores', icon: BarChart3, label: 'Indicadores', color: '#F44336' },
    { path: '/colaboradores', icon: Users, label: 'Colaboradores', color: '#607D8B' },
    { path: '/empleado-mes', icon: Award, label: 'Empleado del Mes', color: '#FF5722' },
    { path: '/beneficios', icon: Gift, label: 'Beneficios', color: '#795548' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="logo">
            <div className="logo-icon">
              <span>🤖</span>
            </div>
            <div className="logo-text">
              <h1>Informatik-AI</h1>
              <span>Hub Interno</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Equipo Informatik-AI</span>
            <div className="user-avatar">
              <span>IA</span>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <nav className="sidebar-nav">
            <ul className="nav-list">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <li key={item.path} className="nav-item">
                    <Link
                      to={item.path}
                      className={`nav-link ${active ? 'nav-link-active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        '--item-color': item.color
                      }}
                    >
                      <Icon size={20} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                      {active && <div className="nav-indicator" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <div className="app-version">
              <span>v1.0.0</span>
            </div>
          </div>
        </aside>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

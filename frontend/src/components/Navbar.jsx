import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'Shop' },
    ...(isAuthenticated ? [{ to: '/orders', label: 'My Orders' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ]

  return (
    <nav className="bg-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-bold tracking-wider text-white hover:text-gold transition-colors">
            STYLISH
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-sm tracking-widest uppercase transition-colors duration-200 ${
                  location.pathname === link.to ? 'text-gold' : 'text-white/80 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            {isAuthenticated && (
              <Link to="/cart" className="relative group">
                <svg className="w-6 h-6 text-white/80 group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-navy text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-fade-in">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-white/60 text-sm font-body">Hi, {user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-sm font-body text-white/80 hover:text-gold transition-colors uppercase tracking-wider">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-body text-white/80 hover:text-gold transition-colors uppercase tracking-wider">Login</Link>
                <Link to="/register" className="btn-gold text-sm py-2 px-4">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-3 animate-slide-up">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block text-sm uppercase tracking-widest text-white/80 hover:text-gold py-2">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="block text-sm uppercase tracking-widest text-white/80 hover:text-gold py-2 w-full text-left">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm uppercase tracking-widest text-white/80 hover:text-gold py-2">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-sm uppercase tracking-widest text-white/80 hover:text-gold py-2">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

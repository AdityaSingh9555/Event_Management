import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, Ticket, LayoutDashboard, QrCode, Menu, X, LogOut, User, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth, useCart } from '@/hooks/useStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

  const navItems = [
    { path: '/', label: 'Events', icon: Search },
    ...(user ? [{ path: '/tickets', label: 'My Tickets', icon: Ticket }] : []),
    ...(isOrganizer ? [{ path: '/organizer', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isOrganizer ? [{ path: '/checkin', label: 'Check-In', icon: QrCode }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 cursor-pointer select-none group" onDoubleClick={() => window.location.reload()}>
              <div className="relative w-10 h-10 bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-[2px]" />
                <Sparkles className="w-6 h-6 text-white relative z-10 animate-pulse" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-rose-500 group-hover:to-purple-600 transition-all duration-500">
                EventHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block text-sm">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">{user.role}</Badge>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">EventHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premier platform for event discovery, ticketing, and management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Attendees</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Browse Events</Link></li>
              <li><Link to="/tickets" className="hover:text-foreground">My Tickets</Link></li>
              <li><span className="hover:text-foreground">Help Center</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Organizers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/organizer" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/checkin" className="hover:text-foreground">Check-In App</Link></li>
              <li><span className="hover:text-foreground">Pricing</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground">About</span></li>
              <li><span className="hover:text-foreground">Careers</span></li>
              <li><span className="hover:text-foreground">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 EventHub. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

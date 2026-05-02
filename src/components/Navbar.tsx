import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Ticket, Menu, X, User, LogOut, LayoutDashboard, Calendar, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useStore'
import { useCart } from '@/hooks/useStore'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-8 cursor-pointer select-none" onDoubleClick={() => window.location.reload()}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl hidden sm:block">EventHub</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full h-10 pl-10 pr-4 rounded-full border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {user?.role === 'organizer' || user?.role === 'admin' ? (
            <Link to="/organizer">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
          ) : null}

          {user?.role === 'admin' && (
            <Link to="/checkin">
              <Button variant="ghost" size="sm">
                <QrCode className="w-4 h-4 mr-2" /> Check-in
              </Button>
            </Link>
          )}

          <Link to="/tickets">
            <Button variant="ghost" size="sm">
              <Ticket className="w-4 h-4 mr-2" /> My Tickets
            </Button>
          </Link>

          <Link to="/cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4 mr-2" /> Cart
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {user?.role === 'organizer' && (
            <Link to="/organizer" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
          )}

          <Link to="/tickets" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Ticket className="w-4 h-4 mr-2" /> My Tickets
            </Button>
          </Link>

          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <ShoppingCart className="w-4 h-4 mr-2" /> Cart ({totalItems})
            </Button>
          </Link>

          {user ? (
            <>
              <div className="flex items-center gap-2 p-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.name} ({user.role})</span>
              </div>
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

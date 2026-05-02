import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, ArrowLeft, Minus, Plus, ShoppingCart, Share2, Heart, CheckCircle, AlertTriangle, Zap, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { events, cart, auth } from '@/lib/store'
import { formatDate, formatCurrency, getCategoryTheme } from '@/lib/utils'
import type { Event } from '@/types'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [showAddedToast, setShowAddedToast] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const currentUser = auth.getCurrentUser()

  useEffect(() => {
    if (id) {
      const found = events.getById(id)
      if (found) {
        setEvent(found)
      }
    }
  }, [id])

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Event not found</h2>
          <Button variant="outline" className="rounded-full" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const theme = getCategoryTheme(event.category)

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketTypeId] || 0
      const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId)
      if (!ticketType) return prev

      const available = ticketType.quantityTotal - ticketType.quantitySold - ticketType.quantityHeld
      const newQty = Math.max(0, Math.min(current + delta, Math.min(ticketType.maxPerOrder, available)))

      if (newQty === 0) {
        const { [ticketTypeId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [ticketTypeId]: newQty }
    })
  }

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'WELCOME15') {
      setDiscountApplied(true)
    } else {
      alert('Invalid promo code')
    }
  }

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/events/${event.id}` } })
      return
    }

    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      if (quantity > 0) {
        cart.addItem({ ticketTypeId, eventId: event.id, quantity })
      }
    })
    setShowAddedToast(true)
    setTimeout(() => setShowAddedToast(false), 3000)
    setSelectedTickets({})
    setDiscountApplied(false)
    setPromoCode('')
  }

  const totalSelected = Object.values(selectedTickets).reduce((sum, q) => sum + q, 0)
  const subtotalPrice = Object.entries(selectedTickets).reduce((sum, [ticketTypeId, qty]) => {
    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId)
    return sum + (ticketType ? ticketType.price * qty : 0)
  }, 0)
  
  const discountAmount = discountApplied ? subtotalPrice * 0.15 : 0
  const totalPrice = subtotalPrice - discountAmount

  const isPastEvent = new Date(event.endDate) < new Date()
  const isSoldOut = event.ticketTypes.every(t => t.quantityTotal - t.quantitySold - t.quantityHeld <= 0)

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Toast */}
      {showAddedToast && (
        <div className="fixed top-24 right-4 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold text-lg">Added to cart!</span>
          <Button variant="secondary" size="sm" className="ml-4 font-bold rounded-full" onClick={() => navigate('/cart')}>
            View Cart
          </Button>
        </div>
      )}

      {/* Immersive Hero Banner */}
      <div className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
        <img 
          src={event.bannerImage || '/placeholder-event.jpg'} 
          alt={event.title}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute top-6 left-6 z-20">
          <Button variant="secondary" size="sm" onClick={() => navigate('/')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-0 rounded-full transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
          <div className="max-w-6xl mx-auto flex flex-col items-start">
            <Badge className={`mb-4 px-4 py-1.5 text-sm font-bold border-none ${theme.badgeBg} backdrop-blur-md`}>
              {event.category.toUpperCase()}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg leading-tight max-w-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/90 text-sm md:text-base font-medium">
              <span className={`flex items-center px-4 py-2 rounded-full ${theme.dateBg} backdrop-blur-md`}>
                <Calendar className="w-5 h-5 mr-2" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md">
                <MapPin className="w-5 h-5 mr-2" />
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <section>
            <h2 className="text-2xl font-extrabold mb-6 text-slate-900">About this event</h2>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 md:p-10">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Venue Info */}
          <section>
            <h2 className="text-2xl font-extrabold mb-6 text-slate-900">Venue Location</h2>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${theme.dateBg}`}>
                    <MapPin className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 mb-2">{event.venue.name}</h3>
                    <p className="text-slate-500 text-lg mb-1">{event.venue.address}</p>
                    <p className="text-slate-500 text-lg mb-4">{event.venue.city}</p>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg w-fit">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span className="font-semibold text-slate-600">Capacity: {event.venue.capacity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Interactive Map */}
                <div className="mt-8 rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50">
                  <iframe 
                    width="100%" 
                    height="350" 
                    frameBorder="0" 
                    style={{ border: 0 }} 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venue.name + ' ' + event.venue.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`} 
                    allowFullScreen
                    title={`${event.venue.name} Location`}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tags */}
          <section>
            <div className="flex flex-wrap gap-3">
              {event.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-4 py-2 text-sm font-bold bg-slate-200/50 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                  #{tag}
                </Badge>
              ))}
            </div>
          </section>

          {/* Organizer */}
          <section>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {event.organizerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 mb-1">{event.organizerName}</h3>
                  <p className="text-slate-500 font-medium">Official Event Organizer</p>
                </div>
                <Button variant="outline" className={`ml-auto rounded-full font-bold border-2 ${theme.borderHover} transition-colors`}>
                  <Heart className="w-4 h-4 mr-2" /> Follow
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sidebar - Premium Glassmorphic Tickets Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className={`border-0 shadow-2xl ${theme.shadow} rounded-[2rem] bg-white/80 backdrop-blur-2xl overflow-hidden`}>
              <CardContent className="p-8">
                <h2 className="text-2xl font-extrabold mb-6 text-slate-900">Select Tickets</h2>

                {isPastEvent ? (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl">
                    <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-lg">This event has ended</p>
                  </div>
                ) : isSoldOut ? (
                  <div className="text-center py-10 bg-rose-50 rounded-3xl border border-rose-100">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <p className="font-extrabold text-rose-600 text-xl">Sold Out</p>
                    <p className="font-medium text-rose-500/80 mt-2">All tickets have been claimed</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Discount Banner */}
                    {!discountApplied && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-orange-500/20 mb-6 flex items-start gap-3">
                        <Zap className="w-6 h-6 shrink-0 text-yellow-200 fill-yellow-200 animate-pulse" />
                        <div>
                          <h4 className="font-extrabold text-sm mb-0.5">First-Time User?</h4>
                          <p className="text-xs text-white/90 font-medium leading-tight mb-2">Use code <strong className="bg-black/20 px-1.5 py-0.5 rounded text-white tracking-wider">WELCOME15</strong> for a flat 15% discount!</p>
                        </div>
                      </div>
                    )}

                    {event.ticketTypes.map(ticketType => {
                      const available = ticketType.quantityTotal - ticketType.quantitySold - ticketType.quantityHeld
                      const selectedQty = selectedTickets[ticketType.id] || 0
                      const isSoldOutType = available <= 0

                      return (
                        <div key={ticketType.id} className={`border-2 rounded-2xl p-5 bg-white transition-all duration-300 ${isSoldOutType ? 'opacity-50 border-slate-100' : `${theme.borderHover} shadow-sm hover:shadow-md`}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-lg leading-none mb-1.5">{ticketType.name}</h3>
                              <p className="text-sm text-slate-500 font-medium">{ticketType.description}</p>
                            </div>
                            <span className="font-extrabold text-xl text-slate-900">{formatCurrency(ticketType.price)}</span>
                          </div>

                          {isSoldOutType ? (
                            <Badge variant="secondary" className="w-full justify-center py-2 text-sm mt-2 rounded-xl">Sold Out</Badge>
                          ) : (
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                {available} left
                              </span>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-full border-slate-200 hover:border-slate-300"
                                  onClick={() => handleQuantityChange(ticketType.id, -1)}
                                  disabled={selectedQty === 0}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-6 text-center font-extrabold text-lg">{selectedQty}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-full border-slate-200 hover:border-slate-300"
                                  onClick={() => handleQuantityChange(ticketType.id, 1)}
                                  disabled={selectedQty >= Math.min(ticketType.maxPerOrder, available)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {totalSelected > 0 && (
                      <div className="pt-4 animate-in slide-in-from-bottom-4">
                        <Separator className="mb-6" />
                        
                        {/* Promo Code Input */}
                        {!discountApplied ? (
                          <div className="flex gap-2 mb-6">
                            <Input 
                              placeholder="Promo Code" 
                              className="rounded-xl border-slate-200 font-medium"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button variant="secondary" className="rounded-xl font-bold" onClick={applyPromoCode}>
                              Apply
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <span className="font-bold text-sm">WELCOME15 Applied</span>
                            </div>
                            <span className="text-sm font-bold">-15%</span>
                          </div>
                        )}

                        <div className="space-y-3 mb-6 bg-slate-50 p-5 rounded-2xl">
                          <div className="flex justify-between text-sm font-medium text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotalPrice)}</span>
                          </div>
                          {discountApplied && (
                            <div className="flex justify-between text-sm font-bold text-emerald-600">
                              <span>Discount</span>
                              <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-extrabold text-2xl text-slate-900 pt-2 border-t border-slate-200">
                            <span>Total</span>
                            <span>{formatCurrency(totalPrice)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          className={`w-full py-6 text-lg font-extrabold rounded-2xl text-white transition-all ${theme.button}`}
                          size="lg"
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart className="w-5 h-5 mr-3" />
                          Checkout {totalSelected} ticket{totalSelected > 1 ? 's' : ''}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl py-6 font-bold border-2 hover:bg-slate-50">
                <Share2 className="w-5 h-5 mr-2 text-slate-500" /> Share
              </Button>
              <Button variant="outline" className="flex-1 rounded-2xl py-6 font-bold border-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                <Heart className="w-5 h-5 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

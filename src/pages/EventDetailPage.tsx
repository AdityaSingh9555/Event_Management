import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, ArrowLeft, Minus, Plus, ShoppingCart, Share2, Heart, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { events, cart, auth } from '@/lib/store'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Event, TicketType } from '@/types'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [showAddedToast, setShowAddedToast] = useState(false)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Event not found</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>
        </div>
      </div>
    )
  }

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
  }

  const totalSelected = Object.values(selectedTickets).reduce((sum, q) => sum + q, 0)
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketTypeId, qty]) => {
    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId)
    return sum + (ticketType ? ticketType.price * qty : 0)
  }, 0)

  const isPastEvent = new Date(event.endDate) < new Date()
  const isSoldOut = event.ticketTypes.every(t => t.quantityTotal - t.quantitySold - t.quantityHeld <= 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      {showAddedToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Added to cart!</span>
          <Button variant="ghost" size="sm" className="text-white hover:text-white/80 ml-2" onClick={() => navigate('/cart')}>
            View Cart
          </Button>
        </div>
      )}

      {/* Banner */}
      <div className="relative h-72 md:h-96">
        <img 
          src={event.bannerImage || '/placeholder-event.jpg'} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/')} className="bg-white/90 backdrop-blur">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-3 bg-white/20 text-white backdrop-blur">
              {event.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">About this event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Venue Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Venue</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{event.venue.name}</h3>
                  <p className="text-muted-foreground text-sm">{event.venue.address}</p>
                  <p className="text-muted-foreground text-sm">{event.venue.city}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Capacity: {event.venue.capacity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>

          {/* Organizer */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Organizer</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {event.organizerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{event.organizerName}</h3>
                  <p className="text-sm text-muted-foreground">Event Organizer</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Heart className="w-4 h-4 mr-2" /> Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Tickets */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Select Tickets</h2>

                {isPastEvent ? (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">This event has ended</p>
                  </div>
                ) : isSoldOut ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-medium text-amber-600">Sold Out</p>
                    <p className="text-sm text-muted-foreground mt-1">All tickets have been sold</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {event.ticketTypes.map(ticketType => {
                      const available = ticketType.quantityTotal - ticketType.quantitySold - ticketType.quantityHeld
                      const selectedQty = selectedTickets[ticketType.id] || 0
                      const isSoldOutType = available <= 0

                      return (
                        <div key={ticketType.id} className={`border rounded-lg p-4 ${isSoldOutType ? 'opacity-50' : 'hover:border-primary transition-colors'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{ticketType.name}</h3>
                              <p className="text-sm text-muted-foreground">{ticketType.description}</p>
                            </div>
                            <span className="font-bold text-lg">{formatCurrency(ticketType.price)}</span>
                          </div>

                          {isSoldOutType ? (
                            <Badge variant="secondary" className="w-full justify-center">Sold Out</Badge>
                          ) : (
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-muted-foreground">
                                {available} available
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(ticketType.id, -1)}
                                  disabled={selectedQty === 0}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{selectedQty}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
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
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totalPrice)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(totalPrice)}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          size="lg"
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add {totalSelected} ticket{totalSelected > 1 ? 's' : ''} to Cart
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

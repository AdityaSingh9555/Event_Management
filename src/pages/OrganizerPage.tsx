import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, DollarSign, Ticket, TrendingUp, Calendar, Plus, Edit, Eye, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth, useEvents } from '@/hooks/useStore'
import { events as eventsApi, analytics, resetData } from '@/lib/store'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Event, EventStatus, EventCategory } from '@/types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function OrganizerPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { events: allEvents, refresh } = useEvents()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'create'>('dashboard')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    if (user && user.role !== 'organizer' && user.role !== 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Sign in as Organizer</h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    )
  }

  const myEvents = allEvents.filter(e => e.organizerId === user.id || user.role === 'admin')
  const publishedEvents = myEvents.filter(e => e.status === 'published')
  const draftEvents = myEvents.filter(e => e.status === 'draft')

  // Calculate stats
  const totalRevenue = myEvents.reduce((sum, e) => {
    const eventAnalytics = analytics.getEventAnalytics(e.id)
    return sum + eventAnalytics.revenue
  }, 0)
  const totalTickets = myEvents.reduce((sum, e) => {
    const eventAnalytics = analytics.getEventAnalytics(e.id)
    return sum + eventAnalytics.ticketsSold
  }, 0)
  const totalAttendees = myEvents.reduce((sum, e) => {
    const eventAnalytics = analytics.getEventAnalytics(e.id)
    return sum + eventAnalytics.checkIns
  }, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-slate-900 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
              <p className="text-slate-400">Manage your events and track performance</p>
            </div>
            <Button onClick={() => setActiveTab('create')} className="bg-white text-slate-900 hover:bg-slate-100">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            {(['dashboard', 'events', 'create'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab 
            totalRevenue={totalRevenue} 
            totalTickets={totalTickets} 
            totalAttendees={totalAttendees}
            publishedEvents={publishedEvents.length}
            myEvents={myEvents}
          />
        )}
        {activeTab === 'events' && (
          <EventsTab 
            events={myEvents} 
            onEdit={(event) => { setSelectedEvent(event); setActiveTab('create'); }}
            onRefresh={refresh}
          />
        )}
        {activeTab === 'create' && (
          <CreateEventTab 
            editEvent={selectedEvent}
            onSuccess={() => { refresh(); setActiveTab('events'); setSelectedEvent(null); }}
            onCancel={() => { setActiveTab('events'); setSelectedEvent(null); }}
          />
        )}
      </div>
    </div>
  )
}

function DashboardTab({ totalRevenue, totalTickets, totalAttendees, publishedEvents, myEvents }: {
  totalRevenue: number
  totalTickets: number
  totalAttendees: number
  publishedEvents: number
  myEvents: Event[]
}) {
  // Aggregate daily sales across all events
  const dailySales: Record<string, number> = {}
  myEvents.forEach(event => {
    const eventAnalytics = analytics.getEventAnalytics(event.id)
    eventAnalytics.dailySales.forEach(day => {
      dailySales[day.date] = (dailySales[day.date] || 0) + day.revenue
    })
  })

  const chartData = Object.entries(dailySales)
    .map(([date, revenue]) => ({ date: date.slice(5), revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendees</p>
                <p className="text-2xl font-bold">{totalAttendees.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-2xl font-bold">{publishedEvents}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Last 14 days revenue across all events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myEvents.slice(0, 5).map(event => {
              const eventAnalytics = analytics.getEventAnalytics(event.id)
              const soldPercent = eventAnalytics.totalTickets > 0 
                ? (eventAnalytics.ticketsSold / eventAnalytics.totalTickets) * 100 
                : 0

              return (
                <div key={event.id} className="flex items-center gap-4">
                  <img src={event.bannerImage} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatCurrency(eventAnalytics.revenue)} revenue</span>
                      <span>{eventAnalytics.ticketsSold} sold</span>
                      <span>{eventAnalytics.checkIns} checked in</span>
                    </div>
                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EventsTab({ events, onEdit, onRefresh }: { events: Event[]; onEdit: (e: Event) => void; onRefresh: () => void }) {
  const navigate = useNavigate()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      eventsApi.delete(id)
      onRefresh()
    }
  }

  const handleToggleStatus = (event: Event) => {
    const newStatus: EventStatus = event.status === 'published' ? 'draft' : 'published'
    eventsApi.update(event.id, { status: newStatus })
    onRefresh()
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">Create your first event to get started</p>
        </div>
      ) : (
        events.map(event => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img 
                  src={event.bannerImage || '/placeholder-event.jpg'} 
                  alt={event.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(event.startDate)}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
                          {event.status}
                        </Badge>
                        <Badge variant="outline">{event.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(event)}
                      >
                        {event.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    {event.ticketTypes.map(tt => {
                      const available = tt.quantityTotal - tt.quantitySold - tt.quantityHeld
                      const percent = (tt.quantitySold / tt.quantityTotal) * 100
                      return (
                        <div key={tt.id}>
                          <p className="text-sm font-medium">{tt.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tt.quantitySold}/{tt.quantityTotal} sold
                          </p>
                          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function CreateEventTab({ editEvent, onSuccess, onCancel }: { 
  editEvent: Event | null
  onSuccess: () => void
  onCancel: () => void 
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: editEvent?.title || '',
    description: editEvent?.description || '',
    category: editEvent?.category || 'concert' as EventCategory,
    startDate: editEvent ? new Date(editEvent.startDate).toISOString().slice(0, 16) : '',
    endDate: editEvent ? new Date(editEvent.endDate).toISOString().slice(0, 16) : '',
    venueName: editEvent?.venue.name || '',
    venueAddress: editEvent?.venue.address || '',
    venueCity: editEvent?.venue.city || '',
    venueCapacity: editEvent?.venue.capacity || 100,
    bannerImage: editEvent?.bannerImage || '',
    tags: editEvent?.tags.join(', ') || '',
    status: editEvent?.status || 'draft' as EventStatus,
    ticketTypes: editEvent?.ticketTypes || [
      { name: 'General Admission', description: 'Standard entry', price: 50, quantityTotal: 100, maxPerOrder: 10 }
    ],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const eventData = {
      title: formData.title,
      description: formData.description,
      bannerImage: formData.bannerImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      startDate: formData.startDate,
      endDate: formData.endDate,
      venue: {
        id: editEvent?.venue.id || `venue-${Date.now()}`,
        name: formData.venueName,
        address: formData.venueAddress,
        city: formData.venueCity,
        capacity: Number(formData.venueCapacity),
        seatingLayout: 'general' as const,
      },
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: formData.status,
      organizerId: user!.id,
      organizerName: user!.name,
      ticketTypes: formData.ticketTypes.map((tt, i) => ({
        id: editEvent?.ticketTypes[i]?.id || `tt-${Date.now()}-${i}`,
        name: tt.name,
        description: tt.description,
        price: Number(tt.price),
        currency: 'USD',
        quantityTotal: Number(tt.quantityTotal),
        quantitySold: editEvent?.ticketTypes[i]?.quantitySold || 0,
        quantityHeld: 0,
        maxPerOrder: Number(tt.maxPerOrder),
        eventId: editEvent?.id || '',
      })),
    }

    if (editEvent) {
      eventsApi.update(editEvent.id, eventData)
    } else {
      eventsApi.create(eventData)
    }

    setTimeout(() => {
      setIsSubmitting(false)
      onSuccess()
    }, 500)
  }

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: '', description: '', price: 0, quantityTotal: 100, maxPerOrder: 10 }]
    }))
  }

  const updateTicketType = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((tt, i) => i === index ? { ...tt, [field]: value } : tt)
    }))
  }

  const removeTicketType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">{editEvent ? 'Edit Event' : 'Create New Event'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Summer Music Festival 2026"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea 
                required
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as EventCategory }))}
                >
                  <option value="concert">Concert</option>
                  <option value="conference">Conference</option>
                  <option value="sports">Sports</option>
                  <option value="theater">Theater</option>
                  <option value="workshop">Workshop</option>
                  <option value="festival">Festival</option>
                  <option value="networking">Networking</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as EventStatus }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input 
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input 
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Banner Image URL</Label>
              <Input 
                value={formData.bannerImage}
                onChange={e => setFormData(prev => ({ ...prev, bannerImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input 
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="music, outdoor, summer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Venue Name</Label>
              <Input 
                required
                value={formData.venueName}
                onChange={e => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input 
                required
                value={formData.venueAddress}
                onChange={e => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input 
                  required
                  value={formData.venueCity}
                  onChange={e => setFormData(prev => ({ ...prev, venueCity: e.target.value }))}
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input 
                  type="number"
                  required
                  value={formData.venueCapacity}
                  onChange={e => setFormData(prev => ({ ...prev, venueCapacity: Number(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.ticketTypes.map((tt, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ticket Type {index + 1}</h4>
                  {formData.ticketTypes.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeTicketType(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Name (e.g., VIP)"
                    value={tt.name}
                    onChange={e => updateTicketType(index, 'name', e.target.value)}
                    required
                  />
                  <Input 
                    placeholder="Description"
                    value={tt.description}
                    onChange={e => updateTicketType(index, 'description', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input 
                    type="number"
                    placeholder="Price ($)"
                    value={tt.price}
                    onChange={e => updateTicketType(index, 'price', Number(e.target.value))}
                    required
                  />
                  <Input 
                    type="number"
                    placeholder="Total Quantity"
                    value={tt.quantityTotal}
                    onChange={e => updateTicketType(index, 'quantityTotal', Number(e.target.value))}
                    required
                  />
                  <Input 
                    type="number"
                    placeholder="Max per order"
                    value={tt.maxPerOrder}
                    onChange={e => updateTicketType(index, 'maxPerOrder', Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTicketType} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Ticket Type
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" size="lg" loading={isSubmitting}>
            {editEvent ? 'Update Event' : 'Create Event'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

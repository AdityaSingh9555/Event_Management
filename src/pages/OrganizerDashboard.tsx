import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, Users, Ticket, DollarSign, Calendar, Plus, Eye, Edit, Trash2, AlertCircle, Download, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useStore'
import { events, analytics, tickets as ticketStore } from '@/lib/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Event, Analytics } from '@/types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [eventAnalytics, setEventAnalytics] = useState<Analytics | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'analytics' | 'checkin'>('overview')

  useEffect(() => {
    if (user) {
      const orgEvents = events.getByOrganizer(user.id)
      setMyEvents(orgEvents)
      if (orgEvents.length > 0 && !selectedEvent) {
        setSelectedEvent(orgEvents[0].id)
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedEvent) {
      setEventAnalytics(analytics.getEventAnalytics(selectedEvent))
    }
  }, [selectedEvent])

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">This area is for organizers only</p>
        </div>
      </div>
    )
  }

  const totalRevenue = myEvents.reduce((sum, e) => {
    return sum + e.ticketTypes.reduce((ts, t) => ts + (t.price * t.quantitySold), 0)
  }, 0)

  const totalTickets = myEvents.reduce((sum, e) => sum + e.ticketTypes.reduce((ts, t) => ts + t.quantitySold, 0), 0)
  const totalCapacity = myEvents.reduce((sum, e) => sum + e.ticketTypes.reduce((ts, t) => ts + t.quantityTotal, 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and track performance</p>
          </div>
          <Link to="/organizer/events/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-1">
          {(['overview', 'events', 'analytics', 'checkin'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === 'overview' && <BarChart3 className="w-4 h-4 mr-2" />}
              {tab === 'events' && <Calendar className="w-4 h-4 mr-2" />}
              {tab === 'analytics' && <TrendingUp className="w-4 h-4 mr-2" />}
              {tab === 'checkin' && <QrCode className="w-4 h-4 mr-2" />}
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-bold">{myEvents.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity Used</p>
                      <p className="text-2xl font-bold">
                        {totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your most recently created events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={event.bannerImage} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{formatDate(event.startDate)}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
                              {event.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {event.ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0)} sold
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {myEvents.map(event => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img src={event.bannerImage} alt={event.title} className="w-full md:w-48 h-32 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.venue.name}, {event.venue.city}</p>
                        </div>
                        <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-semibold">
                            {formatCurrency(event.ticketTypes.reduce((sum, t) => sum + (t.price * t.quantitySold), 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sold</p>
                          <p className="font-semibold">
                            {event.ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0)} / {event.ticketTypes.reduce((sum, t) => sum + t.quantityTotal, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-semibold">{formatDate(event.startDate).split(',')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Event:</label>
              <select 
                className="border rounded-md px-3 py-2 bg-background"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {myEvents.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>

            {eventAnalytics && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(eventAnalytics.revenue)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">Tickets Sold</p>
                      <p className="text-2xl font-bold">{eventAnalytics.ticketsSold}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">Check-ins</p>
                      <p className="text-2xl font-bold">{eventAnalytics.checkIns}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={eventAnalytics.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(val) => val.slice(5)} />
                        <YAxis />
                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={myEvents.find(e => e.id === selectedEvent)?.ticketTypes.map(t => ({
                              name: t.name,
                              value: t.quantitySold
                            })) || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {myEvents.find(e => e.id === selectedEvent)?.ticketTypes.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Ticket Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={eventAnalytics.dailySales.slice(-14)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(val) => val.slice(5)} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="text-center py-20">
            <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check-in Scanner</h2>
            <p className="text-muted-foreground mb-6">Use the mobile check-in app to scan tickets at the venue</p>
            <Link to="/checkin">
              <Button size="lg">
                <QrCode className="w-5 h-5 mr-2" /> Open Scanner
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

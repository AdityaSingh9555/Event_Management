import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Ticket, Filter, ChevronRight, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { events } from '@/lib/store'
import { formatDateShort, formatCurrency } from '@/lib/utils'
import type { Event, EventCategory } from '@/types'

const CATEGORIES: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'concert', label: 'Concerts', icon: '🎵' },
  { value: 'conference', label: 'Conferences', icon: '💼' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'theater', label: 'Theater', icon: '🎭' },
  { value: 'workshop', label: 'Workshops', icon: '🛠️' },
  { value: 'festival', label: 'Festivals', icon: '🎪' },
  { value: 'networking', label: 'Networking', icon: '🤝' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | ''>('')
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [searchResults, setSearchResults] = useState<Event[]>([])

  useEffect(() => {
    const allEvents = events.getAll().filter(e => e.status === 'published')
    setFeaturedEvents(allEvents.slice(0, 3))
    setUpcomingEvents(allEvents.slice(0, 8))
    setSearchResults(allEvents)
  }, [])

  useEffect(() => {
    const results = events.search(searchQuery, selectedCategory ? { category: selectedCategory } : undefined)
    setSearchResults(results)
  }, [searchQuery, selectedCategory])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Star className="w-3 h-3 mr-1" /> The #1 Event Ticketing Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Amazing<br />Events Near You
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            From concerts to conferences, find and book tickets for the best events in your city.
          </p>

          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search events, artists, venues..."
                className="pl-10 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-14 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            className="whitespace-nowrap"
          >
            All Events
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className="whitespace-nowrap"
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      {!searchQuery && !selectedCategory && (
        <section className="py-8 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Event Grid */}
      <section className="py-8 px-4 max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {searchQuery || selectedCategory ? 'Search Results' : 'Upcoming Events'}
          </h2>
          <span className="text-muted-foreground">{searchResults.length} events found</span>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FeaturedEventCard({ event }: { event: Event }) {
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price))
  const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + (t.quantityTotal - t.quantitySold - t.quantityHeld), 0)

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
      <Link to={`/events/${event.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.bannerImage || '/placeholder-event.jpg'} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur">
              {event.category}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm font-medium">
              {formatDateShort(event.startDate)}
            </p>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1">{event.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {event.venue.city}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">{formatCurrency(minPrice)}</span>
            <span className="text-sm text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {totalAvailable} left
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

function EventCard({ event }: { event: Event }) {
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price))
  const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + (t.quantityTotal - t.quantitySold - t.quantityHeld), 0)

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
      <Link to={`/events/${event.id}`}>
        <div className="relative h-40 overflow-hidden">
          <img 
            src={event.bannerImage || '/placeholder-event.jpg'} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur">
              {event.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDateShort(event.startDate)}
          </p>
          <h3 className="font-bold text-base mb-1 line-clamp-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground mb-3 flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {event.venue.name}, {event.venue.city}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold">{formatCurrency(minPrice)}</span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Ticket className="w-3 h-3 mr-1" />
              {totalAvailable > 0 ? `${totalAvailable} left` : 'Sold out'}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

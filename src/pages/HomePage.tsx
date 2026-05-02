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
const defaultFeedbacks = [
  {
    name: 'Priya Sharma',
    role: 'Event Goer',
    content: 'The booking process was incredibly smooth! I loved how easy it was to find the best concerts in Mumbai and pay securely.',
    rating: 5
  },
  {
    name: 'Rahul Desai',
    role: 'Organizer',
    content: 'As an organizer, the dashboard gave me all the insights I needed to manage ticket sales and track attendance seamlessly.',
    rating: 5
  },
  {
    name: 'Ananya Gupta',
    role: 'Event Goer',
    content: 'Loved the personalized recommendations! Discovered an amazing indie music festival near me that I would have totally missed otherwise.',
    rating: 4
  }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | ''>('')
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [searchResults, setSearchResults] = useState<Event[]>([])
  const [feedbacks, setFeedbacks] = useState(defaultFeedbacks)
  const [newRating, setNewRating] = useState(5)
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newContent.trim()) return
    
    const newFeedback = {
      name: newName,
      role: 'Event Goer',
      content: newContent,
      rating: newRating
    }
    
    setFeedbacks([newFeedback, ...feedbacks])
    setNewName('')
    setNewContent('')
    setNewRating(5)
    setIsSubmittingFeedback(false)
  }

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
          <div className="absolute inset-0 bg-[url('/assets/images/hero_india.png')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-sm bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">
            <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" /> 
            4.8/5 Average Rating from Event Goers
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

      {/* Customer Feedback & Rating System */}
      <section className="py-16 px-4 max-w-6xl mx-auto border-t border-slate-100">
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Don't just take our word for it. Here's what event-goers and organizers have to say about their experience with EventHub.
          </p>
          {!isSubmittingFeedback ? (
            <Button onClick={() => setIsSubmittingFeedback(true)}>
              Leave a Review
            </Button>
          ) : (
            <Card className="w-full max-w-md mx-auto text-left mb-8 shadow-md">
              <form onSubmit={handleFeedbackSubmit}>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Rating</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-6 h-6 cursor-pointer ${star <= newRating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`} 
                          onClick={() => setNewRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Your Name</label>
                    <Input 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      placeholder="John Doe" 
                      required 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Review</label>
                    <Input 
                      value={newContent} 
                      onChange={(e) => setNewContent(e.target.value)} 
                      placeholder="Share your experience..." 
                      required 
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsSubmittingFeedback(false)}>Cancel</Button>
                    <Button type="submit">Submit Review</Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {feedbacks.slice(0, 3).map((feedback, idx) => (
            <Card key={idx} className="bg-slate-50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex gap-1 mb-4 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? 'fill-current' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-6 grow">"{feedback.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                    {feedback.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{feedback.name}</h4>
                    <p className="text-xs text-muted-foreground">{feedback.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Ticket, Filter, ChevronRight, Star, Users, Zap, Quote, MessageSquare } from 'lucide-react'
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
      <section className="relative overflow-hidden bg-slate-950 text-white pt-24 pb-32 px-4">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-500/30 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-rose-500/30 rounded-full blur-[120px] mix-blend-screen" />
        
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[url('/assets/images/hero_india.png')] bg-cover bg-center mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 mr-2 fill-yellow-500 text-yellow-500" /> 
            4.8/5 Average Rating from Event Goers
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Discover Amazing<br />Events Near You
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
            From concerts to conferences, find and book tickets for the best events in your city seamlessly.
          </p>

          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input
                placeholder="Search events, artists, venues..."
                className="pl-12 h-14 bg-transparent border-none text-white placeholder:text-slate-400 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-14 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/25">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <div className="border-b bg-slate-50/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Trusted by top organizers</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['TechCorp', 'Festiva', 'SummitPro', 'LiveNation', 'Eventify'].map((brand, i) => (
              <span key={i} className="text-xl font-bold text-slate-700">{brand}</span>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How EventHub Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Your next great experience is just three simple steps away.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "Discover", desc: "Find the best events happening around you tailored to your interests.", color: "text-blue-500", bg: "bg-blue-50", link: "#categories" },
            { icon: Ticket, title: "Book", desc: "Securely purchase tickets in seconds with our streamlined checkout.", color: "text-violet-500", bg: "bg-violet-50", link: "#events" },
            { icon: Zap, title: "Experience", desc: "Show your digital ticket at the venue and enjoy your unforgettable event.", color: "text-rose-500", bg: "bg-rose-50", link: "/tickets" }
          ].map((step, i) => (
            step.link.startsWith('#') ? (
              <a href={step.link} key={i} className="text-center p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 bg-white block">
                <div className={`w-16 h-16 mx-auto ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 rotate-3 hover:rotate-6 transition-transform`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </a>
            ) : (
              <Link to={step.link} key={i} className="text-center p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 bg-white block">
                <div className={`w-16 h-16 mx-auto ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 rotate-3 hover:rotate-6 transition-transform`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </Link>
            )
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12 px-4 max-w-6xl mx-auto scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 hide-scrollbar">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            className={`whitespace-nowrap rounded-full px-6 transition-all ${selectedCategory === '' ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-100'}`}
          >
            All Events
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className={`whitespace-nowrap rounded-full px-6 transition-all ${selectedCategory === cat.value ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-100'}`}
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
      <section id="events" className="py-8 px-4 max-w-6xl mx-auto pb-20 scroll-mt-20">
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
      <section className="py-24 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <Badge variant="secondary" className="mb-4 text-sm bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-none">
              <MessageSquare className="w-4 h-4 mr-2" /> Real Reviews
            </Badge>
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">What Our Customers Say</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-8 text-lg">
              Don't just take our word for it. Here's what event-goers and organizers have to say about their experience with EventHub.
            </p>
            {!isSubmittingFeedback ? (
              <Button size="lg" className="rounded-full px-8 bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" onClick={() => setIsSubmittingFeedback(true)}>
                <Star className="w-4 h-4 mr-2 fill-yellow-500 text-yellow-500" /> Leave a Review
              </Button>
            ) : (
              <Card className="w-full max-w-md mx-auto text-left mb-8 border-none shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white text-center">
                  <h3 className="text-2xl font-bold">Write a Review</h3>
                  <p className="text-indigo-100 text-sm mt-1">Share your experience with others</p>
                </div>
                <form onSubmit={handleFeedbackSubmit} className="p-6">
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">How was it?</label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${star <= newRating ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' : 'text-slate-200 hover:text-yellow-200'}`} 
                            onClick={() => setNewRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Your Name</label>
                      <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="e.g. John Doe" 
                        required 
                        className="mt-2 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Review</label>
                      <textarea
                        value={newContent} 
                        onChange={(e) => setNewContent(e.target.value)} 
                        placeholder="Tell us what you loved..." 
                        required 
                        className="w-full min-h-[100px] mt-2 p-3 text-sm rounded-md bg-slate-50 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsSubmittingFeedback(false)}>Cancel</Button>
                      <Button type="submit" className="rounded-full bg-indigo-600 hover:bg-indigo-700">Post Review</Button>
                    </div>
                  </div>
                </form>
              </Card>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {feedbacks.slice(0, 3).map((feedback, idx) => (
              <div key={idx} className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Quote className="absolute top-6 right-6 w-12 h-12 text-indigo-500/10 rotate-180" />
                <div className="flex gap-1 mb-6 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 drop-shadow-sm ${i < feedback.rating ? 'fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-600 font-medium leading-relaxed mb-8 grow relative z-10">"{feedback.content}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                    {feedback.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{feedback.name}</h4>
                    <p className="text-sm text-slate-500 font-medium">{feedback.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const getCategoryTheme = (category: string) => {
  const cat = category.toLowerCase();
  if (['music', 'concert', 'festival'].includes(cat)) {
    return {
      shadow: 'shadow-rose-500/10 hover:shadow-rose-500/40',
      textHover: 'group-hover:text-rose-600',
      badgeBg: 'bg-rose-50/90 text-rose-700',
      dateBg: 'bg-rose-50/80 text-rose-600',
    }
  }
  if (['tech', 'workshop', 'hackathon'].includes(cat)) {
    return {
      shadow: 'shadow-cyan-500/10 hover:shadow-cyan-500/40',
      textHover: 'group-hover:text-cyan-600',
      badgeBg: 'bg-cyan-50/90 text-cyan-700',
      dateBg: 'bg-cyan-50/80 text-cyan-600',
    }
  }
  if (['business', 'networking', 'conference'].includes(cat)) {
    return {
      shadow: 'shadow-amber-500/10 hover:shadow-amber-500/40',
      textHover: 'group-hover:text-amber-600',
      badgeBg: 'bg-amber-50/90 text-amber-700',
      dateBg: 'bg-amber-50/80 text-amber-600',
    }
  }
  if (['sports', 'fitness', 'health'].includes(cat)) {
    return {
      shadow: 'shadow-emerald-500/10 hover:shadow-emerald-500/40',
      textHover: 'group-hover:text-emerald-600',
      badgeBg: 'bg-emerald-50/90 text-emerald-700',
      dateBg: 'bg-emerald-50/80 text-emerald-600',
    }
  }
  // Default / other categories (Art, Film, etc.)
  return {
    shadow: 'shadow-indigo-500/10 hover:shadow-indigo-500/40',
    textHover: 'group-hover:text-indigo-600',
    badgeBg: 'bg-indigo-50/90 text-indigo-700',
    dateBg: 'bg-indigo-50/80 text-indigo-600',
  }
}

function FeaturedEventCard({ event }: { event: Event }) {
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price))
  const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + (t.quantityTotal - t.quantitySold - t.quantityHeld), 0)
  const theme = getCategoryTheme(event.category)

  return (
    <Card className={`overflow-hidden group cursor-pointer border-0 shadow-lg ${theme.shadow} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-3xl bg-white h-full flex flex-col`}>
      <Link to={`/events/${event.id}`} className="flex flex-col h-full">
        <div className="relative h-56 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={event.bannerImage || '/placeholder-event.jpg'} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 z-20">
            <Badge variant="secondary" className={`${theme.badgeBg} backdrop-blur shadow-sm font-bold px-3 py-1 text-xs tracking-wider border-none`}>
              {event.category.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-5 z-20">
            <p className="text-white/90 text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDateShort(event.startDate)}
            </p>
          </div>
        </div>
        <CardContent className="p-6 flex flex-col grow">
          <h3 className={`font-extrabold text-xl mb-3 line-clamp-2 ${theme.textHover} transition-colors`}>{event.title}</h3>
          <div className="flex items-center text-sm text-slate-500 mb-6 font-medium mt-auto">
            <MapPin className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue.name}, {event.venue.city}</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Starting at</span>
              <span className="font-extrabold text-xl text-slate-900">{formatCurrency(minPrice)}</span>
            </div>
            <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${totalAvailable > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-600'}`}>
              <Ticket className="w-4 h-4 mr-1.5" />
              {totalAvailable > 0 ? `${totalAvailable} Left` : 'Sold Out'}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

function EventCard({ event }: { event: Event }) {
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price))
  const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + (t.quantityTotal - t.quantitySold - t.quantityHeld), 0)
  const theme = getCategoryTheme(event.category)

  return (
    <Card className={`overflow-hidden group cursor-pointer border border-slate-100 shadow-md ${theme.shadow} hover:-translate-y-1.5 transition-all duration-300 rounded-2xl bg-white flex flex-col h-full`}>
      <Link to={`/events/${event.id}`} className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={event.bannerImage || '/placeholder-event.jpg'} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3 z-20">
            <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider ${theme.badgeBg} backdrop-blur shadow-sm px-2.5 py-0.5 border-none`}>
              {event.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5 flex flex-col grow">
          <p className={`text-xs font-bold mb-3 flex items-center ${theme.dateBg} w-fit px-2.5 py-1 rounded-md`}>
            <Calendar className="w-3 h-3 mr-1.5" />
            {formatDateShort(event.startDate)}
          </p>
          <h3 className={`font-bold text-base mb-3 line-clamp-2 ${theme.textHover} transition-colors leading-tight`}>{event.title}</h3>
          <p className="text-xs text-slate-500 mb-5 flex items-center font-medium mt-auto">
            <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-400" />
            <span className="truncate">{event.venue.name}, {event.venue.city}</span>
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="font-extrabold text-slate-900 text-lg">{formatCurrency(minPrice)}</span>
            <span className={`text-xs font-bold flex items-center ${totalAvailable > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              <Ticket className="w-3.5 h-3.5 mr-1" />
              {totalAvailable > 0 ? `${totalAvailable} left` : 'Sold out'}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

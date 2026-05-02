import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useStore'
import { events } from '@/lib/store'
import { generateId } from '@/lib/utils'
import type { EventCategory, TicketType, Venue } from '@/types'

const CATEGORIES: EventCategory[] = ['concert', 'conference', 'sports', 'theater', 'workshop', 'festival', 'networking', 'other']

export default function CreateEventPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'details' | 'tickets' | 'review'>('details')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<EventCategory>('concert')
  const [tags, setTags] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [venueCity, setVenueCity] = useState('')
  const [venueCapacity, setVenueCapacity] = useState('')
  const [bannerImage, setBannerImage] = useState('')

  const [ticketTypes, setTicketTypes] = useState<Partial<TicketType>[]>([
    { name: 'General Admission', description: 'Standard entry ticket', price: 0, quantityTotal: 100, maxPerOrder: 10 }
  ])

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', description: '', price: 0, quantityTotal: 100, maxPerOrder: 10 }])
  }

  const updateTicketType = (index: number, field: string, value: any) => {
    const updated = [...ticketTypes]
    updated[index] = { ...updated[index], [field]: value }
    setTicketTypes(updated)
  }

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = () => {
    if (!user) return

    const venue: Venue = {
      id: generateId(),
      name: venueName,
      address: venueAddress,
      city: venueCity,
      capacity: parseInt(venueCapacity) || 100,
      seatingLayout: 'general',
    }

    const fullTicketTypes: TicketType[] = ticketTypes.map((tt, i) => ({
      id: `tt-${generateId()}`,
      name: tt.name || 'Unnamed',
      description: tt.description || '',
      price: tt.price || 0,
      currency: 'USD',
      quantityTotal: tt.quantityTotal || 100,
      quantitySold: 0,
      quantityHeld: 0,
      maxPerOrder: tt.maxPerOrder || 10,
      eventId: '',
    }))

    const newEvent = events.create({
      title,
      description,
      bannerImage: bannerImage || '/assets/images/hero_india.png',
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      venue,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'draft',
      organizerId: user.id,
      organizerName: user.name,
      ticketTypes: fullTicketTypes,
    })

    navigate('/organizer')
  }

  const isDetailsValid = title && description && startDate && endDate && venueName && venueCity
  const isTicketsValid = ticketTypes.every(tt => tt.name && tt.price !== undefined && tt.quantityTotal)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/organizer')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground mb-8">Set up your event details and ticket types</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {(['details', 'tickets', 'review'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-2 flex-1 rounded-full ${
                step === s ? 'bg-primary' : 
                (s === 'details' && step !== 'details') || (s === 'tickets' && step === 'review') ? 'bg-primary/60' : 'bg-muted'
              }`} />
              <span className={`text-xs capitalize ${step === s ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Event Title</Label>
                <Input 
                  placeholder="e.g., Summer Music Festival 2026" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input 
                    placeholder="music, outdoor, summer" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </Label>
                  <Input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> End Date
                  </Label>
                  <Input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Venue Details
                </Label>
                <Input placeholder="Venue Name" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                <Input placeholder="Address" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} />
                  <Input placeholder="Capacity" type="number" value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Banner Image URL</Label>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                />
              </div>

              <Button className="w-full" disabled={!isDetailsValid} onClick={() => setStep('tickets')}>
                Next: Ticket Types
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'tickets' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ticket Types</CardTitle>
                <Button variant="outline" size="sm" onClick={addTicketType}>
                  <Plus className="w-4 h-4 mr-2" /> Add Type
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypes.map((tt, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Ticket Type {index + 1}</h4>
                      <Button variant="ghost" size="icon" onClick={() => removeTicketType(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Name (e.g., VIP)" 
                        value={tt.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                      />
                      <Input 
                        placeholder="Price" 
                        type="number"
                        value={tt.price}
                        onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value))}
                      />
                    </div>
                    <Input 
                      placeholder="Description" 
                      value={tt.description}
                      onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Total Quantity" 
                        type="number"
                        value={tt.quantityTotal}
                        onChange={(e) => updateTicketType(index, 'quantityTotal', parseInt(e.target.value))}
                      />
                      <Input 
                        placeholder="Max Per Order" 
                        type="number"
                        value={tt.maxPerOrder}
                        onChange={(e) => updateTicketType(index, 'maxPerOrder', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button className="flex-1" disabled={!isTicketsValid} onClick={() => setStep('review')}>
                Review Event
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <img 
                    src={bannerImage || '/assets/images/hero_india.png'} 
                    alt={title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-muted-foreground">{description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{category}</Badge>
                    {tags.split(',').map((t, i) => t.trim() && <Badge key={i} variant="secondary">{t.trim()}</Badge>)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border rounded-lg p-3">
                    <p className="text-muted-foreground">Start</p>
                    <p className="font-medium">{new Date(startDate).toLocaleString()}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-muted-foreground">End</p>
                    <p className="font-medium">{new Date(endDate).toLocaleString()}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Venue</h4>
                  <p>{venueName}</p>
                  <p className="text-muted-foreground">{venueAddress}, {venueCity}</p>
                  <p className="text-muted-foreground">Capacity: {venueCapacity}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Ticket Types ({ticketTypes.length})</h4>
                  <div className="space-y-2">
                    {ticketTypes.map((tt, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{tt.name}</span>
                        <span className="font-medium">₹{tt.price} × {tt.quantityTotal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('tickets')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Create Event
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

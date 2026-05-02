import type { User, Event, Order, Ticket, CartItem, PromoCode, CheckInRecord, Analytics, UserRole } from '@/types'
import { generateId, generateTicketCode, generateQRData } from '@/lib/utils'

// Demo data
const DEMO_USERS: User[] = [
  { id: 'admin-1', email: 'admin@eventhub.com', name: 'System Admin', role: 'admin', createdAt: '2024-01-01' },
  { id: 'org-1', email: 'organizer@eventhub.com', name: 'Event Organizer', role: 'organizer', createdAt: '2024-01-01' },
  { id: 'org-2', email: 'music@eventhub.com', name: 'Music Events Inc', role: 'organizer', createdAt: '2024-01-01' },
  { id: 'user-1', email: 'attendee@eventhub.com', name: 'John Attendee', role: 'attendee', createdAt: '2024-01-01' },
  { id: 'user-2', email: 'alice@example.com', name: 'Alice Smith', role: 'attendee', createdAt: '2024-02-15' },
  { id: 'user-3', email: 'bob@example.com', name: 'Bob Johnson', role: 'attendee', createdAt: '2024-03-20' },
  { id: 'user-4', email: 'charlie@example.com', name: 'Charlie Davis', role: 'attendee', createdAt: '2024-04-10' },
  { id: 'org-3', email: 'tech@eventhub.com', name: 'Tech Conferences LLC', role: 'organizer', createdAt: '2024-05-05' },
  { id: 'user-5', email: 'diana@example.com', name: 'Diana Prince', role: 'attendee', createdAt: '2024-06-12' },
  { id: 'user-6', email: 'evan@example.com', name: 'Evan Wright', role: 'attendee', createdAt: '2024-07-25' },
  { id: 'admin-2', email: 'superadmin@eventhub.com', name: 'Super Admin', role: 'admin', createdAt: '2024-08-01' },
  { id: 'user-7', email: 'frank@example.com', name: 'Frank Ocean', role: 'attendee', createdAt: '2024-08-10' },
]

const DEMO_VENUES = [
  { id: 'venue-1', name: 'Jio World Convention Centre', address: 'G Block, Bandra Kurla Complex', city: 'Mumbai', capacity: 20000, seatingLayout: 'assigned' as const },
  { id: 'venue-2', name: 'Indira Gandhi Arena', address: 'Indraprastha Estate', city: 'New Delhi', capacity: 14348, seatingLayout: 'assigned' as const },
  { id: 'venue-3', name: 'Bangalore International Exhibition Centre', address: '10th Mile, Tumkur Road', city: 'Bengaluru', capacity: 5000, seatingLayout: 'general' as const },
  { id: 'venue-4', name: 'MMRDA Grounds', address: 'Bandra Kurla Complex', city: 'Mumbai', capacity: 50000, seatingLayout: 'general' as const },
  { id: 'venue-5', name: 'The Canvas Laugh Club', address: 'Lower Parel', city: 'Mumbai', capacity: 200, seatingLayout: 'general' as const },
]

const DEMO_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Sunburn Music Festival 2026',
    description: 'The biggest music festival of the year featuring top artists from around the world. Three days of non-stop music, food, and fun.',
    bannerImage: '/assets/images/festival_india.png',
    startDate: '2026-06-15T14:00:00',
    endDate: '2026-06-17T23:00:00',
    venue: DEMO_VENUES[3],
    category: 'festival',
    tags: ['music', 'outdoor', 'summer', 'festival'],
    status: 'published',
    organizerId: 'org-2',
    organizerName: 'Music Events Inc',
    ticketTypes: [
      { id: 'tt-1-1', name: 'General Admission', description: 'Full festival access', price: 2999, currency: 'INR', quantityTotal: 5000, quantitySold: 3240, quantityHeld: 50, maxPerOrder: 10, eventId: 'event-1' },
      { id: 'tt-1-2', name: 'VIP Pass', description: 'VIP area access + free drinks', price: 7999, currency: 'INR', quantityTotal: 500, quantitySold: 380, quantityHeld: 10, maxPerOrder: 4, eventId: 'event-1' },
      { id: 'tt-1-3', name: 'Early Bird', description: 'Limited early bird pricing', price: 1999, currency: 'INR', quantityTotal: 1000, quantitySold: 1000, quantityHeld: 0, maxPerOrder: 2, eventId: 'event-1' },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-03-01',
  },
  {
    id: 'event-2',
    title: 'India Tech Summit 2026',
    description: 'Annual technology conference bringing together industry leaders, developers, and innovators. Keynotes, workshops, and networking.',
    bannerImage: '/assets/images/conference_india.png',
    startDate: '2026-05-20T09:00:00',
    endDate: '2026-05-22T18:00:00',
    venue: DEMO_VENUES[2],
    category: 'conference',
    tags: ['tech', 'networking', 'business', 'innovation'],
    status: 'published',
    organizerId: 'org-1',
    organizerName: 'Event Organizer',
    ticketTypes: [
      { id: 'tt-2-1', name: 'Standard Pass', description: 'Conference access + lunch', price: 4999, currency: 'INR', quantityTotal: 800, quantitySold: 520, quantityHeld: 15, maxPerOrder: 5, eventId: 'event-2' },
      { id: 'tt-2-2', name: 'Premium Pass', description: 'Workshop access + networking dinner', price: 9999, currency: 'INR', quantityTotal: 200, quantitySold: 145, quantityHeld: 5, maxPerOrder: 3, eventId: 'event-2' },
      { id: 'tt-2-3', name: 'Student Pass', description: 'Valid student ID required', price: 999, currency: 'INR', quantityTotal: 300, quantitySold: 210, quantityHeld: 8, maxPerOrder: 1, eventId: 'event-2' },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'event-3',
    title: 'IPL Finals Watch Party',
    description: 'Watch the IPL Finals on giant screens with thousands of fans. Food trucks, beer garden, and live entertainment.',
    bannerImage: '/assets/images/sports_india.png',
    startDate: '2026-06-08T19:00:00',
    endDate: '2026-06-08T23:00:00',
    venue: DEMO_VENUES[0],
    category: 'sports',
    tags: ['sports', 'cricket', 'watch-party', 'social'],
    status: 'published',
    organizerId: 'org-1',
    organizerName: 'Event Organizer',
    ticketTypes: [
      { id: 'tt-3-1', name: 'General Admission', description: 'Watch party access', price: 499, currency: 'INR', quantityTotal: 3000, quantitySold: 2100, quantityHeld: 30, maxPerOrder: 8, eventId: 'event-3' },
      { id: 'tt-3-2', name: 'VIP Experience', description: 'Premium seating + meet & greet', price: 1999, currency: 'INR', quantityTotal: 200, quantitySold: 150, quantityHeld: 5, maxPerOrder: 2, eventId: 'event-3' },
    ],
    createdAt: '2026-03-15',
    updatedAt: '2026-04-10',
  },
  {
    id: 'event-4',
    title: 'Mughal-e-Azam: The Musical',
    description: 'The spectacular musical based on the classic film. Experience the epic romance.',
    bannerImage: '/assets/images/theater_india.png',
    startDate: '2026-07-10T20:00:00',
    endDate: '2026-07-10T23:00:00',
    venue: DEMO_VENUES[1],
    category: 'theater',
    tags: ['theater', 'musical', 'arts'],
    status: 'published',
    organizerId: 'org-2',
    organizerName: 'Music Events Inc',
    ticketTypes: [
      { id: 'tt-4-1', name: 'Orchestra', description: 'Best seats in the house', price: 5000, currency: 'INR', quantityTotal: 500, quantitySold: 420, quantityHeld: 10, maxPerOrder: 6, eventId: 'event-4' },
      { id: 'tt-4-2', name: 'Mezzanine', description: 'Elevated view', price: 2500, currency: 'INR', quantityTotal: 400, quantitySold: 310, quantityHeld: 8, maxPerOrder: 6, eventId: 'event-4' },
      { id: 'tt-4-3', name: 'Balcony', description: 'Affordable option', price: 1000, currency: 'INR', quantityTotal: 300, quantitySold: 200, quantityHeld: 5, maxPerOrder: 6, eventId: 'event-4' },
    ],
    createdAt: '2026-02-20',
    updatedAt: '2026-03-20',
  },
  {
    id: 'event-5',
    title: 'Stand-Up Comedy Night',
    description: 'An evening of laughter with top Indian comedians. Featuring 5 comedians, open bar, and great vibes.',
    bannerImage: '/assets/images/comedy_india.png',
    startDate: '2026-05-15T20:00:00',
    endDate: '2026-05-15T23:00:00',
    venue: DEMO_VENUES[4],
    category: 'theater',
    tags: ['comedy', 'nightlife', 'entertainment'],
    status: 'published',
    organizerId: 'org-1',
    organizerName: 'Event Organizer',
    ticketTypes: [
      { id: 'tt-5-1', name: 'General Admission', description: 'Show access', price: 499, currency: 'INR', quantityTotal: 180, quantitySold: 120, quantityHeld: 5, maxPerOrder: 6, eventId: 'event-5' },
    ],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-15',
  },
]

const DEMO_PROMO_CODES: PromoCode[] = [
  { id: 'promo-1', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, maxUses: 100, usesCount: 45, validFrom: '2026-01-01', validUntil: '2026-12-31', applicableEvents: ['event-1'], applicableTicketTypes: [] },
  { id: 'promo-2', code: 'TECH50', discountType: 'fixed', discountValue: 50, maxUses: 50, usesCount: 12, validFrom: '2026-01-01', validUntil: '2026-12-31', applicableEvents: ['event-2'], applicableTicketTypes: [] },
  { id: 'promo-3', code: 'EARLYBIRD', discountType: 'percentage', discountValue: 15, maxUses: 200, usesCount: 89, validFrom: '2026-01-01', validUntil: '2026-12-31', applicableEvents: [], applicableTicketTypes: [] },
]

// Storage keys
const STORAGE_KEYS = {
  users: 'eh_users',
  events: 'eh_events',
  orders: 'eh_orders',
  tickets: 'eh_tickets',
  cart: 'eh_cart',
  promoCodes: 'eh_promo_codes',
  checkIns: 'eh_check_ins',
  currentUser: 'eh_current_user',
}

// Initialize storage with demo data
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(DEMO_USERS))
  } else {
    try {
      const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      let usersUpdated = false;
      DEMO_USERS.forEach((demoUser: User) => {
        if (!storedUsers.some((u: User) => u.id === demoUser.id)) {
          storedUsers.push(demoUser);
          usersUpdated = true;
        }
      });
      if (usersUpdated) {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(storedUsers));
      }
    } catch (err) {
      console.error('Failed to parse users for migration', err);
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.events)) {
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(DEMO_EVENTS))
  } else {
    // Fix broken demo images in existing local storage
    try {
      const storedEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.events) || '[]');
      let updated = false;
      
      // Fix broken demo images and update to Indian venues
      storedEvents.forEach((e: Event) => {
        const matchingDemoEvent = DEMO_EVENTS.find(de => de.id === e.id);
        if (matchingDemoEvent) {
          // Update venue, title, description, and currency if it's a demo event
          if (e.venue.city !== matchingDemoEvent.venue.city || e.title !== matchingDemoEvent.title || e.bannerImage !== matchingDemoEvent.bannerImage) {
            e.venue = matchingDemoEvent.venue;
            e.title = matchingDemoEvent.title;
            e.description = matchingDemoEvent.description;
            e.ticketTypes = matchingDemoEvent.ticketTypes;
            e.bannerImage = matchingDemoEvent.bannerImage;
            updated = true;
          }
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(storedEvents));
      }
    } catch (err) {
      console.error('Failed to parse events for migration', err);
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.tickets)) {
    localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.cart)) {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.promoCodes)) {
    localStorage.setItem(STORAGE_KEYS.promoCodes, JSON.stringify(DEMO_PROMO_CODES))
  }
  if (!localStorage.getItem(STORAGE_KEYS.checkIns)) {
    localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify([]))
  }
}

initStorage()

// Generic CRUD helpers
function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

// Auth
export const auth = {
  login: (email: string, password: string): User | null => {
    const users = getItems<User>(STORAGE_KEYS.users)
    const user = users.find(u => u.email === email)
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user))
      return user
    }
    return null
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.currentUser)
    localStorage.removeItem(STORAGE_KEYS.cart)
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.currentUser)
    return data ? JSON.parse(data) : null
  },
  register: (email: string, name: string, role: UserRole = 'attendee'): User => {
    const users = getItems<User>(STORAGE_KEYS.users)
    const newUser: User = {
      id: generateId(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    setItems(STORAGE_KEYS.users, users)
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(newUser))
    return newUser
  },
}

// Events
export const events = {
  getAll: (): Event[] => getItems<Event>(STORAGE_KEYS.events),
  getById: (id: string): Event | undefined => {
    return getItems<Event>(STORAGE_KEYS.events).find(e => e.id === id)
  },
  getByOrganizer: (organizerId: string): Event[] => {
    return getItems<Event>(STORAGE_KEYS.events).filter(e => e.organizerId === organizerId)
  },
  create: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event => {
    const newEvent: Event = {
      ...event,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const items = getItems<Event>(STORAGE_KEYS.events)
    items.push(newEvent)
    setItems(STORAGE_KEYS.events, items)
    return newEvent
  },
  update: (id: string, updates: Partial<Event>): Event | null => {
    const items = getItems<Event>(STORAGE_KEYS.events)
    const index = items.findIndex(e => e.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() }
    setItems(STORAGE_KEYS.events, items)
    return items[index]
  },
  delete: (id: string): boolean => {
    const items = getItems<Event>(STORAGE_KEYS.events)
    const filtered = items.filter(e => e.id !== id)
    if (filtered.length === items.length) return false
    setItems(STORAGE_KEYS.events, filtered)
    return true
  },
  search: (query: string, filters?: { category?: string; city?: string; dateFrom?: string; dateTo?: string; priceMax?: number }): Event[] => {
    let results = getItems<Event>(STORAGE_KEYS.events).filter(e => e.status === 'published')

    if (query) {
      const q = query.toLowerCase()
      results = results.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q)) ||
        e.venue.city.toLowerCase().includes(q)
      )
    }

    if (filters?.category) {
      results = results.filter(e => e.category === filters.category)
    }
    if (filters?.city) {
      results = results.filter(e => e.venue.city.toLowerCase() === filters.city!.toLowerCase())
    }
    if (filters?.dateFrom) {
      results = results.filter(e => new Date(e.startDate) >= new Date(filters.dateFrom!))
    }
    if (filters?.dateTo) {
      results = results.filter(e => new Date(e.startDate) <= new Date(filters.dateTo!))
    }
    if (filters?.priceMax) {
      results = results.filter(e => Math.min(...e.ticketTypes.map(t => t.price)) <= filters.priceMax!)
    }

    return results.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  },
}

// Cart
export const cart = {
  getItems: (): CartItem[] => getItems<CartItem>(STORAGE_KEYS.cart),
  addItem: (item: CartItem) => {
    const items = getItems<CartItem>(STORAGE_KEYS.cart)
    const existing = items.find(i => i.ticketTypeId === item.ticketTypeId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.push(item)
    }
    setItems(STORAGE_KEYS.cart, items)
  },
  removeItem: (ticketTypeId: string) => {
    const items = getItems<CartItem>(STORAGE_KEYS.cart).filter(i => i.ticketTypeId !== ticketTypeId)
    setItems(STORAGE_KEYS.cart, items)
  },
  updateQuantity: (ticketTypeId: string, quantity: number) => {
    const items = getItems<CartItem>(STORAGE_KEYS.cart)
    const item = items.find(i => i.ticketTypeId === ticketTypeId)
    if (item) {
      if (quantity <= 0) {
        return cart.removeItem(ticketTypeId)
      }
      item.quantity = quantity
      setItems(STORAGE_KEYS.cart, items)
    }
  },
  clear: () => setItems(STORAGE_KEYS.cart, []),
}

// Orders
export const orders = {
  getAll: (): Order[] => getItems<Order>(STORAGE_KEYS.orders),
  getById: (id: string): Order | undefined => {
    return getItems<Order>(STORAGE_KEYS.orders).find(o => o.id === id)
  },
  getByUser: (userId: string): Order[] => {
    return getItems<Order>(STORAGE_KEYS.orders).filter(o => o.userId === userId)
  },
  getByEvent: (eventId: string): Order[] => {
    return getItems<Order>(STORAGE_KEYS.orders).filter(o => o.eventId === eventId)
  },
  create: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const items = getItems<Order>(STORAGE_KEYS.orders)
    items.push(newOrder)
    setItems(STORAGE_KEYS.orders, items)
    return newOrder
  },
  updateStatus: (id: string, status: Order['status']): Order | null => {
    const items = getItems<Order>(STORAGE_KEYS.orders)
    const index = items.findIndex(o => o.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], status, updatedAt: new Date().toISOString() }
    setItems(STORAGE_KEYS.orders, items)
    return items[index]
  },
}

// Tickets
export const tickets = {
  getAll: (): Ticket[] => getItems<Ticket>(STORAGE_KEYS.tickets),
  getById: (id: string): Ticket | undefined => {
    return getItems<Ticket>(STORAGE_KEYS.tickets).find(t => t.id === id)
  },
  getByUser: (userId: string): Ticket[] => {
    return getItems<Ticket>(STORAGE_KEYS.tickets).filter(t => t.userId === userId)
  },
  getByEvent: (eventId: string): Ticket[] => {
    return getItems<Ticket>(STORAGE_KEYS.tickets).filter(t => t.eventId === eventId)
  },
  getByOrder: (orderId: string): Ticket[] => {
    return getItems<Ticket>(STORAGE_KEYS.tickets).filter(t => t.orderId === orderId)
  },
  create: (ticket: Omit<Ticket, 'id' | 'qrCode' | 'ticketCode' | 'createdAt'>): Ticket => {
    const ticketCode = generateTicketCode()
    const newTicket: Ticket = {
      ...ticket,
      id: generateId(),
      ticketCode,
      qrCode: generateQRData(generateId(), ticket.eventId, ticket.userId),
      createdAt: new Date().toISOString(),
    }
    const items = getItems<Ticket>(STORAGE_KEYS.tickets)
    items.push(newTicket)
    setItems(STORAGE_KEYS.tickets, items)
    return newTicket
  },
  updateStatus: (id: string, status: Ticket['status']): Ticket | null => {
    const items = getItems<Ticket>(STORAGE_KEYS.tickets)
    const index = items.findIndex(t => t.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], status }
    setItems(STORAGE_KEYS.tickets, items)
    return items[index]
  },
  checkIn: (id: string, checkedInBy: string): Ticket | null => {
    const items = getItems<Ticket>(STORAGE_KEYS.tickets)
    const index = items.findIndex(t => t.id === id)
    if (index === -1) return null
    if (items[index].status !== 'valid') return null
    items[index] = { 
      ...items[index], 
      status: 'used', 
      checkedInAt: new Date().toISOString(),
      checkedInBy,
    }
    setItems(STORAGE_KEYS.tickets, items)

    // Record check-in
    const checkIns = getItems<CheckInRecord>(STORAGE_KEYS.checkIns)
    checkIns.push({
      ticketId: id,
      eventId: items[index].eventId,
      checkedInAt: new Date().toISOString(),
      checkedInBy,
      method: 'qr_scan',
    })
    setItems(STORAGE_KEYS.checkIns, checkIns)

    return items[index]
  },
}

// Promo Codes
export const promoCodes = {
  getAll: (): PromoCode[] => getItems<PromoCode>(STORAGE_KEYS.promoCodes),
  getByCode: (code: string): PromoCode | undefined => {
    return getItems<PromoCode>(STORAGE_KEYS.promoCodes).find(p => p.code.toUpperCase() === code.toUpperCase())
  },
  validate: (code: string, eventId?: string, ticketTypeId?: string): { valid: boolean; discount?: number; message?: string } => {
    const promo = getItems<PromoCode>(STORAGE_KEYS.promoCodes).find(p => p.code.toUpperCase() === code.toUpperCase())
    if (!promo) return { valid: false, message: 'Invalid promo code' }
    if (promo.usesCount >= promo.maxUses) return { valid: false, message: 'Promo code limit reached' }
    if (new Date() < new Date(promo.validFrom)) return { valid: false, message: 'Promo code not yet active' }
    if (new Date() > new Date(promo.validUntil)) return { valid: false, message: 'Promo code expired' }
    if (eventId && promo.applicableEvents.length > 0 && !promo.applicableEvents.includes(eventId)) {
      return { valid: false, message: 'Promo code not valid for this event' }
    }
    if (ticketTypeId && promo.applicableTicketTypes.length > 0 && !promo.applicableTicketTypes.includes(ticketTypeId)) {
      return { valid: false, message: 'Promo code not valid for this ticket type' }
    }
    return { valid: true, discount: promo.discountValue }
  },
  use: (code: string): boolean => {
    const items = getItems<PromoCode>(STORAGE_KEYS.promoCodes)
    const index = items.findIndex(p => p.code.toUpperCase() === code.toUpperCase())
    if (index === -1 || items[index].usesCount >= items[index].maxUses) return false
    items[index] = { ...items[index], usesCount: items[index].usesCount + 1 }
    setItems(STORAGE_KEYS.promoCodes, items)
    return true
  },
}

// Analytics
export const analytics = {
  getEventAnalytics: (eventId: string): Analytics => {
    const eventTickets = getItems<Ticket>(STORAGE_KEYS.tickets).filter(t => t.eventId === eventId)
    const eventOrders = getItems<Order>(STORAGE_KEYS.orders).filter(o => o.eventId === eventId)
    const checkIns = getItems<CheckInRecord>(STORAGE_KEYS.checkIns).filter(c => c.eventId === eventId)

    const totalTickets = eventTickets.length
    const ticketsSold = eventTickets.filter(t => t.status !== 'void').length
    const revenue = eventOrders.reduce((sum, o) => o.status === 'confirmed' ? sum + o.totalAmount : sum, 0)

    // Generate daily sales data
    const dailySales: { date: string; sales: number; revenue: number }[] = []
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })

    last30Days.forEach(date => {
      const dayOrders = eventOrders.filter(o => o.createdAt.startsWith(date) && o.status === 'confirmed')
      const dayTickets = dayOrders.reduce((sum, o) => sum + o.items.reduce((is, item) => is + item.quantity, 0), 0)
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      dailySales.push({ date, sales: dayTickets, revenue: dayRevenue })
    })

    return {
      eventId,
      totalTickets,
      ticketsSold,
      revenue,
      checkIns: checkIns.length,
      conversionRate: totalTickets > 0 ? (checkIns.length / totalTickets) * 100 : 0,
      dailySales,
    }
  },
}


// Add users export to store
export const users = {
  getAll: (): User[] => getItems<User>(STORAGE_KEYS.users),
  getById: (id: string): User | undefined => {
    return getItems<User>(STORAGE_KEYS.users).find(u => u.id === id)
  },
  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    const items = getItems<User>(STORAGE_KEYS.users)
    items.push(newUser)
    setItems(STORAGE_KEYS.users, items)
    return newUser
  },
  updateRole: (id: string, role: UserRole): User | null => {
    const items = getItems<User>(STORAGE_KEYS.users)
    const index = items.findIndex(u => u.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], role }
    setItems(STORAGE_KEYS.users, items)
    return items[index]
  },
}


// Reset all data (for testing)
export const resetData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  initStorage()
}

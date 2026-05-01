export type UserRole = 'admin' | 'organizer' | 'attendee'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type EventCategory = 'concert' | 'conference' | 'sports' | 'theater' | 'workshop' | 'festival' | 'networking' | 'other'

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  capacity: number
  seatingLayout?: 'general' | 'assigned'
}

export interface TicketType {
  id: string
  name: string
  description: string
  price: number
  currency: string
  quantityTotal: number
  quantitySold: number
  quantityHeld: number
  maxPerOrder: number
  saleStart?: string
  saleEnd?: string
  eventId: string
}

export interface Event {
  id: string
  title: string
  description: string
  bannerImage?: string
  startDate: string
  endDate: string
  venue: Venue
  category: EventCategory
  tags: string[]
  status: EventStatus
  organizerId: string
  organizerName: string
  ticketTypes: TicketType[]
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'pending' | 'hold' | 'confirmed' | 'refunded' | 'cancelled'

export interface OrderItem {
  ticketTypeId: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  userId: string
  eventId: string
  eventTitle: string
  items: OrderItem[]
  totalAmount: number
  currency: string
  status: OrderStatus
  promoCode?: string
  discountAmount: number
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  orderId: string
  eventId: string
  eventTitle: string
  ticketTypeId: string
  ticketTypeName: string
  userId: string
  userName: string
  userEmail: string
  price: number
  currency: string
  status: 'valid' | 'used' | 'refunded' | 'transferred' | 'void'
  qrCode: string
  ticketCode: string
  seatNumber?: string
  checkedInAt?: string
  checkedInBy?: string
  createdAt: string
}

export interface CartItem {
  ticketTypeId: string
  eventId: string
  quantity: number
}

export interface PromoCode {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number
  usesCount: number
  validFrom: string
  validUntil: string
  applicableEvents: string[]
  applicableTicketTypes: string[]
}

export interface CheckInRecord {
  ticketId: string
  eventId: string
  checkedInAt: string
  checkedInBy: string
  method: 'qr_scan' | 'manual' | 'bulk'
}

export interface Analytics {
  eventId: string
  totalTickets: number
  ticketsSold: number
  revenue: number
  checkIns: number
  conversionRate: number
  dailySales: { date: string; sales: number; revenue: number }[]
}

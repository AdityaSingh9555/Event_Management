import { useState, useEffect, useCallback } from 'react'
import type { User, Event, Order, Ticket, CartItem, UserRole } from '@/types'
import { auth, events, orders, tickets, cart } from '@/lib/store'

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.getCurrentUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback((email: string, password: string) => {
    setLoading(true)
    const result = auth.login(email, password)
    setUser(result)
    setLoading(false)
    return result
  }, [])

  const logout = useCallback(() => {
    auth.logout()
    setUser(null)
  }, [])

  const register = useCallback((email: string, name: string, role?: UserRole) => {
    setLoading(true)
    const result = auth.register(email, name, role)
    setUser(result)
    setLoading(false)
    return result
  }, [])

  return { user, loading, login, logout, register, isAuthenticated: !!user }
}

export function useEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setAllEvents(events.getAll())
  }, [])

  const refresh = useCallback(() => {
    setAllEvents(events.getAll())
  }, [])

  const searchEvents = useCallback((query: string, filters?: Parameters<typeof events.search>[1]) => {
    return events.search(query, filters)
  }, [])

  const getEvent = useCallback((id: string) => {
    return events.getById(id)
  }, [])

  const createEvent = useCallback((event: Parameters<typeof events.create>[0]) => {
    const result = events.create(event)
    refresh()
    return result
  }, [refresh])

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    const result = events.update(id, updates)
    refresh()
    return result
  }, [refresh])

  const deleteEvent = useCallback((id: string) => {
    const result = events.delete(id)
    refresh()
    return result
  }, [refresh])

  return { events: allEvents, loading, refresh, searchEvents, getEvent, createEvent, updateEvent, deleteEvent }
}

export function useOrders(userId?: string) {
  const [allOrders, setAllOrders] = useState<Order[]>([])

  useEffect(() => {
    if (userId) {
      setAllOrders(orders.getByUser(userId))
    } else {
      setAllOrders(orders.getAll())
    }
  }, [userId])

  const refresh = useCallback(() => {
    if (userId) {
      setAllOrders(orders.getByUser(userId))
    } else {
      setAllOrders(orders.getAll())
    }
  }, [userId])

  return { orders: allOrders, refresh }
}

export function useTickets(userId?: string) {
  const [allTickets, setAllTickets] = useState<Ticket[]>([])

  useEffect(() => {
    if (userId) {
      setAllTickets(tickets.getByUser(userId))
    } else {
      setAllTickets(tickets.getAll())
    }
  }, [userId])

  const refresh = useCallback(() => {
    if (userId) {
      setAllTickets(tickets.getByUser(userId))
    } else {
      setAllTickets(tickets.getAll())
    }
  }, [userId])

  return { tickets: allTickets, refresh }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(cart.getItems())

  const refresh = useCallback(() => {
    setItems(cart.getItems())
  }, [])

  const addItem = useCallback((item: CartItem) => {
    cart.addItem(item)
    refresh()
  }, [refresh])

  const removeItem = useCallback((ticketTypeId: string) => {
    cart.removeItem(ticketTypeId)
    refresh()
  }, [refresh])

  const updateQuantity = useCallback((ticketTypeId: string, quantity: number) => {
    cart.updateQuantity(ticketTypeId, quantity)
    refresh()
  }, [refresh])

  const clearCart = useCallback(() => {
    cart.clear()
    refresh()
  }, [refresh])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return { items, totalItems, addItem, removeItem, updateQuantity, clearCart, refresh }
}

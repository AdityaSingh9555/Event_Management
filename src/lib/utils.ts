import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generateQRData(ticketId: string, eventId: string, userId: string): string {
  return btoa(JSON.stringify({
    t: ticketId,
    e: eventId,
    u: userId,
    ts: Date.now(),
    v: '1'
  }))
}

export function getCategoryTheme(category: string) {
  const cat = category.toLowerCase();
  if (['music', 'concert', 'festival'].includes(cat)) {
    return {
      shadow: 'shadow-rose-500/10 hover:shadow-rose-500/40',
      textHover: 'group-hover:text-rose-600',
      badgeBg: 'bg-rose-50/90 text-rose-700',
      dateBg: 'bg-rose-50/80 text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 hover:shadow-rose-500/40',
      borderHover: 'hover:border-rose-300',
    }
  }
  if (['tech', 'workshop', 'hackathon'].includes(cat)) {
    return {
      shadow: 'shadow-cyan-500/10 hover:shadow-cyan-500/40',
      textHover: 'group-hover:text-cyan-600',
      badgeBg: 'bg-cyan-50/90 text-cyan-700',
      dateBg: 'bg-cyan-50/80 text-cyan-600',
      button: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20 hover:shadow-cyan-500/40',
      borderHover: 'hover:border-cyan-300',
    }
  }
  if (['business', 'networking', 'conference'].includes(cat)) {
    return {
      shadow: 'shadow-amber-500/10 hover:shadow-amber-500/40',
      textHover: 'group-hover:text-amber-600',
      badgeBg: 'bg-amber-50/90 text-amber-700',
      dateBg: 'bg-amber-50/80 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 hover:shadow-amber-500/40',
      borderHover: 'hover:border-amber-300',
    }
  }
  if (['sports', 'fitness', 'health'].includes(cat)) {
    return {
      shadow: 'shadow-emerald-500/10 hover:shadow-emerald-500/40',
      textHover: 'group-hover:text-emerald-600',
      badgeBg: 'bg-emerald-50/90 text-emerald-700',
      dateBg: 'bg-emerald-50/80 text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40',
      borderHover: 'hover:border-emerald-300',
    }
  }
  // Default / other categories (Art, Film, etc.)
  return {
    shadow: 'shadow-indigo-500/10 hover:shadow-indigo-500/40',
    textHover: 'group-hover:text-indigo-600',
    badgeBg: 'bg-indigo-50/90 text-indigo-700',
    dateBg: 'bg-indigo-50/80 text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 hover:shadow-indigo-500/40',
    borderHover: 'hover:border-indigo-300',
  }
}

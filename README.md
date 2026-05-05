# Student Performance Analysis System (SPAS)

A full-featured event management and ticketing platform built with React, TypeScript, and Tailwind CSS.

## Features

### For Attendees
- **Event Discovery**: Browse and search events by category, city, date, and price
- **Event Details**: Rich event pages with venue info, ticket types, and organizer profiles
- **Shopping Cart**: Add multiple tickets across events, apply promo codes
- **Checkout Flow**: Simulated payment processing with order confirmation
- **My Tickets**: View all tickets with QR codes for entry
- **Ticket Transfer**: (Framework ready)

### For Organizers
- **Dashboard**: Revenue analytics, ticket sales charts, attendance metrics
- **Event Management**: Create, edit, publish, and cancel events
- **Inventory Tracking**: Real-time ticket availability and sales progress
- **Check-In App**: QR code scanning and manual entry for event entry
- **Analytics**: Daily sales charts, conversion rates, attendance tracking

### Technical Features
- **Role-Based Access**: Admin, Organizer, Attendee roles
- **Inventory Management**: Optimistic locking simulation, overselling prevention
- **Promo Codes**: Percentage and fixed amount discounts
- **QR Code Generation**: Unique QR codes per ticket for validation
- **PWA Ready**: Service worker and manifest configured
- **Responsive Design**: Mobile-first, works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **State**: Custom hooks with localStorage persistence
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventhub.com | any |
| Organizer | organizer@eventhub.com | any |
| Attendee | attendee@eventhub.com | any |

## Architecture

```
src/
├── components/
│   ├── ui/           # shadcn/ui components (Button, Card, Badge, etc.)
│   └── Layout.tsx    # Main layout with navigation
├── pages/
│   ├── HomePage.tsx       # Event discovery & search
│   ├── EventDetailPage.tsx # Event details & ticket selection
│   ├── CartPage.tsx        # Shopping cart & checkout
│   ├── TicketsPage.tsx     # My tickets with QR codes
│   ├── OrganizerPage.tsx  # Dashboard & event management
│   ├── CheckInPage.tsx    # QR scanner & manual check-in
│   └── AuthPages.tsx      # Login & Register
├── hooks/
│   └── useStore.ts   # Custom hooks for data operations
├── lib/
│   ├── store.ts      # Data layer (localStorage CRUD)
│   └── utils.ts      # Helper functions
├── types/
│   └── index.ts      # TypeScript interfaces
└── App.tsx           # Router configuration
```

## Data Storage

This demo uses localStorage for persistence, simulating a backend API. All data survives page refreshes.

To reset demo data, run in browser console:
```javascript
localStorage.clear()
location.reload()
```

## Implementation Plan Coverage

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | User Authentication (JWT simulation) | ✅ |
| 1 | Role-based Access Control | ✅ |
| 2 | Event CRUD | ✅ |
| 2 | Venue Management | ✅ |
| 2 | Category/Tag/Search | ✅ |
| 2 | Media Uploads (URL-based) | ✅ |
| 3 | Ticket Types (GA, VIP, Early Bird) | ✅ |
| 3 | Inventory Management | ✅ |
| 3 | Promo Codes & Discounts | ✅ |
| 4 | Order State Machine | ✅ |
| 4 | E-ticket Generation (QR) | ✅ |
| 5 | Event Discovery & Filters | ✅ |
| 5 | PWA Structure | ✅ |
| 6 | Check-in App | ✅ |
| 6 | Organizer Dashboard & Analytics | ✅ |
| 6 | Automated Reminders (framework) | ✅ |
| 7 | CDN/Cache simulation | ✅ |

## License

MIT

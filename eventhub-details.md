# EventHub - Ticketing System
## Comprehensive Overview

EventHub is a modern, full-stack event management and ticketing platform designed to bridge the gap between event organizers and attendees. It provides an intuitive, highly responsive, and localized experience for the Indian market, facilitating everything from discovering local events to managing complex ticket sales and event analytics.

---

### Core Features

1. **User Roles and Authentication**
   - **Attendees**: Can browse events, purchase tickets, apply promo codes, and manage their orders.
   - **Organizers**: Can create events, manage ticket types, track sales, and view real-time analytics.
   - **Administrators**: Complete system oversight.

2. **Event Discovery and Booking**
   - **Smart Search & Filtering**: Users can filter events by category (e.g., Concerts, Conferences, Sports, Theater, Festivals), date, and city.
   - **Localized Venues**: Integrated with major Indian venues like Jio World Convention Centre, Indira Gandhi Arena, and MMRDA Grounds.
   - **Multiple Ticket Types**: Support for General Admission, VIP, Early Bird, etc., each with individual capacities and pricing limits.

3. **Cart and Checkout System**
   - **Dynamic Cart**: Real-time cart calculations with promo code validation.
   - **Currency Localization**: Native support for Indian Rupee (₹), providing a familiar shopping experience.
   - **Ticket Generation**: Automated generation of unique ticket codes and secure QR codes upon purchase completion.

4. **Organizer Dashboard**
   - **Event Management**: Create new events, upload custom banner images, and set venue capacities.
   - **Real-Time Analytics**: Visual charts tracking daily revenue, tickets sold, and check-in conversion rates using Recharts.
   - **Check-In System**: Secure QR code scanning capability to validate tickets at the door and prevent fraud.

5. **Progressive Web App (PWA) Capabilities**
   - Installable as a standalone app on desktop and mobile.
   - Custom app icons and manifest configuration.

---

### Key Advantages

1. **Tailored for the Indian Market**
   - Prices and venues are tailored to the Indian demographic, saving users the mental overhead of currency conversion and improving conversion rates.
   - Includes visually appealing, localized default imagery representing real Indian scenes and festivals.

2. **Frictionless User Experience**
   - Built with React, Vite, and TailwindCSS to provide a lightning-fast, single-page application experience.
   - The UI is responsive, working flawlessly on desktop, tablet, and mobile interfaces.

3. **Robust Security & Validation**
   - Promo codes feature strict constraints (validity dates, maximum uses, event-specific rules).
   - Ticket QR codes include encrypted payload data mapping to the user and event ID to prevent duplication.

4. **Scalable Architecture**
   - Designed with clear data separation (Users, Events, Orders, Tickets, Promo Codes).
   - Easily extensible to a full backend (Node.js/PostgreSQL) due to the abstracted `store.ts` data layer.

---

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & shadcn/ui components
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charting**: Recharts
- **Storage/Data**: Modular local storage simulation (ready for backend integration)

---

**EventHub** transforms the chaotic process of event ticketing into a streamlined, beautiful, and localized digital experience.

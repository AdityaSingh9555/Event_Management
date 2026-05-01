import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import EventDetailPage from '@/pages/EventDetailPage'
import CartPage from '@/pages/CartPage'
import TicketsPage from '@/pages/TicketsPage'
import OrganizerPage from '@/pages/OrganizerPage'
import CheckInPage from '@/pages/CheckInPage'
import { LoginPage, RegisterPage } from '@/pages/AuthPages'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/organizer" element={<OrganizerPage />} />
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

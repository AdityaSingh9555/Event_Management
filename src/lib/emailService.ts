import emailjs from '@emailjs/browser'

// ─── EmailJS Configuration ────────────────────────────────────────────────────
// Ye values aapko EmailJS dashboard se milegi (setup guide dekho)
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'YOUR_PUBLIC_KEY'

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY)

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TicketEmailData {
  userName: string
  userEmail: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  ticketTypeName: string
  quantity: number
  totalAmount: string
  orderId: string
  ticketCode: string
  promoCode?: string
  discountAmount?: string
}

// ─── Send Ticket Confirmation Email ──────────────────────────────────────────
export async function sendTicketConfirmationEmail(data: TicketEmailData): Promise<boolean> {
  try {
    // Check if credentials are configured
    if (
      EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
      EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
      EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
    ) {
      console.warn('⚠️ EmailJS credentials not configured. Please set up .env file.')
      return false
    }

    const templateParams = {
      to_name:        data.userName,
      to_email:       data.userEmail,
      event_title:    data.eventTitle,
      event_date:     data.eventDate,
      event_venue:    data.eventVenue,
      ticket_type:    data.ticketTypeName,
      quantity:       data.quantity.toString(),
      total_amount:   data.totalAmount,
      order_id:       data.orderId,
      ticket_code:    data.ticketCode,
      promo_code:     data.promoCode || 'None',
      discount:       data.discountAmount || '₹0',
      support_email:  'support@eventhub.in',
      app_name:       'EventHub',
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )

    if (response.status === 200) {
      console.log('✅ Confirmation email sent to', data.userEmail)
      return true
    }

    return false
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return false
  }
}

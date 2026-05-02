import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Ticket, QrCode, Download, Share2, AlertTriangle, CheckCircle, Clock, MapPin, Calendar, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRCodeCanvas } from 'qrcode.react'
import { useTickets, useAuth } from '@/hooks/useStore'
import { tickets as ticketsApi, events } from '@/lib/store'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Ticket as TicketType } from '@/types'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function TicketsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { tickets: userTickets, refresh } = useTickets(user?.id)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [showSuccess, setShowSuccess] = useState(location.state?.success || false)
  const [isDownloading, setIsDownloading] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !selectedTicket) return
    
    try {
      setIsDownloading(true)
      
      // html2canvas bug workaround: temporarily swap the QR canvas for an image
      const qrCanvas = ticketRef.current.querySelector('canvas')
      let imgTemp: HTMLImageElement | null = null
      
      if (qrCanvas) {
        imgTemp = document.createElement('img')
        imgTemp.src = qrCanvas.toDataURL('image/png')
        imgTemp.style.width = '200px'
        imgTemp.style.height = '200px'
        
        qrCanvas.style.display = 'none'
        qrCanvas.parentNode?.insertBefore(imgTemp, qrCanvas)
      }

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      // Restore the canvas
      if (qrCanvas && imgTemp) {
        qrCanvas.style.display = ''
        imgTemp.remove()
      }

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`Ticket-${selectedTicket.ticketCode}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleAddToCalendar = () => {
    if (!selectedTicket) return
    const event = events.getById(selectedTicket.eventId)
    if (!event) return

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    // Format to YYYYMMDDTHHMMSSZ
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nTicket: ${selectedTicket.ticketTypeName}\\nCode: ${selectedTicket.ticketCode}
LOCATION:${event.venue.name}, ${event.venue.city}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `event-${event.id}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  useEffect(() => {
    refresh()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to view tickets</h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    )
  }

  const activeTickets = userTickets.filter(t => t.status === 'valid')
  const pastTickets = userTickets.filter(t => t.status === 'used' || t.status === 'refunded')

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800">Order confirmed!</p>
              <p className="text-sm text-emerald-700">Your tickets have been generated and are ready to use.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <Badge variant="secondary">{userTickets.length} total</Badge>
        </div>

        {userTickets.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No tickets yet</h2>
            <p className="text-muted-foreground mb-6">Browse events and book your first ticket</p>
            <Button onClick={() => navigate('/')}>Browse Events</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tickets */}
            {activeTickets.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Upcoming Events ({activeTickets.length})
                </h2>
                <div className="grid gap-4">
                  {activeTickets.map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onViewQR={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Tickets */}
            {pastTickets.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center text-muted-foreground">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Past Events ({pastTickets.length})
                </h2>
                <div className="grid gap-4 opacity-60">
                  {pastTickets.map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onViewQR={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-background rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            {/* The area to capture */}
            <div ref={ticketRef} className="bg-background p-6 rounded-xl border mb-6">
              <h3 className="text-xl font-bold mb-2">{selectedTicket.eventTitle}</h3>
              <p className="text-muted-foreground mb-6">{selectedTicket.ticketTypeName}</p>

              <div className="bg-white p-4 rounded-xl inline-block mb-4 border shadow-sm">
                <QRCodeCanvas 
                  value={selectedTicket.qrCode} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-sm font-mono text-muted-foreground mt-2">{selectedTicket.ticketCode}</p>
              <p className="text-xs text-muted-foreground mt-4 pb-2 border-b">Valid for 1 Entry</p>
              <h1 className="text-xl font-extrabold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">EventHub</h1>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleDownloadPDF} disabled={isDownloading}>
                <Download className="w-4 h-4 mr-2" /> 
                {isDownloading ? 'Saving...' : 'Save PDF Ticket'}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleAddToCalendar}>
                  <CalendarPlus className="w-4 h-4 mr-2" /> Add to Calendar
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket, onViewQR }: { ticket: TicketType; onViewQR: () => void }) {
  const event = events.getById(ticket.eventId)
  const isUsed = ticket.status === 'used'
  const isRefunded = ticket.status === 'refunded'

  return (
    <Card className={`overflow-hidden ${isUsed || isRefunded ? 'grayscale' : ''}`}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Ticket Visual */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{ticket.eventTitle}</h3>
                <p className="text-sm text-muted-foreground">{ticket.ticketTypeName}</p>
              </div>
              <Badge variant={isUsed ? 'secondary' : isRefunded ? 'destructive' : 'success'}>
                {isUsed ? 'Used' : isRefunded ? 'Refunded' : 'Valid'}
              </Badge>
            </div>

            {event && (
              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(event.startDate)}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.venue.name}, {event.venue.city}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-muted-foreground">{ticket.ticketCode}</span>
              <span className="font-bold">{formatCurrency(ticket.price)}</span>
            </div>
          </div>

          {/* QR Section */}
          <div className="w-32 border-l border-dashed flex flex-col items-center justify-center p-4 bg-muted/50">
            {!isUsed && !isRefunded ? (
              <>
                <div className="w-16 h-16 bg-white rounded-lg p-1 mb-2 cursor-pointer hover:shadow-md transition-shadow" onClick={onViewQR}>
                  <QRCodeCanvas value={ticket.qrCode} size={56} level="L" />
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={onViewQR}>
                  <QrCode className="w-3 h-3 mr-1" /> View
                </Button>
              </>
            ) : (
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">{isUsed ? 'Checked In' : 'Refunded'}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

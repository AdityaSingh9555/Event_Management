import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Download, Share2, Printer, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { tickets } from '@/lib/store'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Ticket } from '@/types'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    if (id) {
      const found = tickets.getById(id)
      if (found) setTicket(found)
    }
  }, [id])

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Ticket not found</h2>
          <Button className="mt-4" onClick={() => navigate('/tickets')}>Back to Tickets</Button>
        </div>
      </div>
    )
  }

  const isValid = ticket.status === 'valid'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-6">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Digital Ticket Card */}
        <Card className="overflow-hidden border-2 border-primary/20">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎫</span>
                </div>
                <span className="font-bold text-lg">EventHub</span>
              </div>
              {isValid ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                </Badge>
              ) : (
                <Badge variant="secondary">{ticket.status}</Badge>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-1">{ticket.eventTitle}</h2>
            <p className="text-white/60 text-sm mb-4">{ticket.ticketTypeName}</p>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Date</p>
                <p className="font-medium">{formatDate(ticket.createdAt).split(',')[0]}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Time</p>
                <p className="font-medium">{formatDate(ticket.createdAt).split(',')[1]}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Ticket Code</p>
                <p className="font-mono text-xs">{ticket.ticketCode}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Price</p>
                <p className="font-medium">{formatCurrency(ticket.price)}</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-8 bg-white">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <QRCodeSVG 
                  value={ticket.qrCode} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '',
                    height: 0,
                    width: 0,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mb-1">
                Present this QR code at the venue entrance
              </p>
              <p className="text-xs text-muted-foreground">
                Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <Separator className="my-6" />

            {/* Ticket Pattern */}
            <div className="ticket-pattern h-4 -mx-8 mb-6" />

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="flex-col h-auto py-3">
                <Download className="w-4 h-4 mb-1" />
                <span className="text-xs">Save</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3">
                <Share2 className="w-4 h-4 mb-1" />
                <span className="text-xs">Share</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3">
                <Printer className="w-4 h-4 mb-1" />
                <span className="text-xs">Print</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Important Information</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-primary" />
                Please arrive at least 30 minutes before the event starts
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-primary" />
                This ticket is non-transferable and linked to your account
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
                Screenshot of this QR code will not be accepted for entry
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

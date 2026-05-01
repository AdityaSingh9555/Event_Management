import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Camera, CheckCircle, XCircle, ArrowLeft, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { tickets as ticketsApi, events } from '@/lib/store'
import { useAuth } from '@/hooks/useStore'
import type { Ticket } from '@/types'

export default function CheckInPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; ticket?: Ticket } | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [recentCheckIns, setRecentCheckIns] = useState<Ticket[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (user && user.role !== 'organizer' && user.role !== 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    // Load recent check-ins
    const allTickets = ticketsApi.getAll().filter(t => t.checkedInAt).slice(-10)
    setRecentCheckIns(allTickets)
  }, [scanResult])

  const handleScan = (qrData: string) => {
    try {
      const decoded = JSON.parse(atob(qrData))
      const ticket = ticketsApi.getById(decoded.t)

      if (!ticket) {
        setScanResult({ success: false, message: 'Invalid ticket QR code' })
        return
      }

      if (ticket.status === 'used') {
        setScanResult({ success: false, message: 'Ticket already checked in', ticket })
        return
      }

      if (ticket.status !== 'valid') {
        setScanResult({ success: false, message: `Ticket is ${ticket.status}`, ticket })
        return
      }

      const result = ticketsApi.checkIn(ticket.id, user!.id)
      if (result) {
        setScanResult({ success: true, message: 'Check-in successful!', ticket: result })
      } else {
        setScanResult({ success: false, message: 'Check-in failed' })
      }
    } catch {
      setScanResult({ success: false, message: 'Invalid QR code format' })
    }
  }

  const handleManualCheckIn = () => {
    if (!manualCode.trim()) return

    const allTickets = ticketsApi.getAll()
    const ticket = allTickets.find(t => 
      t.ticketCode.toLowerCase() === manualCode.toLowerCase() || 
      t.id === manualCode
    )

    if (!ticket) {
      setScanResult({ success: false, message: 'Ticket not found' })
      return
    }

    if (ticket.status === 'used') {
      setScanResult({ success: false, message: 'Ticket already checked in', ticket })
      return
    }

    if (ticket.status !== 'valid') {
      setScanResult({ success: false, message: `Ticket is ${ticket.status}`, ticket })
      return
    }

    const result = ticketsApi.checkIn(ticket.id, user!.id)
    if (result) {
      setScanResult({ success: true, message: 'Check-in successful!', ticket: result })
      setManualCode('')
    }
  }

  const startCamera = async () => {
    setScanning(true)
    setScanResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setScanning(false)
      setScanResult({ success: false, message: 'Camera access denied or not available' })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  // Simulated QR scanning for demo (since we can't use actual QR scanner library in this setup)
  const simulateScan = () => {
    // Find a valid ticket to simulate scanning
    const validTickets = ticketsApi.getAll().filter(t => t.status === 'valid')
    if (validTickets.length > 0) {
      const randomTicket = validTickets[Math.floor(Math.random() * validTickets.length)]
      handleScan(randomTicket.qrCode)
    } else {
      setScanResult({ success: false, message: 'No valid tickets available for demo scan' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" className="text-white" onClick={() => navigate('/organizer')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <h1 className="text-lg font-bold">Check-In</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Scanner Area */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Scan Ticket QR Code</h2>
              <p className="text-muted-foreground text-sm">Position the QR code within the frame</p>
            </div>

            {/* Camera / Simulated View */}
            <div className="relative aspect-square max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden mb-4">
              {scanning ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-white/30 rounded-xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary -mt-1 -ml-1" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary -mt-1 -mr-1" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary -mb-1 -ml-1" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary -mb-1 -mr-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Button variant="secondary" size="sm" onClick={stopCamera}>
                      <XCircle className="w-4 h-4 mr-2" /> Stop Scanning
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                  <Camera className="w-12 h-12 mb-3" />
                  <p className="text-sm">Camera preview</p>
                </div>
              )}

              {/* Simulated scan line animation */}
              {scanning && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary qr-scan-line" />
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={scanning ? stopCamera : startCamera} variant={scanning ? 'destructive' : 'default'}>
                {scanning ? <XCircle className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                {scanning ? 'Stop Camera' : 'Start Camera'}
              </Button>
              <Button variant="outline" onClick={simulateScan}>
                <Zap className="w-4 h-4 mr-2" /> Demo Scan
              </Button>
            </div>

            {/* Manual Entry */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-3">Manual Entry</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ticket code"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleManualCheckIn()}
                />
                <Button onClick={handleManualCheckIn}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Check In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className={`mb-6 ${scanResult.success ? 'border-emerald-500' : 'border-red-500'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {scanResult.success ? (
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <h3 className={`font-bold ${scanResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                    {scanResult.success ? 'Success' : 'Failed'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                </div>
              </div>

              {scanResult.ticket && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{scanResult.ticket.eventTitle}</p>
                      <p className="text-sm text-muted-foreground">{scanResult.ticket.ticketTypeName}</p>
                    </div>
                    <Badge variant={scanResult.ticket.status === 'used' ? 'success' : 'secondary'}>
                      {scanResult.ticket.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground">{scanResult.ticket.ticketCode}</p>
                  {scanResult.ticket.checkedInAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Checked in at {new Date(scanResult.ticket.checkedInAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => setScanResult(null)}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Scan Another
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Check-ins */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Recent Check-ins</h3>
            {recentCheckIns.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No check-ins yet</p>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{ticket.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">{ticket.ticketTypeName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" className="text-xs">Checked In</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

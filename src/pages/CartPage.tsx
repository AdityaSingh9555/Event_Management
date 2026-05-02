import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Tag, AlertTriangle, CreditCard, Loader2, CheckCircle2, QrCode } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useStore'
import { events, promoCodes, orders, tickets, auth, cart as cartStore } from '@/lib/store'
import { formatCurrency, generateId } from '@/lib/utils'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, totalItems, removeItem, updateQuantity, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'idle' | 'qr' | 'processing' | 'verifying' | 'success'>('idle')
  const currentUser = auth.getCurrentUser()

  const cartItems = items.map(item => {
    const event = events.getById(item.eventId)
    const ticketType = event?.ticketTypes.find(t => t.id === item.ticketTypeId)
    return { ...item, event, ticketType }
  }).filter(item => item.event && item.ticketType)

  const subtotal = cartItems.reduce((sum, item) => sum + (item.ticketType!.price * item.quantity), 0)

  const discount = appliedPromo 
    ? appliedPromo.type === 'percentage' 
      ? subtotal * (appliedPromo.discount / 100)
      : Math.min(appliedPromo.discount, subtotal)
    : 0

  const total = subtotal - discount

  const handleApplyPromo = () => {
    setPromoError('')
    const result = promoCodes.validate(promoCode)
    if (!result.valid) {
      setPromoError(result.message || 'Invalid promo code')
      return
    }
    const promo = promoCodes.getByCode(promoCode)
    if (promo) {
      setAppliedPromo({ code: promo.code, discount: promo.discountValue, type: promo.discountType })
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
  }

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    setIsCheckingOut(true)
    setPaymentStep('qr')
  }

  const handlePaymentComplete = async () => {
    if (!currentUser) return;
    
    setPaymentStep('verifying')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    setPaymentStep('success')
    
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Group by event
    const eventGroups: Record<string, typeof cartItems> = {}
    cartItems.forEach(item => {
      if (!eventGroups[item.eventId]) eventGroups[item.eventId] = []
      eventGroups[item.eventId].push(item)
    })

    // Create orders and tickets
    Object.entries(eventGroups).forEach(([eventId, groupItems]) => {
      const event = events.getById(eventId)
      if (!event) return

      const orderItems = groupItems.map(item => ({
        ticketTypeId: item.ticketTypeId,
        ticketTypeName: item.ticketType!.name,
        quantity: item.quantity,
        unitPrice: item.ticketType!.price,
        totalPrice: item.ticketType!.price * item.quantity,
      }))

      const orderTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)

      const order = orders.create({
        userId: currentUser.id,
        eventId,
        eventTitle: event.title,
        items: orderItems,
        totalAmount: orderTotal,
        currency: 'USD',
        status: 'confirmed',
        promoCode: appliedPromo?.code,
        discountAmount: discount,
      })

      // Create tickets
      orderItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          tickets.create({
            orderId: order.id,
            eventId,
            eventTitle: event.title,
            ticketTypeId: item.ticketTypeId,
            ticketTypeName: item.ticketTypeName,
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            price: item.unitPrice,
            currency: 'USD',
            status: 'valid',
          })
        }
      })

      // Update inventory
      groupItems.forEach(item => {
        const eventData = events.getById(eventId)
        if (eventData) {
          const ticketTypeIndex = eventData.ticketTypes.findIndex(t => t.id === item.ticketTypeId)
          if (ticketTypeIndex !== -1) {
            eventData.ticketTypes[ticketTypeIndex].quantitySold += item.quantity
            events.update(eventId, { ticketTypes: eventData.ticketTypes })
          }
        }
      })
    })

    // Use promo code
    if (appliedPromo) {
      promoCodes.use(appliedPromo.code)
    }

    // Clear cart
    clearCart()
    setIsCheckingOut(false)
    setPaymentStep('idle')

    navigate('/tickets', { state: { success: true, emailType: 'order_confirmation' } })
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Browse events and add tickets to get started</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
        </Button>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({totalItems})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <Card key={`${item.eventId}-${item.ticketTypeId}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={item.event?.bannerImage || '/placeholder-event.jpg'}
                      alt={item.event?.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{item.event?.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.ticketType?.name}</p>
                      <p className="text-sm font-medium mt-1">{formatCurrency(item.ticketType!.price)} each</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.ticketTypeId)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.ticketType!.price)}
                    </span>
                    <span className="font-bold">{formatCurrency(item.ticketType!.price * item.quantity)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={clearCart} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                {/* Promo Code */}
                {!appliedPromo ? (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="uppercase"
                      />
                      <Button variant="outline" onClick={handleApplyPromo}>
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-destructive mt-1">{promoError}</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div>
                      <Badge variant="success" className="mb-1">{appliedPromo.code}</Badge>
                      <p className="text-xs text-emerald-700">
                        {appliedPromo.type === 'percentage' ? `${appliedPromo.discount}% off` : `${formatCurrency(appliedPromo.discount)} off`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemovePromo}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="text-muted-foreground">Included</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCheckout}
                  loading={isCheckingOut}
                  disabled={isCheckingOut}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isCheckingOut ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure payment processing. No card details stored.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-8 text-center flex flex-col items-center">
              {paymentStep === 'qr' && (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <QrCode className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Scan to Pay</h3>
                  <p className="text-muted-foreground mb-6">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                  
                  <div className="bg-white p-4 rounded-xl border-2 border-primary/20 shadow-inner mb-6">
                    <QRCodeCanvas 
                      value={`upi://pay?pa=aditya2006march-6@okicici&pn=EventHub&am=${total}&cu=INR`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="flex items-center justify-between w-full mb-6 px-4">
                    <span className="text-sm text-muted-foreground">Amount to pay:</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={handlePaymentComplete}>
                    I have completed the payment
                  </Button>
                  <Button variant="ghost" className="w-full mt-2" onClick={() => { setIsCheckingOut(false); setPaymentStep('idle'); }}>
                    Cancel
                  </Button>
                </>
              )}
              {paymentStep === 'processing' && (
                <>
                  <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                  <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                  <p className="text-muted-foreground">Connecting to secure gateway...</p>
                </>
              )}
              {paymentStep === 'verifying' && (
                <>
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                  <h3 className="text-xl font-bold mb-2">Verifying Transaction</h3>
                  <p className="text-muted-foreground">Confirming details with bank...</p>
                </>
              )}
              {paymentStep === 'success' && (
                <>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6 animate-in bounce-in" />
                  <h3 className="text-xl font-bold mb-2 text-emerald-600">Payment Successful!</h3>
                  <p className="text-muted-foreground">Generating your tickets...</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

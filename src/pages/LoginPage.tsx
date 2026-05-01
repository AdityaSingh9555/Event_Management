import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useStore'

const DEMO_ACCOUNTS = [
  { email: 'admin@eventhub.com', role: 'Admin', desc: 'Full system access' },
  { email: 'organizer@eventhub.com', role: 'Organizer', desc: 'Event management' },
  { email: 'attendee@eventhub.com', role: 'Attendee', desc: 'Browse & buy tickets' },
  { email: 'music@eventhub.com', role: 'Organizer', desc: 'Music events organizer' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const user = login(email, password || 'password')
      if (user) {
        navigate(redirect)
      } else {
        setError('Invalid email or password')
      }
      setLoading(false)
    }, 500)
  }

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password')
    setTimeout(() => {
      const user = login(demoEmail, 'password')
      if (user) navigate(redirect)
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to access your tickets and events</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" loading={loading}>
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider">Quick Login (Demo)</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map(account => (
                  <button
                    key={account.email}
                    onClick={() => quickLogin(account.email)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{account.email}</p>
                      <p className="text-xs text-muted-foreground">{account.desc}</p>
                    </div>
                    <Badge variant="secondary">{account.role}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up <ArrowRight className="w-3 h-3 inline" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

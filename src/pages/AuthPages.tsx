import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as any)?.from || '/'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const user = login(email, password)
      if (user) {
        navigate(from, { replace: true })
      } else {
        setError('Invalid email or password')
        setLoading(false)
      }
    }, 500)
  }

  const quickLogin = (role: string) => {
    const emails: Record<string, string> = {
      admin: 'admin@eventhub.com',
      organizer: 'organizer@eventhub.com',
      attendee: 'attendee@eventhub.com',
    }
    setEmail(emails[role] || '')
    setPassword('password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
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
                    onChange={e => setEmail(e.target.value)}
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
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
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
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick login as:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => quickLogin('admin')}>
                  Admin
                </Button>
                <Button variant="outline" size="sm" onClick={() => quickLogin('organizer')}>
                  Organizer
                </Button>
                <Button variant="outline" size="sm" onClick={() => quickLogin('attendee')}>
                  Attendee
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Any password works for demo accounts
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      try {
        const user = register(email, name, role)
        if (user) {
          navigate('/')
        }
      } catch {
        setError('Registration failed. Please try again.')
        setLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Join EventHub to discover amazing events</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input 
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setRole('attendee')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      role === 'attendee' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    Attendee
                    <p className="text-xs font-normal text-muted-foreground mt-1">Buy tickets to events</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      role === 'organizer' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    Organizer
                    <p className="text-xs font-normal text-muted-foreground mt-1">Create and manage events</p>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                <UserPlus className="w-4 h-4 mr-2" /> Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

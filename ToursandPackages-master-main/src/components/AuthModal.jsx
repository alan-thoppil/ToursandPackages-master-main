import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  
  // UI states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setError('')
    setSuccess('')
  }

  const handleTabChange = (signUpMode) => {
    setIsSignUp(signUpMode)
    resetForm()
  }

  const handleSignIn = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)

    // Simulate network delay
    setTimeout(() => {
      // Find user in localStorage
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]')
      const user = users.find(u => u.email === email && u.password === password)

      if (user) {
        setSuccess('Logged in successfully!')
        localStorage.setItem('currentUser', JSON.stringify(user))
        setTimeout(() => {
          onLoginSuccess(user)
          onClose()
          resetForm()
        }, 1000)
      } else {
        setError('Invalid email or password. Feel free to Create an Account if you haven\'t yet!')
      }
      setIsLoading(false)
    }, 1200)
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]')
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        setError('An account with this email already exists.')
        setIsLoading(false)
        return
      }

      const newUser = { name, email, phone, password }
      users.push(newUser)
      localStorage.setItem('registered_users', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      
      setSuccess('Account created successfully!')
      
      setTimeout(() => {
        onLoginSuccess(newUser)
        onClose()
        resetForm()
      }, 1000)
      setIsLoading(false)
    }, 1200)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose()
            resetForm()
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
        >
          {/* Close button */}
          <button
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Logo / Header */}
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">terrain</span>
            </div>
            <h2 className="mt-4 text-2xl font-black font-serif italic text-slate-900 dark:text-white">
              tours<span className="text-primary">&</span>packages
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isSignUp ? 'Create your adventure account' : 'Sign in to access premium planning'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            <button
              onClick={() => handleTabChange(false)}
              className={`flex-1 rounded-lg py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                !isSignUp
                  ? 'bg-white text-slate-900 shadow-md dark:bg-slate-850 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`flex-1 rounded-lg py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                isSignUp
                  ? 'bg-white text-slate-900 shadow-md dark:bg-slate-850 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400"
            >
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 p-3.5 text-xs font-medium text-green-600 dark:bg-green-950/30 dark:text-green-400"
            >
              <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
              <span>{success}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  person
                </span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-850"
                  required
                />
              </div>
            )}

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                mail
              </span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-850"
                required
              />
            </div>

            {isSignUp && (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  call
                </span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-850"
                  required
                />
              </div>
            )}

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white py-3.5 pl-12 pr-12 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-850"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 dark:hover:text-slate-350"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setError('Password reset link has been simulated to your inbox!')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-black tracking-widest uppercase text-white transition-all hover:bg-slate-800 disabled:opacity-55 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/10"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-950 dark:border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => handleTabChange(false)}
                  className="font-bold text-primary hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account yet?{' '}
                <button
                  onClick={() => handleTabChange(true)}
                  className="font-bold text-primary hover:underline"
                >
                  Create one now
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AuthModal

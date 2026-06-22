import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'

const Layout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.95)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setUser(null)
    setIsProfileDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  const isDarkNav = scrolled || !isHomePage

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 selection:bg-primary/20">
      <header className={`fixed left-0 right-0 z-50 w-full border-y transition-all duration-300 backdrop-blur-xl ${isDarkNav ? 'top-0 border-slate-200 bg-white/80 shadow-md' : 'top-4 border-white/20 bg-white/10 shadow-2xl'}`}>
        <div className="mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`transition-colors duration-300 ${isDarkNav ? 'text-slate-900 drop-shadow-none' : 'text-white drop-shadow-lg'}`}>
                <span className="material-symbols-outlined text-3xl">terrain</span>
              </div>
              <h1 className={`text-lg font-black tracking-tight font-serif lowercase italic transition-colors duration-300 ${isDarkNav ? 'text-slate-900 drop-shadow-none' : 'text-white drop-shadow-md'}`}>tours<span className="text-primary mx-1">&</span>packages</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/listing" className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isDarkNav ? 'text-slate-700 hover:text-primary drop-shadow-none' : 'text-white hover:text-white/80 drop-shadow-md'}`}>Tours</Link>
              <a className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isDarkNav ? 'text-slate-700 hover:text-primary drop-shadow-none' : 'text-white hover:text-white/80 drop-shadow-md'}`} href="#">About</a>
              <a className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isDarkNav ? 'text-slate-700 hover:text-primary drop-shadow-none' : 'text-white hover:text-white/80 drop-shadow-md'}`} href="#">Contact</a>
              
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none group"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary uppercase shadow-md transition-all group-hover:scale-105">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className={`hidden lg:inline text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDarkNav ? 'text-slate-700' : 'text-white'}`}>
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-900 mb-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{user.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{user.email}</p>
                      </div>
                      <button className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">explore</span> My Bookings
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">settings</span> Settings
                      </button>
                      <hr className="my-1 border-slate-100 dark:border-slate-900" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">logout</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-xs font-black tracking-widest transition-all shadow-lg hover:scale-105"
                >
                  SIGN IN
                </button>
              )}
            </nav>
            <div 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden transition-colors duration-300 cursor-pointer ${isDarkNav ? 'text-slate-900 drop-shadow-none' : 'text-white drop-shadow-lg'}`}
            >
              <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-14 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-6 md:hidden flex flex-col gap-4 shadow-2xl"
          >
            <Link 
              to="/listing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-350 hover:text-primary transition-colors py-2"
            >
              Tours
            </Link>
            <a 
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-350 hover:text-primary transition-colors py-2"
            >
              About
            </a>
            <a 
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-350 hover:text-primary transition-colors py-2"
            >
              Contact
            </a>
            <hr className="border-slate-100 dark:border-slate-900" />
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-center py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs tracking-widest uppercase transition-all shadow-md mt-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsAuthModalOpen(true)
                }}
                className="w-full text-center py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:bg-slate-800"
              >
                SIGN IN
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      <main className={`flex-grow ${!isHomePage ? 'pt-24' : ''}`}>
        {children}
      </main>

      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">terrain</span>
              <h1 className="text-xl font-bold tracking-tight">Tours and Packages</h1>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Curating world-class travel experiences for over 15 years. Join us in exploring the hidden wonders of the globe.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">camera</span>
              </a>
            </div>
          </div>
          <div>
            <h6 className="font-bold mb-6 text-slate-200">Quick Links</h6>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/listing" className="hover:text-white transition-colors">Destinations</Link></li>
              <li><a className="hover:text-white transition-colors" href="#">Special Offers</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Travel Guides</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Affiliate Program</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-6 text-slate-200">Support</h6>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a className="hover:text-white transition-colors" href="#">Help Center</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Booking Policy</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-6 text-slate-200">Newsletter</h6>
            <p className="text-slate-400 text-sm mb-4">Get travel tips and exclusive discounts directly to your inbox.</p>
            <div className="flex flex-col gap-2">
              <input className="bg-slate-800 border-none rounded-lg focus:ring-primary text-white text-sm py-3 px-4" placeholder="Your email address" type="email"/>
              <button className="bg-primary hover:bg-secondary text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-primary/20">Subscribe Now</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">© 2024 Tours and Packages. All rights reserved.</p>
          <div className="flex gap-8">
            <img className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSQ5q-9ovsVxN6OAh22KQ4uCvhrhBSozoiieuQroN7m9oz6qM3I-ZwbXFSz1ZqcrG02IaT_HcEfqUCZ1PxUl3SkQt-qThptoKANt2irCQoVvX15K0DljbKRiD6viPofmW-uck5exBZwAzwiM76XybHim3Yr-XOA9V_gSEbeOgl2joqJwNUkhK__wKohbcEYyt2n6slH2t-6G7AmqNoWb2yM2Cqt0zbHonnprePzo4vc4abIt4eQontMpoFln0IjIcmaglRLP20M70" alt="Visa" />
            <img className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtSLTt-FoWvC7e_TBJnr5mnqGAZ3ukOxXVBpy5WSIfiAk0CmLWsJm2ObNRWyOBlZJQIjHrCmjYpbblExqDtpUse_PqT7MWfDDrMhcUITN1DJlHwGq9--6dwV5wsuVijK_HlnAn68-wN54DDm-pv-fBRRfP5TK4PCZcm87VKPdrL2WOi-EfHqrMugHst8GTN04cL3ul9TJAO6Kq9qLSikOx-o6dmcnNzq1mGqfW4SwIRrJHLRnP8cUlhOiVUZICpykf_rv9JZGU3_s" alt="Mastercard" />
            <img className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp2xseeU_W5X_wpyLyxWnzVs2EMautePBnHwBN72w6vVHkhfdxLtdOpkyXJNqQkDrdy4ErYP5SSGxFEfX5_pQidZZkc4ENlQVGQm8NB5F0OL61rjzLAXaXBrL4uGq-f24y3DQpj8jvMG7hZZWH02Xn5El3XNhv1iRKJFotCQN4d5t6O07ZHZyVZqb7_d8W4a1vBBbc97CMqDTvhTsN3Oul21FE9uMZpdoTd_hL6ietUwZe89P-NZyjqQSvRX2nc0CTEN5DZmdlQ5U" alt="Paypal" />
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />
    </div>
  )
}

export default Layout

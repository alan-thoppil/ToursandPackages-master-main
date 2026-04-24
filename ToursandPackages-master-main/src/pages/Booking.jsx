import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Booking = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-4 py-20"
    >
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <div className="mb-12">
            <Link to="/details" className="text-sm font-bold text-primary flex items-center gap-2 mb-6 group">
              <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back to Package
            </Link>
            <h1 className="text-4xl font-black mb-4 font-serif italic text-dark lowercase tracking-tight">Complete Your Booking</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-1 pt-1">Finalize your extraordinary adventure.</p>
          </div>

          <motion.form 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="space-y-12" 
            onSubmit={(e) => e.preventDefault()}
          >
            {[
              {
                step: "1",
                title: "Personal Information",
                fields: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Doe" type="text" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="john@example.com" type="email" />
                    </div>
                  </div>
                )
              },
              {
                step: "2",
                title: "Travel Details",
                fields: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Travelers</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                        <option>1 Traveler</option>
                        <option selected>2 Travelers</option>
                        <option>3+ Travelers</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Package Tier</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                        <option>Standard</option>
                        <option>Premium</option>
                        <option>Luxury</option>
                      </select>
                    </div>
                  </div>
                )
              },
              {
                step: "3",
                title: "Payment",
                fields: (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/50 mt-2">
                    <div className="flex items-center gap-6 mb-8">
                       <span className="text-primary font-black text-xs border-b-2 border-primary pb-1">CARD</span>
                       <span className="text-slate-400 font-bold text-xs hover:text-primary transition-colors cursor-pointer">PAYPAL</span>
                       <span className="text-slate-400 font-bold text-xs hover:text-primary transition-colors cursor-pointer">CRYPTO</span>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Number</label>
                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="**** **** **** 4242" type="text" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="MM/YY" type="text" />
                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="CVC" type="password" />
                      </div>
                    </div>
                  </div>
                )
              }
            ].map((section, idx) => (
              <motion.section 
                key={idx}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                }}
                className="space-y-4"
              >
                <h3 className="text-xl font-black flex items-center gap-4 font-serif italic lowercase text-primary">
                  <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20 NOT-ITALIC">
                    {section.step}
                  </span>
                  {section.title}
                </h3>
                {section.fields}
              </motion.section>
            ))}

            <motion.button 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay: 0.6 } }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-primary text-white font-black py-6 rounded-3xl transition-all shadow-2xl shadow-primary/30 text-xl tracking-widest mt-10"
            >
              CONFIRM BOOKING — ₹2,598
            </motion.button>
          </motion.form>
        </div>

        <div className="w-full md:w-80">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-2xl sticky top-32"
          >
            <h4 className="text-xl font-black mb-8 border-b border-slate-100 dark:border-slate-800 pb-4 font-serif italic lowercase text-dark">Booking Summary</h4>
            <div className="space-y-6 mb-10">
              {[
                { label: "Package", val: "Ancient Wonders..." },
                { label: "Guests", val: "2 Adults" },
                { label: "Duration", val: "8 Days" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{item.val}</span>
                </div>
              ))}
              <div className="pt-6 mt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Subtotal</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">₹2,598</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tax & Fees</span>
                  <span className="font-black text-primary">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t-2 border-slate-900 dark:border-slate-100">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Total</span>
                  <span className="text-3xl font-black text-primary">₹2,598</span>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Secure Checkout. Your data protected by AES-256 encryption.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Booking

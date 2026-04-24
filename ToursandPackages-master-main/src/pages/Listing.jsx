import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const listingPackages = [
  {
    id: 1,
    title: "Parisian Nights & French Riviera",
    duration: "7 Days, 6 Nights",
    price: "₹1,299",
    rating: 4.9,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5ikP7H7R29AR7SzxZYuankjpzZahn5pvm1jpDrTluTHweWoCkBoTddjD1R7Q1VbuXlIU-LEO6WnbPehOmBfGo2m9i-72iRmlT9zxuGoUod1Upi0w5byrM4_aEiWFSRuQC5A2pFFwWTTckOx07DzFneJrWTmI41h-3cJjWGSKBlsDnxPjqpRHEolIPf1HC18kT4GdwMsxTtvd8Jh_bZwwQjtb2ogU4pYpZjJ9kOZKLA3yVZFQtOowrcqFtCGH6eQMyI8qdA9fpJ8w"
  },
  {
    id: 2,
    title: "Imperial Japan Discovery",
    duration: "10 Days, 9 Nights",
    price: "₹2,450",
    rating: 4.8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgjOMr4vhOSly9nDsGl5ZzjPhrYWb5J_TdxnvOeyuzLrdUdAiK8U7a_yZPmdA0jnBYKcqPATiUw3EYrSEsPWAL4pRJoQCuCAes1BwlK_OUrNR2Jz5BOUY2Pn3UtIZw3b4-WEjtckEU3-vJODZYSaRDR02kzViMkePePzZ2eaZPyv3zi1dd2LnsVXgLRCz23hV6653dU4L8LoV0_V1UVc5zORopeYdYP3IRlttHU91O-ZsGB8VPamtV6xImKlViu8PP3lsGDTlJrGQ"
  },
  {
    id: 3,
    title: "Santorini & Mykonos Getaway",
    duration: "5 Days, 4 Nights",
    price: "₹1,899",
    rating: 5.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcj1zN8hcRZX3Ckjdwphvc9WaQdd-qtq-yFhfDeyJeTNTyKm73dm8-7omlih25RPuJGyCkwReU4mwGjydHFcytvnBeqCA37MlQXmSETPedM1eNJ9R-3E0uaN2ktriFAON3pYvF11MDN69TyFdGu5tDfiiVTAYkn95QveJ56050S8zlMPtP7rHFvbtvhJVEyd2mcStkXpNwVlEJohQBko8zx8ZCKP0PNn4SfA7OJdhW0ZvjYX2F_XsrBDASn5ANuqFfgwI8VHk7pgo"
  },
  {
    id: 4,
    title: "Moroccan Desert Expedition",
    duration: "8 Days, 7 Nights",
    price: "₹950",
    rating: 4.7,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZSfGAZc50vk7_mWwyqDJYFmEI9v4xW9elwnT1oBE1-1yVn2DtohY73Zj7ZFZJGsRO0SPiSfjG_3Rthz360Td7U8Q-8Q59q6yMyF9awtsgoORMdoJvyEyeBxNtlyrP3V0Ey4cyT6uq5b090bUvEwgcRhPXcc5r8yRIVKIwzPXrYPed2KFE7pvqnrHIomNj16WGZzHldUFlgK0u903lmeE2dS3UOXFkpxaKRQGY7jceFWsDKHE120r8T-JloBEKuQoV1KvFpTyJ3xQ"
  },
  {
    id: 5,
    title: "Mediterranean Luxury Cruise",
    duration: "14 Days, 13 Nights",
    price: "₹3,200",
    rating: 4.9,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5WmLJIX63M82DfkjvC1msUXDhgAfQ1bSRgSdAZU-JZ6i4H2V_evXr7YYhqPonGRwQUZoU9v2yz8tndfPRdYT_UNk5d13tI3uO4rkONtf8weD8TX9iB4OO-zxUdW9Kd1akOOtVI_xvl2zFvemD2mcf1siknoqayrdQ3Y0xYcJxujSEeGIJurJXLkLWxcoLUAdGcHDljw217xzMbieu_5-fGRgrmOvYfi0Ze9BqBRbM-DNTe_f1qPSouxzk3GlAMjx32l6kQXYZl0E"
  },
  {
    id: 6,
    title: "Classic European Capitals",
    duration: "12 Days, 11 Nights",
    price: "₹2,100",
    rating: 4.6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxSSS8ylXbk1kB5RQXYTFkGd6AEq0qJAgOLmg7dN3bsmgX5WfaPOjUt7jvtTPGgr4ojbOgSL_tfTzCqw0VTtOHlPNHzSCvYRrIL3TThY8FuJ4hHbibrWqHBQn6gg7TWrW_Ib1mRYdewf3dq3V7FhBBWgENd7gx9BrEqDoAwnfmCHC_0xufIykMoTjYtf3P1Yc18gUg5c2DhBMv7mKMzs0fyp276-Njk7e0RUneUq_1dFz2I_tPOEvKT5HVdYND1gE7KbmzikrEzw0"
  }
]

const Listing = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col lg:flex-row px-6 lg:px-20 py-8 gap-8"
    >
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-80 flex flex-col gap-8"
      >
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 font-serif italic lowercase text-primary">
            <span className="material-symbols-outlined text-primary text-2xl">filter_list</span>
            filters
          </h3>
          <div className="space-y-10">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Destinations</h4>
              <div className="space-y-3">
                {['Europe', 'Asia', 'North America', 'South America'].map((dest, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary bg-transparent transition-all" type="checkbox" defaultChecked={dest === 'Europe'} />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{dest}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Duration</h4>
              <div className="flex flex-wrap gap-2">
                {['3-5 Days', '1 Week', '2 Weeks+'].map((range, i) => (
                  <button key={i} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${i === 0 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10'}`}>
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Price Range</h4>
              <div className="px-1">
                <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                  <div className="absolute left-0 right-1/4 h-full bg-primary rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-lg cursor-pointer hover:scale-120 transition-transform"></div>
                  <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-lg cursor-pointer hover:scale-120 transition-transform"></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  <span>₹500</span>
                  <span>₹5000</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full mt-10 flex items-center justify-center rounded-2xl h-14 bg-primary text-white text-sm font-black tracking-widest hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
            APPLY FILTERS
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black font-serif italic text-dark lowercase tracking-tight">142 packages found</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Refined by your preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium">Sort by:</span>
            <select className="text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary px-3 py-2 pr-10 min-w-[140px] border">
              <option>Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {listingPackages.map((pkg) => (
            <motion.div 
              key={pkg.id} 
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -10 }}
              className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" src={pkg.image} alt={pkg.title} />
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-primary flex items-center gap-1.5 shadow-lg">
                  <span className="material-symbols-outlined text-sm fill-1 text-yellow-500">star</span> {pkg.rating}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors mb-4 font-serif italic lowercase">{pkg.title}</h3>
                <div className="flex items-center gap-3 text-slate-500 text-sm mb-6">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="font-bold">{pkg.duration}</span>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">From</p>
                    <p className="text-2xl font-black text-primary tracking-tight">{pkg.price}</p>
                  </div>
                  <Link to="/details" className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center justify-center py-10">
          <nav className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-primary transition-colors">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-primary transition-colors">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-primary transition-colors">12</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>
    </motion.div>
  )
}

export default Listing

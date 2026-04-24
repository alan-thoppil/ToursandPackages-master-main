import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import TravelWidget from '../components/TravelWidget'
import { useRef } from 'react'

const Home = () => {
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvJyVEjiWsCjGyQCJoJOKZ5tLzaPDpFYPLCB7Vv-0Zm6pH84GI-PrpwnAjhQLox3yG8MK_LwqPKzkq2_gMRMpsTeRQaRBn_QEosONchZTiD3-MKQR-otLe2_rhjF4GS8PyruZOog_y9sDV7kRc57zOyme_Y-VL5YlOnbVjMVdaXtjKHLVMPVhEm8NVmV7SDIZczpUG5Ppbk5wefQndrfl87GyRvAd3BOBY-MY6fDcU003Dd412hTANhSObZgXg2pso3-FhRokK6r0')",
            backgroundAttachment: "fixed"
          }}
        ></motion.div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pb-24">
          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] font-serif"
          >
            Your Day, <br />
            <span className="text-secondary italic font-serif">Perfectly Mapped.</span>
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto font-medium"
          >
            Arriving somewhere new? Let your perfect day unfold — from must-see spots to hidden gems, crafted into a journey you'll truly enjoy.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <button
              onClick={() => document.getElementById('itinerary-planner').scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden bg-primary text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <span className="material-symbols-outlined fill-1 text-xl">explore</span>
              <span className="relative z-10 tracking-wide">Start Exploring</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </motion.div>
        </div>
      </section>

      <div id="itinerary-planner" className="bg-slate-50 dark:bg-slate-900 relative z-20">

        {/* Floating Search Bar (The "Table") */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto px-4 relative z-30 mt-8 pb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end border border-slate-100 dark:border-slate-700">

            {/* DESTINATION */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-3">Destination</label>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 py-3 px-4 rounded-xl shadow-sm focus-within:border-orange-200 transition-colors">
                <span className="material-symbols-outlined text-slate-400">location_on</span>
                <input type="text" placeholder="Where to?" className="bg-transparent border-none outline-none w-full text-slate-700 dark:text-slate-300 placeholder-slate-400 font-medium" />
              </div>
            </div>

            {/* DATE */}
            <div className="flex-1 w-full">
              <label htmlFor="trip-date" className="block text-sm font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-3 cursor-pointer">Date</label>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 py-3 px-4 rounded-xl shadow-sm focus-within:border-orange-200 transition-colors relative">
                <span
                  className="material-symbols-outlined text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                  onClick={() => { const el = document.getElementById('trip-date'); if (el && el.showPicker) el.showPicker(); }}
                  title="Open Calendar"
                >
                  calendar_today
                </span>
                <input id="trip-date" type="date" className="bg-transparent border-none outline-none w-full text-slate-700 dark:text-slate-400 font-medium cursor-text uppercase" />
              </div>
            </div>

            {/* PRICE RANGE */}
            <div className="flex-1 w-full relative">
              <label className="block text-sm font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-3">Price Range</label>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 py-3 px-4 rounded-xl shadow-sm focus-within:border-orange-200 transition-colors relative">
                <span className="material-symbols-outlined text-slate-400">payments</span>
                <select className="bg-transparent border-none outline-none w-full text-slate-700 dark:text-slate-400 font-medium cursor-pointer appearance-none pr-8">
                  <option value="">All Prices</option>
                  <option value="budget">Under ₹1,000</option>
                  <option value="mid">₹1,000 - ₹3,000</option>
                  <option value="premium">₹3,000 - ₹5,000</option>
                  <option value="luxury">₹5,000+</option>
                </select>
                <span className="material-symbols-outlined text-slate-400 absolute right-4 pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* SEARCH BUTTON */}
            <div className="w-full md:w-auto">
              <button onClick={() => window.location.href = '#/suggestions?category=Stay'} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-10 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-orange-500/30 hover:-translate-y-1 active:translate-y-0">
                <span className="material-symbols-outlined text-[20px] font-bold">search</span> SEARCH
              </button>
            </div>

          </div>
        </motion.div>

        <section className="max-w-6xl mx-auto px-4 pb-20 pt-8 relative group">
          <style dangerouslySetInnerHTML={{
            __html: `
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-2 md:-left-14 top-[35%] w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-slate-700 hover:text-primary hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100 border border-slate-100 hidden md:flex"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>

          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-2 md:-right-14 top-[35%] w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-slate-700 hover:text-primary hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100 border border-slate-100 hidden md:flex"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>

          <div ref={categoryScrollRef} className="flex overflow-x-auto gap-0 pt-8 pb-12 items-start snap-x hide-scroll w-full smooth-scroll" style={{ scrollBehavior: 'smooth' }}>
            {[
              { name: "Stay", img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=400&fit=crop" },
              { name: "Animal Sightseeing", img: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=400&fit=crop" },
              { name: "Nature", img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop" },
              { name: "Night Camp", img: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=400&fit=crop" },
              { name: "Hiking", img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop" },
              { name: "Safari", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&fit=crop" },
              { name: "Culture", img: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=400&h=400&fit=crop" },
              { name: "Boating", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop" },
              { name: "Diving", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop" },
              { name: "Food & Wine", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop" },
              { name: "Wellness", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop" }
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="snap-start flex-none w-[calc(100%/3)] md:w-[calc(100%/4)] lg:w-[calc(100%/6)] flex flex-col items-center gap-4 cursor-pointer group outline-none"
                onClick={() => navigate(`/suggestions?category=${encodeURIComponent(cat.name)}`)}
                title={`Find ${cat.name} near me`}
              >
                <div
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-2xl bg-cover bg-center border-[6px] border-white dark:border-slate-800 ring-4 ring-[#6B8E23]/80 group-hover:ring-[#556B2F]"
                  style={{ backgroundImage: `url(${cat.img})` }}
                >
                  <div className="w-full h-full rounded-full bg-black/10 group-hover:bg-black/0 transition-all duration-500"></div>
                </div>
                <span className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <section className="relative max-w-7xl mx-auto px-4 py-24 overflow-hidden bg-white dark:bg-slate-950">
        {/* Zigzag Top Divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg className="relative block w-[calc(100%+1.3px)] h-[30px]" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0l30 40L60 0l30 40L120 0l30 40L180 0l30 40L240 0l30 40L300 0l30 40L330 0l30 40L390 0l30 40L420 0l30 40L450 0l30 40L480 0l30 40L510 0l30 40L540 0l30 40L570 0l30 40L600 0l30 40L630 0l30 40L660 0l30 40L690 0l30 40L720 0l30 40L750 0l30 40L780 0l30 40L810 0l30 40L840 0l30 40L870 0l30 40L900 0l30 40L930 0l30 40L960 0l30 40L990 0l30 40L1020 0l30 40L1050 0l30 40L1080 0l30 40L1110 0l30 40L1140 0l30 40L1170 0l30 40L1200 0v120H0z" className="fill-slate-50 dark:fill-slate-900"></path>
          </svg>
        </div>
        
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-16 gap-10"
        >
          <div className="flex flex-col items-start text-left md:w-1/2">
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              className="text-5xl md:text-6xl font-black mb-4 font-serif italic tracking-tight"
            >
              <motion.span
                animate={{ color: ["#064e3b", "#047857", "#064e3b"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                Featured Experiences
              </motion.span>
            </motion.h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl md:mb-0">Hand-picked destinations for your next escape.</p>
          </div>

          <div className="relative w-full md:w-[500px] h-[350px] flex items-center justify-center shrink-0 hidden md:flex">
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes globe-flight-orbit {
                0%   { transform: translate(-160px, 220px) rotate(36deg); opacity: 0; }
                10%  { opacity: 1; }
                50%  { transform: translate(0px, 0px) rotate(36deg); opacity: 1; }
                90%  { opacity: 1; }
                100% { transform: translate(160px, -220px) rotate(36deg); opacity: 0; }
              }
              @keyframes globe-float1 { 0%, 100% { transform: translateY(0px) scale(0.95); } 50% { transform: translateY(-8px) scale(0.95); } }
              @keyframes globe-float2 { 0%, 100% { transform: translateY(0px) scale(0.95); } 50% { transform: translateY(-12px) scale(0.95); } }
              @keyframes globe-float3 { 0%, 100% { transform: translateY(0px) scale(0.95); } 50% { transform: translateY(-6px) scale(0.95); } }
            `}} />

            <svg className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none" viewBox="0 0 500 350">
              <path d="M 50 175 Q 250 50, 450 175" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="6,6" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.05))' }} />
              <path d="M 120 280 Q 250 350, 380 280" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="6,6" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.05))' }} />
            </svg>

            <img src="https://em-content.zobj.net/source/apple/354/globe-showing-europe-africa_1f30d.png" alt="Globe" className="relative z-[2] w-[220px] h-[220px]" style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.15))' }} />

            <div className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none z-[15]">
              <svg viewBox="0 0 24 24" className="absolute w-[26px] h-[26px] -mt-[13px] -ml-[13px]" style={{ animation: 'globe-flight-orbit 6s linear infinite', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' }}>
                <path fill="#0F172A" className="dark:fill-white" d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
              </svg>
            </div>

            <div className="absolute top-[0%] left-[15%] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-1.5 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.1)] w-[110px] z-10 border border-white/80 dark:border-slate-700/80" style={{ animation: 'globe-float1 4s infinite' }}>
              <div className="absolute -bottom-2 -left-2 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md z-[11] bg-indigo-500 text-white"><svg viewBox="0 0 24 24" className="w-[12px] h-[12px] fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
              <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=150&h=100&fit=crop" className="w-full h-[75px] rounded-xl object-cover" />
              <div className="px-1 pt-2 pb-1 text-left"><h4 className="m-0 text-[11.5px] font-bold text-slate-900 dark:text-white leading-tight">Burj Khalifa</h4><p className="m-0 mt-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium">Dubai, UAE</p></div>
            </div>

            <div className="absolute top-[40%] -left-[2%] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-1.5 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.1)] w-[110px] z-10 border border-white/80 dark:border-slate-700/80" style={{ animation: 'globe-float2 5s infinite 1s' }}>
              <div className="absolute -bottom-2 -right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md z-[11] bg-emerald-500 text-white"><svg viewBox="0 0 24 24" className="w-[12px] h-[12px] fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
              <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=150&h=100&fit=crop" className="w-full h-[75px] rounded-xl object-cover" />
              <div className="px-1 pt-2 pb-1 text-left"><h4 className="m-0 text-[11.5px] font-bold text-slate-900 dark:text-white leading-tight">Taj Mahal</h4><p className="m-0 mt-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium">Agra, India</p></div>
            </div>

            <div className="absolute top-[30%] right-[0%] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-1.5 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.1)] w-[110px] z-10 border border-white/80 dark:border-slate-700/80" style={{ animation: 'globe-float3 4.5s infinite 0.5s' }}>
              <div className="absolute -top-2 -left-2 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md z-[11] bg-amber-500 text-white"><svg viewBox="0 0 24 24" className="w-[12px] h-[12px] fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
              <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=150&h=100&fit=crop" className="w-full h-[75px] rounded-xl object-cover" />
              <div className="px-1 pt-2 pb-1 text-left"><h4 className="m-0 text-[11.5px] font-bold text-slate-900 dark:text-white leading-tight">Safari Adventure</h4><p className="m-0 mt-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium">Masai Mara, Kenya</p></div>
            </div>

            <div className="absolute bottom-[0%] left-[15%] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-1.5 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.1)] w-[110px] z-10 border border-white/80 dark:border-slate-700/80" style={{ animation: 'globe-float1 5.5s infinite 1.5s' }}>
              <div className="absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md z-[11] bg-sky-500 text-white"><svg viewBox="0 0 24 24" className="w-[12px] h-[12px] fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
              <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=150&h=100&fit=crop" className="w-full h-[75px] rounded-xl object-cover" />
              <div className="px-1 pt-2 pb-1 text-left"><h4 className="m-0 text-[11.5px] font-bold text-slate-900 dark:text-white leading-tight">Maldives</h4><p className="m-0 mt-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium">Maldives</p></div>
            </div>

            <div className="absolute -bottom-[5%] right-[20%] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-1.5 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.1)] w-[110px] z-10 border border-white/80 dark:border-slate-700/80" style={{ animation: 'globe-float3 4.8s infinite 0.8s' }}>
              <div className="absolute -bottom-2 -left-2 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md z-[11] bg-pink-500 text-white"><svg viewBox="0 0 24 24" className="w-[12px] h-[12px] fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
              <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=150&h=100&fit=crop" className="w-full h-[75px] rounded-xl object-cover" />
              <div className="px-1 pt-2 pb-1 text-left"><h4 className="m-0 text-[11.5px] font-bold text-slate-900 dark:text-white leading-tight">Eiffel Tower</h4><p className="m-0 mt-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium">Paris, France</p></div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center md:justify-end gap-4 mb-8">
          <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            {
              title: "Swiss Alps Discovery",
              price: "₹2,499",
              days: "8",
              rating: "4.5",
              reviews: "120",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCl4tWjPhc7rmp0uOJ7UgRiK74yeVLJokKKASi-zjJkL26sPkDskRGVWMYn-KqXsbMsIHqtv7d5Xwjdef9eF3qnYI5PDBiHg8KeN-LJQ6-p4ul8ZPxzZOubRJHqUPe9o1IrAUUFAFU5LknSsfoTVBiRB-JFRdtcJgduz2fIFDJbRVlQX5G25-v2xlmslPu8_raK-sQpzPah7MLvxRt0829pIC7LizfTa7YQKCDWW1ZZvtwYDydPRgi_5nMLUAIBhm1UJcJi_yt414s"
            },
            {
              title: "Bali Wellness Escape",
              price: "₹1,850",
              days: "12",
              rating: "5.0",
              reviews: "85",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpxz9Lc7JszjSsAJWYtNmWOH9TTcj0Cl1qx88wWR4EvOR4ly7s6qDlSQ3Kg93AgMPTyjYtx94gzpRC7jIxxfyXzwjEksOyIAYPHCk1q1LkLJ0iEyKHok8rzVf69fo7mSpsaruXSMjUtHe8rwfiTBuxKIpFFh3IRs6AjhPxgXD-S2f7EzYVb85jmB_yzweicqhXRZJoURyzf4fMqjZlykSSM6LDcjFdzzOfNvX6zMKT3T7M0ryeiXaoB-xCqurcIZlCEdcitB9CByE"
            },
            {
              title: "Kenyan Safari Expedition",
              price: "₹3,200",
              days: "10",
              rating: "5.0",
              reviews: "154",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrCnpr7VJC1qM5mk21z4d8tMd_x5TGuqH93w_aturOToIIIeHM1Ys63TMEIxpN38IC3W9HyXCAZT8zHXZtuRlTHaRFQ6H8gZUOIx-sp0mYxEk9sYrEG6y-PYav0Mb9gNPLoGj-FeP_DrBKCURArn8x7bF3xSWbvwXpx8o_GGk_9iuHdlSiuY5QbdvFzZkUvqZIRKxkGrRq29hkrrtVRcVPprFPcR-D5VdevEX7TIHVyazU6HAYKm8zu7n8UBPnutExPXlJxgxTf9c"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { y: 50, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
              }}
              whileHover={{ y: -10 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800"
            >
              <div className="relative h-72 overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" src={item.image} alt={item.title} />
                <div className="absolute top-5 right-5 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-xs font-black text-primary shadow-lg">{item.days} Days</div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-bold text-sm tracking-wide">VIEW EXPEDITION</span>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">{item.title}</h4>
                <div className="flex items-center gap-1 text-yellow-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-sm ${i < Math.floor(item.rating) ? 'fill-1' : ''}`}>star</span>
                  ))}
                  <span className="text-xs text-slate-500 ml-2 font-bold uppercase tracking-widest">({item.reviews} reviews)</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Starting at</span>
                    <span className="text-3xl font-black text-primary leading-none">{item.price}</span>
                  </div>
                  <Link to="/details" className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <TravelWidget />

      <section className="bg-slate-50 dark:bg-slate-900/50 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-20 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-[12rem] font-black text-slate-100 dark:text-slate-800/10 pointer-events-none select-none"
          >
            STORY
          </motion.div>
          <div className="relative z-10 text-center">
            <h3 className="text-4xl font-black mb-6">What Our Explorers Say</h3>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3 }
            }
          }}
          className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            {
              name: "Sarah Jenkins",
              tour: "Swiss Alps Discovery, 2023",
              text: "The attention to detail was incredible. Everything from the boutique hotels to the local guides was top-notch. Truly an extraordinary experience.",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApPvrkZ9agajm0gREmdaALnTTso6HSHWjvvtoXnIlbiCOoPbtoC2W3zBIfab0_n3iT0jfKpDYuKVlpzoEbRcLS0rNnXu2dg3FvXJr28GJbEdBmwnT2HNv4iozKRHPIgTakNCYblDrZ26DQ7vW94ezokKKbvex2gfg3BvroJE-AxqfEZ_4Yz5ScKbhe_9cifRKVSANqDMMJ4cIfxu2xeCBrUMHEEG7bA-3rD_VjkhF3CTqT-ZiPja_vSgLNj_2qwX5J1VtUqSTXjb0"
            },
            {
              name: "Mark Thompson",
              tour: "Kenyan Safari, 2023",
              text: "I've traveled with many agencies, but AdventureGate stands out. They find the most unique spots away from the crowds. Worth every penny.",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAws-PUaguydegvehoMvtF7hioESO8TmZDY81ny1PxMMh0M4H3VkpNlRHZ-_CXIhScXzaDK9EruqirQHMpHs0YNYcGsL_SplHZyLpQrXvrWS6T3qZtUkmH2BNls1xkOu5w6mZGiandYqlSbRb4T6wr7SobF1QUSSIW6v8OMIDeu4ZkOU02YouFCJq8vD330rQ5u4_pWyeunDPgUyXgTHMXGUF5YJv62U2i_zsZDufDthMLMa_rYuxtIVFyV24cRmi_smtwbnS6sd7M"
            },
            {
              name: "Elena Rodriguez",
              tour: "Bali Wellness, 2022",
              text: "The perfect balance of adventure and relaxation. The local knowledge their team has is what made the difference for my trip to Bali.",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwaIVBDmN2OO2qww5S_0LJr-jyvSGrI_-MaKTgboUQIbt3NnPZ9BS4pIbofUp0lqynkA2p64uWbS2Vk4oonSh70mwAG5Qug5BtBqkfeVcvSuN47heI9gdp2yqqRklnKkmxlQHsPUf42Bd7RR4eA73Ar4M3S5dFeqm5tZI6-MTWWV-w8MkhrF895m7OEri6LEpNcRH9UHbwHV7IFO4cG3zwURyjflnV__oMXBFZveb-pbm_AwmFnrovwB3U6x23GKuGnkOGVoGjsI4"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { y: 30, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              whileHover={{ scale: 1.02 }}
              className="group bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative"
            >
              <span className="material-symbols-outlined text-primary/10 text-8xl absolute top-6 right-8 group-hover:text-primary/20 transition-colors duration-500">format_quote</span>
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="relative">
                  <img className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-900 shadow-lg" src={item.img} alt={item.name} />
                  <div className="absolute -bottom-1 -right-1 bg-primary w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-white">verified</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-black text-lg">{item.name}</h5>
                  <p className="text-xs text-primary font-bold tracking-tighter uppercase">{item.tour}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic text-lg leading-relaxed relative z-10">"{item.text}"</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </motion.div>
  )
}

export default Home

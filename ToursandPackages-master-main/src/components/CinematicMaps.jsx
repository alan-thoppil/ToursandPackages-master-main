import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const destinations = [
  { id: 1, name: "Taj Mahal, India", tagline: "Sunrise lighting & timeless architecture", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&fit=crop" },
  { id: 2, name: "Burj Khalifa, Dubai", tagline: "Night city glow & modern ambition", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&fit=crop" },
  { id: 3, name: "African Safari", tagline: "Untamed nature & golden hour warmth", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&fit=crop" },
  { id: 4, name: "Eiffel Tower, Paris", tagline: "Evening lights & romantic atmosphere", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&fit=crop" },
  { id: 5, name: "Maldives Islands", tagline: "Bright blue water & tropical bliss", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&fit=crop" },
  { id: 6, name: "Mount Fuji, Japan", tagline: "Iconic peaks & blooming cherry blossoms", image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1600&fit=crop" },
  { id: 7, name: "Santorini, Greece", tagline: "White domes & endless blue horizons", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1600&fit=crop" },
  { id: 8, name: "Machu Picchu, Peru", tagline: "Ancient echoes & towering Andes", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&fit=crop" },
  { id: 9, name: "Northern Lights, Iceland", tagline: "Aura borealis & snowy pristine valleys", image: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1600&fit=crop" },
  { id: 10, name: "Colosseum, Rome", tagline: "Gladiator echoes & vast history", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&fit=crop" },
  { id: 11, name: "Grand Canyon, USA", tagline: "Monumental scale & red rock strata", image: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?w=1600&fit=crop" },
  { id: 12, name: "Bali Resorts, Indonesia", tagline: "Tropical lush jungle & infinity pools", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1600&fit=crop" },
  { id: 13, name: "Swiss Alps", tagline: "Powder snow & dramatic mountain drops", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1600&fit=crop" },
  { id: 14, name: "Yosemite Valley, USA", tagline: "Giant sequoias & sheer granite cliffs", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&fit=crop" },
  { id: 15, name: "Venice Canals, Italy", tagline: "Gondolas & renaissance architecture", image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1600&fit=crop" },
  { id: 16, name: "Petra, Jordan", tagline: "Rose-red city & sheer rock faces", image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1600&fit=crop" },
  { id: 17, name: "Kyoto Temples, Japan", tagline: "Serene bamboo & traditional shrines", image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600&fit=crop" },
  { id: 18, name: "Sydney Opera House", tagline: "Harbor views & modern marvels", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&fit=crop" },
  { id: 19, name: "Rio de Janeiro, Brazil", tagline: "Lush coasts & vibrant culture", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&fit=crop" },
  { id: 20, name: "New York City, USA", tagline: "Endless skyline & buzzing neon energy", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&fit=crop" }
];

const CinematicMaps = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 5000); // Transitions every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20">


      <div className="relative h-[550px] md:h-[650px] w-full max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white dark:border-slate-800 bg-black group isolate">
        
        {/* Seamless Cinematic Crossfade Loop */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              transition: { opacity: { duration: 1.5, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } } 
            }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${destinations[currentIndex].image})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30"></div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-screen bg-slate-900 bg-opacity-20 flex justify-center items-center">
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none"></div>
        </div>

      </div>

      {/* Restored Information Block Below The Image Sequence */}
      <div className="mt-8 max-w-4xl mx-auto w-full z-30">
        <AnimatePresence mode="wait">
           <motion.div
             key={currentIndex}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
             exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
             className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl overflow-hidden relative"
           >
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                 <div className="flex items-center gap-3 mb-3">
                   <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_15px_rgba(251,146,60,0.8)]"></span>
                   <p className="text-orange-600 dark:text-orange-400 font-bold uppercase tracking-[0.25em] text-xs">Live Travel Camera</p>
                 </div>
                 <h2 className="text-4xl text-slate-800 dark:text-white font-serif italic font-black mb-2">{destinations[currentIndex].name}</h2>
                 <p className="text-slate-500 text-lg font-medium tracking-wide">
                   {destinations[currentIndex].tagline}
                 </p>
               </div>
               
               <div className="w-full md:w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0 mt-2 md:mt-0 relative">
                 <motion.div 
                   key={`progress-${currentIndex}`}
                   initial={{ width: "0%" }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 5, ease: "linear" }}
                   className="absolute top-0 left-0 h-full bg-orange-500 shadow-[0_0_10px_rgba(251,146,60,0.8)]"
                 ></motion.div>
               </div>
             </div>
           </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

export default CinematicMaps;

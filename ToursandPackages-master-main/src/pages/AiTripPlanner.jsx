import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AiTripPlanner = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate initial loading for aesthetics
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Load the widget script
    const script = document.createElement('script');
    script.src = "/widget/itinerary-widget.js";
    script.async = true;
    script.dataset.apiBase = "";
    script.dataset.target = "#itinerary-widget-container";
    document.body.appendChild(script);

    return () => {
      clearTimeout(timer);
      document.body.removeChild(script);
      // Clean up injected styles if necessary, but the widget handles its own scope
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-900 pt-32 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Cinematic Travel Background */}
      <motion.div 
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/ai_trip_planner_bg.png')",
          filter: "brightness(0.5) saturate(1.1)"
        }}
      >
        {/* Subtle Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90"></div>
      </motion.div>
      
      {/* Stars/Particles Effect */}
      <div className="absolute inset-0 opacity-30 z-0">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="z-10 flex flex-col items-center"
        >
          <div className="w-20 h-20 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin mb-8"></div>
          <h1 className="text-4xl font-black text-white italic font-serif">Powering up AI Engines...</h1>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl z-10"
        >
          <div id="itinerary-widget-container" className="w-full"></div>
        </motion.div>
      )}

      {/* Decorative Road (Only visible at bottom) */}
      {!loading && (
        <div className="absolute bottom-0 w-full h-12 bg-slate-800 border-t-4 border-slate-700 overflow-hidden opacity-50">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            className="flex gap-16 w-[200%] h-full items-center"
          >
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-20 h-2 bg-yellow-500/50 rounded-full"></div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AiTripPlanner;

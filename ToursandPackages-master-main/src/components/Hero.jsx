import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero_bg_new.png'

const Hero = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Scale: Start at 1, zoom in to 6x to really enter the green area
  const scale = useTransform(scrollYProgress, [0, 0.9], [1, 6])
  
  // Blur: Everything blurs into a soft green light as we reach the climax
  const globalBlur = useTransform(scrollYProgress, [0, 0.2, 0.8], [0, 4, 40])
  const exteriorBlur = useTransform(scrollYProgress, [0, 0.5], [0, 25])
  
  // Opacity: Fade into the main content
  const heroOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])
  
  // Content: Fade out title and button as we scroll
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-background-dark">
      <motion.div 
        style={{ opacity: heroOpacity }}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        {/* Layer 1: Blurred Interior */}
        <motion.div 
          style={{ 
            scale,
            filter: `blur(${exteriorBlur}px) brightness(0.8)`,
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            willChange: 'transform, filter'
          }}
          className="absolute inset-0 z-0"
        />

        {/* Layer 2: Sharp Window View -> Becomes Blurred */}
        <motion.div 
          style={{ 
            scale,
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            clipPath: 'inset(8% 12% 12% 12% round 50px)',
            willChange: 'transform, clip-path'
          }}
          className="absolute inset-0 z-10"
        />

        {/* Global Blur Overlay (Smoothens everything together) */}
        <motion.div 
          style={{ 
            backdropFilter: `blur(${globalBlur}px)`,
            backgroundColor: 'rgba(58, 176, 255, 0.05)' // Very subtle sky blue tint as we blur
          }}
          className="absolute inset-0 z-[15] pointer-events-none"
        />

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-6xl md:text-9xl font-black text-secondary mb-6 tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.05)]"
          >
            THE BLUE <span className="text-primary italic">ESCAPE</span>
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
             className="text-xl md:text-2xl text-secondary/80 max-w-2xl mb-12 font-medium drop-shadow-sm"
          >
            Luxury redefined. Witness the world's most pristine wilderness from the comfort of your private suite.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Link to="/listing" className="group relative bg-white text-secondary px-12 py-6 rounded-full text-xl font-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all hover:scale-110 active:scale-95 flex items-center gap-3">
              <span className="relative z-10">EXPLORE PACKAGES</span>
              <span className="material-symbols-outlined relative z-10 group-hover:translate-x-2 transition-transform">arrow_forward</span>
              <div className="absolute inset-0 bg-primary origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"></div>
              <span className="absolute inset-0 z-20 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                EXPLORE PACKAGES
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: contentOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-secondary/20 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-secondary rounded-full"
            />
          </div>
        </motion.div>

        {/* Vignette for depth */}
        <div className="absolute inset-0 z-[15] pointer-events-none bg-gradient-to-t from-background-dark/80 via-transparent to-background-dark/40"></div>
      </motion.div>
    </div>
  )
}

export default Hero

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import waterfallBg from '../assets/waterfall_bg.png'
import mistOverlay from '../assets/mist_overlay.png'

const DivingHero = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // 1. Waterfall Zoom: middle part comes forward
  const waterfallScale = useTransform(scrollYProgress, [0, 1], [1, 2.5])
  
  // 2. Cliff "Leap": Sides move outwards and scale away
  const cliffLeftX = useTransform(scrollYProgress, [0, 0.8], ["0%", "-30%"])
  const cliffRightX = useTransform(scrollYProgress, [0, 0.8], ["0%", "30%"])
  const cliffScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.2])

  // 3. Mist swelling up
  const mistY = useTransform(scrollYProgress, [0.4, 1], ["60%", "-20%"])
  const mistOpacity = useTransform(scrollYProgress, [0.4, 0.9], [0, 0.8])
  const mistScale = useTransform(scrollYProgress, [0.4, 1], [1, 2])

  // 4. Blur and Vignette
  const globalBlur = useTransform(scrollYProgress, [0.3, 0.9], [0, 30])
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.7], [0.3, 0.8])
  
  // 5. Hero Fade Out
  const heroOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])

  // Typography animations
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -100])

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-background-dark">
      <motion.div 
        style={{ opacity: heroOpacity }}
        className="sticky top-0 h-screen w-full overflow-hidden bg-background-light"
      >
        {/* Layer 1: Background Waterfall (Center Focus) */}
        <motion.div 
          style={{ 
            scale: waterfallScale,
            backgroundImage: `url(${waterfallBg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: `blur(${globalBlur}px)`
          }}
          className="absolute inset-0 z-0"
        />

        {/* Layer 2: Left Cliff Side */}
        <motion.div 
          style={{ 
            x: cliffLeftX,
            scale: cliffScale,
            backgroundImage: `url(${waterfallBg})`,
            backgroundPosition: 'left center',
            backgroundSize: 'cover',
            clipPath: 'polygon(0 0, 45% 0, 35% 100%, 0% 100%)',
            filter: `blur(${globalBlur * 0.5}px)`
          }}
          className="absolute inset-0 z-10"
        />

        {/* Layer 3: Right Cliff Side */}
        <motion.div 
          style={{ 
            x: cliffRightX,
            scale: cliffScale,
            backgroundImage: `url(${waterfallBg})`,
            backgroundPosition: 'right center',
            backgroundSize: 'cover',
            clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 65% 100%)',
            filter: `blur(${globalBlur * 0.5}px)`
          }}
          className="absolute inset-0 z-10"
        />

        {/* Layer 4: Rising Mist/Spray */}
        <motion.div 
          style={{ 
            y: mistY,
            opacity: mistOpacity,
            scale: mistScale,
            backgroundImage: `url(${mistOverlay})`,
            backgroundPosition: 'bottom center',
            backgroundSize: 'cover',
            mixBlendMode: 'screen'
          }}
          className="absolute inset-0 z-20 pointer-events-none"
        />

        {/* Vignette Overlay */}
        <motion.div 
          style={{ opacity: vignetteOpacity }}
          className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(240,249,255,0.8)_110%)]"
        />

        {/* Typography */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-40 h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-primary font-bold tracking-[0.4em] text-sm md:text-base mb-4 uppercase"
          >
            Leave it all behind
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-6xl md:text-9xl font-black text-secondary tracking-widest uppercase drop-shadow-sm"
          >
            THE <span className="text-primary">LEAP</span>
          </motion.h1>
          
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 100 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-px bg-white/20 mt-12 relative overflow-hidden"
          >
            <motion.div 
              animate={{ y: [0, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/4 bg-primary"
            />
          </motion.div>
        </motion.div>

        {/* Bottom Scroll Hint */}
        <motion.div 
          style={{ opacity: textOpacity }}
          className="absolute bottom-12 w-full text-center z-40"
        >
          <p className="text-secondary/40 text-xs font-bold tracking-[0.5em] uppercase">Scroll to Dive</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default DivingHero

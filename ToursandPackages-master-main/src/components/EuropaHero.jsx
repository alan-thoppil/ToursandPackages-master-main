import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import europaImg from '../assets/europa_master.png'

const EuropaHero = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Parallax Values
  // 1. Slow background scaling & zoom-in effect
  const imageScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.25])
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"])

  // 2. The famous "FLOAT UP" of the Get Started button derived from the user's screenshots
  const buttonY = useTransform(scrollYProgress, [0, 0.4, 0.9], [0, -200, -800])
  const buttonScale = useTransform(scrollYProgress, [0, 0.4, 0.9], [1, 1.2, 0.8])
  const buttonOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0])

  // 3. Text fading and shifting
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // 4. Global scene fade to background parchment
  const sceneOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-[#fdf8f0]">
      <motion.div 
        style={{ opacity: sceneOpacity }}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center pt-24"
      >
        {/* Master Painting Layer */}
        <motion.div 
          style={{ 
            scale: imageScale,
            y: imageY,
            backgroundImage: `url(${europaImg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
          className="absolute inset-0 z-0 brightness-110"
        >
          {/* Subtle Vignette to keep focus on center characters */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.1)_100%)]" />
        </motion.div>

        {/* The Atmospheric Text from Screenshot */}
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 text-center max-w-2xl px-8"
        >
          <h2 className="text-3xl md:text-5xl font-serif text-dark drop-shadow-sm leading-snug">
            We build websites that convert<br/>
            <span className="italic text-primary">users and turn into fans</span>
          </h2>
        </motion.div>

        {/* The "Floating Up" Get Started Button Layer */}
        <motion.div 
          style={{ y: buttonY, scale: buttonScale, opacity: buttonOpacity }}
          className="absolute bottom-[25%] left-0 right-0 z-20 flex justify-center"
        >
          <button className="bg-primary text-white px-10 py-5 rounded-full flex items-center gap-3 font-bold tracking-widest text-[10px] uppercase shadow-2xl hover:bg-secondary transition-all group overflow-hidden">
            <span className="relative z-10">Get Started</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            
            {/* Subtle glow effect behind button */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 blur-xl" />
          </button>
        </motion.div>

        {/* Parallax Overlay (Bottom Shadow/Rocks as foreground) */}
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]) }}
          className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10"
        />
      </motion.div>
    </div>
  )
}

export default EuropaHero

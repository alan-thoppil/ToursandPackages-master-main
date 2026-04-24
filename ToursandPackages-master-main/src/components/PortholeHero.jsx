import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import { useRef } from 'react'
import pierImg from '../assets/pier_view_hd.png'
import frameImg from '../assets/porthole_frame_hd.png'

const PortholeHero = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Parallax Values
  // 1. The frame zooms in aggressively to "open" the view
  const frameScale = useTransform(scrollYProgress, [0, 0.6], [0.8, 4])
  const frameOpacity = useTransform(scrollYProgress, [0.4, 0.7], [1, 0])

  // 2. The pier view zooms in slowly for a sense of depth
  const viewScale = useTransform(scrollYProgress, [0, 1], [1, 1.3])
  const viewY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"])

  // 3. Text animations
  const textScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  // 4. Reveal bottom content
  const overlayOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1])

  // 5. Pier Mask Scale (to match frame)
  // Wider start (456px) to ensure we fully bridge the gap to the brass frame inner edge
  const maskRadius = useTransform(scrollYProgress, [0, 0.6], [456, 2500])
  const maskString = useMotionTemplate`radial-gradient(circle ${maskRadius}px at center, black 99%, transparent 100%)`

  // 6. Reflection opacity (fades as you get closer to the "glass")
  const reflectionOpacity = useTransform(scrollYProgress, [0, 0.4], [0.15, 0])

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-background-dark">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Step 1: Background Pier View (Masked to porthole) */}
        <motion.div 
          style={{ 
            scale: viewScale,
            y: viewY,
            backgroundImage: `url(${pierImg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            WebkitMaskImage: maskString,
            maskImage: maskString,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat'
          }}
          className="absolute inset-0 z-0 brightness-[1.1] contrast-[1.05]"
        />

        {/* Step 2: Glass Reflection Layer (Inside the porthole) */}
        <motion.div
           style={{ 
             opacity: reflectionOpacity,
             scale: frameScale,
             WebkitMaskImage: maskString,
             maskImage: maskString,
           }}
           className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5"
        />

        {/* Step 3: The Ultra-HD Metallic Frame */}
        <motion.div 
          style={{ 
            scale: frameScale,
            willChange: 'transform, opacity'
          }}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <motion.img 
            src={frameImg} 
            style={{ 
              opacity: frameOpacity,
              // Extra wide mask to ensure the white center of the frame image is completely removed
              maskImage: 'radial-gradient(circle at center, transparent 37%, black 38%, black 48%, transparent 49%)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 37%, black 38%, black 48%, transparent 49%)'
            }}
            className="w-[1200px] h-[1200px] object-contain drop-shadow-[0_0_100px_rgba(212,175,55,0.2)] relative z-20"
            alt="Porthole Frame"
          />
        </motion.div>

        {/* Step 4: Hero Content */}
        <motion.div 
          style={{ scale: textScale, opacity: textOpacity, y: textY }}
          className="relative z-30 text-center flex flex-col items-center justify-center px-4"
        >
          <motion.span 
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.8em" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-primary text-[10px] font-black uppercase mb-8"
          >
            Discovery Awaits
          </motion.span>
          <h1 className="text-7xl md:text-9xl font-serif text-secondary leading-none tracking-tighter mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            THE <br/> <span className="italic text-primary selection:text-white">VOYAGE.</span>
          </h1>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 96 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-px bg-gradient-to-b from-primary to-transparent" 
          />
        </motion.div>

        {/* Step 5: Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 2 }}
          className="absolute bottom-12 z-30 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] text-secondary/60 uppercase tracking-[0.4em] font-bold">Initiate Descent</span>
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-[2px] h-10 bg-gradient-to-b from-primary/60 to-transparent"
          />
        </motion.div>

        {/* Final Reveal Overlay */}
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-background-light/40 z-40 pointer-events-none"
        />
      </div>
    </div>
  )
}

export default PortholeHero

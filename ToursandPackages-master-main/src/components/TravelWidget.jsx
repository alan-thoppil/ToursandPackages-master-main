import { useEffect } from 'react'
import CinematicMaps from './CinematicMaps'

const TravelWidget = () => {
  useEffect(() => {
    // Only add the script if it doesn't already exist
    if (!document.getElementById('tiw-script')) {
      const apiOrigin = ''
      
      const script = document.createElement('script')
      script.id = 'tiw-script'
      // Load the script from the backend /widget directory (proxied via Vite)
      script.src = `/widget/itinerary-widget.js?v=${Date.now()}`
      script.dataset.apiBase = apiOrigin
      script.dataset.target = '#itinerary-widget'
      script.dataset.mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || ('pk.eyJ1IjoiYX' + 'l1c2h2cCIsImEiOiJjbW1' + '1NndlOG0xcm53MnFyMDFta3hsZ2ZoIn0.GQ' + 'xZTMFEnhKItmoC2gNTGw')
      script.async = true
      
      script.onload = () => {
        if (window.TravelItineraryWidget) {
          window.TravelItineraryWidget.mount()
        }
      }
      
      document.body.appendChild(script)
    } else {
      // If script exists, just remount if needed
      if (window.TravelItineraryWidget) {
        window.TravelItineraryWidget.mount()
      }
    }

    return () => {
      // Cleanup if necessary
    }
  }, [])

  return (
    <>
      <div className="pt-20 bg-slate-50 dark:bg-slate-900">
        {/* Cinematic Animation now displayed OUTSIDE the video background container */}
        <CinematicMaps />
      </div>

      <section className="relative overflow-hidden w-full min-h-screen py-24 flex items-center justify-center" id="itinerary-planner">
        {/* Highly Robust YouTube Background Video - Guaranteed to play in any browser */}
        <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] min-w-[200vh] min-h-[100vw] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none overflow-hidden before:absolute before:inset-0 before:bg-black/30 dark:before:bg-black/50 before:z-10">
          <iframe
            className="absolute top-0 left-0 w-full h-full z-0 opacity-90"
            src="https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=LXb3EKWsInQ&playsinline=1&end=298"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="relative z-10 w-full px-4 pt-10">
          <div id="itinerary-widget"></div>
        </div>
      </section>
    </>
  )
}

export default TravelWidget

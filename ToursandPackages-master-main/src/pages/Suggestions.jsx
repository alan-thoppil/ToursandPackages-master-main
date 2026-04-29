import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const Suggestions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [locationStr, setLocationStr] = useState('');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  
  const [selectedResult, setSelectedResult] = useState(null);
  
  const query = new URLSearchParams(useLocation().search);
  const category = query.get('category') || 'Activities';
  const navigate = useNavigate();

  // Fetch Autocomplete as user types
  useEffect(() => {
    const fetchAutoComplete = async () => {
      if (!isManualInput || locationStr.length < 3) {
        setAutoCompleteResults([]);
        setShowDropdown(false);
        return;
      }
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationStr)}`);
        const data = await res.json();
        if (data.results) {
          setAutoCompleteResults(data.results);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Autocomplete failed", err);
      }
    };

    const timer = setTimeout(fetchAutoComplete, 300);
    return () => clearTimeout(timer);
  }, [locationStr]);

  const handleSelectLocation = (loc) => {
    setIsManualInput(false);
    setLocationStr(loc.display_name);
    setCoords({ lat: loc.lat, lon: loc.lon });
    setShowDropdown(false);
    setAutoCompleteResults([]);
  };

  const handleGetCurrentLocation = () => {
    setIsManualInput(false);
    setLocationStr("Requesting GPS...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCoords({ lat, lon });
          
          try {
            const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data.city) {
              const city = data.city + (data.address?.state ? `, ${data.address.state}` : "");
              const titleCase = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
              setLocationStr(titleCase);
            } else {
              setLocationStr(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            }
          } catch (error) {
            console.error("Reverse geocoding failed", error);
            setLocationStr(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        },
        () => {
          setLocationStr("");
          alert("Location permission denied.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = async () => {
    if(!locationStr) return alert("Please enter a location first!");
    setSearchInitiated(true);
    setLoading(true);
    setShowDropdown(false);
    
    let currentCoords = coords;

    // If no coordinates yet, try to geocode the string
    if (!currentCoords && locationStr) {
       try {
          const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(locationStr)}`);
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
             const top = geoData.results[0];
             currentCoords = { lat: top.lat, lon: top.lon };
             setCoords(currentCoords);
          } else {
             alert("Could not find coordinates for this location. Please try a more specific name.");
             setLoading(false);
             return;
          }
       } catch (err) {
          console.error("Geocoding failed", err);
       }
    }

    // Now call the Smart AI Backend with coordinates (either GPS or Geocoded)
    if (currentCoords) {
      try {
        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: currentCoords.lat,
            lng: currentCoords.lon,
            category: category
          })
        });
        const data = await response.json();
        if (data.suggestions) {
          const formatted = data.suggestions.map((s, idx) => ({
            id: idx,
            name: s.name,
            rating: s.rating,
            reason: s.reason,
            lat: s.lat,
            lng: s.lng,
            image: `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&sig=${idx}` 
          }));
          setResults(formatted);
          if (formatted.length > 0) setSelectedResult(formatted[0]);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("AI Suggestions search failed", error);
        alert("Failed to fetch AI suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback/Legacy Simulation if everything fails
    setResults([]);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 pt-32 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors mb-8 font-semibold">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </button>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 mb-12 border border-slate-100 dark:border-slate-700 max-w-4xl">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
            Find <span className="text-orange-500">{category}</span> Near You
          </h1>
          <p className="text-slate-500 mb-8 font-medium">Enter a location or let us detect it automatically to fetch AI-curated suggestions.</p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
                <input 
                  type="text" 
                  value={locationStr}
                  onChange={(e) => {
                    setIsManualInput(true);
                    setLocationStr(e.target.value);
                    setShowDropdown(true);
                  }}
                  placeholder="Enter a location (e.g. Wayanad, Kerala)" 
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                />
                {locationStr && (
                  <button 
                    onClick={() => { setLocationStr(""); setCoords(null); setShowDropdown(false); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}

                {/* Autocomplete Dropdown */}
                {showDropdown && autoCompleteResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100] backdrop-blur-xl">
                    {autoCompleteResults.map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full px-6 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col border-b border-slate-50 dark:border-slate-700 last:border-none transition-colors"
                      >
                        <span className="text-slate-800 dark:text-white font-bold text-sm">{loc.name}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs truncate">{loc.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            <button 
              onClick={handleGetCurrentLocation}
              className="px-6 py-4 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-200 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">satellite</span>
              Auto-Detect
            </button>
          </div>
          
          {coords && locationStr && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-6 px-2">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Lat: {coords.lat.toFixed(4)}, Long: {coords.lon.toFixed(4)}
            </div>
          )}
          
          <button 
            onClick={handleSearch}
            className="w-full py-4 rounded-xl bg-orange-500 text-white font-black text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
               <span className="material-symbols-outlined animate-spin font-bold">autorenew</span>
            ) : (
               <span className="material-symbols-outlined font-bold">search</span>
            )}
            {loading ? 'Consulting Travel AI...' : 'Explore Local Recommendations'}
          </button>
        </div>

        {/* Results Section with Split View */}
        {searchInitiated && !loading && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* List Side */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full lg:w-[600px] shrink-0 space-y-6">
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Curated Recommendations</h2>
                 <span className="px-4 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold border border-slate-300 dark:border-slate-600">
                    {results.length} Spots Found
                 </span>
              </div>

              {results.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Spots Found Nearby</h3>
                  <p className="text-slate-500">We couldn't find any specific "{category}" spots within 20km. Try a different category or location.</p>
                </div>
              ) : (
                results.map((result) => (
                  <motion.div 
                    key={result.id} 
                    layoutId={`card-${result.id}`}
                    onClick={() => setSelectedResult(result)}
                    className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border-2 transition-all duration-300 p-6 group cursor-pointer ${selectedResult?.id === result.id ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-slate-100 dark:border-slate-700 hover:border-orange-200'}`}
                  >
                     <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                           <img src={result.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={result.name} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2 gap-2">
                             <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors leading-tight">{result.name}</h3>
                             <span className="px-2 py-1 bg-orange-100 text-orange-700 font-bold rounded-lg text-xs flex items-center gap-1 shrink-0">
                                <span className="material-symbols-outlined text-[10px] font-bold">star</span>
                                {Number(result.rating || 0).toFixed(1)}
                             </span>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-600">
                             <p className="text-slate-600 dark:text-slate-300 text-sm italic font-medium leading-relaxed">"{result.reason}"</p>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <button className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                               View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                            {result.lat && result.lng && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedResult(result); }}
                                className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all shadow-md"
                              >
                                <span className="material-symbols-outlined text-xs">map</span>
                                Show on Map
                              </button>
                            )}
                          </div>
                        </div>
                     </div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Sticky Detail & Map Side */}
            <div className="flex-1 sticky top-28 h-[calc(100vh-140px)] hidden lg:block pb-8">
               <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative flex flex-col">
                  {selectedResult ? (
                    <>
                      {/* Place Image Header */}
                      <div className="w-full h-48 shrink-0 relative overflow-hidden">
                        <img src={selectedResult.image} className="w-full h-full object-cover" alt={selectedResult.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-6">
                           <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                              Selected Spot
                           </span>
                        </div>
                      </div>

                      {/* Place Info Content */}
                      <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">{selectedResult.name}</h4>
                           <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1 text-orange-500">
                                 <span className="material-symbols-outlined text-lg font-bold">star</span>
                                 <span className="text-xl font-black">{selectedResult.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Rating</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                           <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">category</span>
                              {category}
                           </span>
                           <span className="px-4 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold border border-green-200 dark:border-green-500/30 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              AI Verified
                           </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-8">
                           <a 
                             href={`https://www.google.com/maps/dir/?api=1&destination=${selectedResult.lat},${selectedResult.lng}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                           >
                              <span className="material-symbols-outlined text-lg">directions</span>
                              Directions
                           </a>
                           <button className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-orange-100 hover:text-orange-600 transition-colors">
                              <span className="material-symbols-outlined">bookmark</span>
                           </button>
                           <button className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-orange-100 hover:text-orange-600 transition-colors">
                              <span className="material-symbols-outlined">share</span>
                           </button>
                        </div>

                        {/* Description Section */}
                        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-3xl border border-slate-100 dark:border-slate-600">
                           <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">description</span>
                              Why visit?
                           </h5>
                           <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic font-medium">"{selectedResult.reason}"</p>
                        </div>

                        {/* Location Header */}
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                           <span className="material-symbols-outlined text-sm">location_on</span>
                           Live Location Map
                        </h5>

                        {/* Map Container (Integrated) */}
                        <div className="w-full h-[450px] rounded-3xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl relative">
                           <iframe
                             width="100%"
                             height="100%"
                             style={{ border: 0 }}
                             loading="lazy"
                             srcDoc={`
                               <!DOCTYPE html>
                               <html>
                                 <head>
                                   <style>
                                     body, html, iframe { margin: 0; height: 100%; width: 100%; overflow: hidden; background: #0f172a; }
                                   </style>
                                 </head>
                                 <body>
                                   <iframe 
                                     frameborder="0" 
                                     scrolling="no" 
                                     marginheight="0" 
                                     marginwidth="0" 
                                     src="https://maps.google.com/maps?q=${selectedResult.lat},${selectedResult.lng}&t=h&z=16&ie=UTF8&iwloc=&output=embed"
                                   ></iframe>
                                 </body>
                               </html>
                             `}
                           ></iframe>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4 px-2">
                           <div className="text-[10px] font-bold text-slate-400 flex flex-col">
                              <span>Latitude: {selectedResult.lat.toFixed(6)}</span>
                              <span>Longitude: {selectedResult.lng.toFixed(6)}</span>
                           </div>
                           <a 
                             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedResult.name + ' ' + selectedResult.lat + ',' + selectedResult.lng)}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="ml-auto text-blue-500 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                           >
                             Full Map View <span className="material-symbols-outlined text-sm">open_in_new</span>
                           </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50">
                       <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-6">
                          <span className="material-symbols-outlined text-5xl text-orange-500">explore</span>
                       </div>
                       <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">Ready to explore?</h4>
                       <p className="text-slate-400 text-sm font-medium">Select a curated spot from the list to see detailed insights and live location data.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default Suggestions;

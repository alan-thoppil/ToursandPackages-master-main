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
          setResults(data.suggestions.map((s, idx) => ({
            id: idx,
            name: s.name,
            rating: s.rating,
            reason: s.reason,
            lat: s.lat,
            lng: s.lng,
            image: `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&sig=${idx}` 
          })));
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

  // Initial location detection removed to give user full control over when to fetch GPS.
  // Location will only be fetched when the "Auto-Detect" button is clicked.

  // Removed the auto-search useEffect to give user control.

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors mb-8 font-semibold">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </button>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 mb-12 border border-slate-100 dark:border-slate-700">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
            Find <span className="text-orange-500">{category}</span> Near You
          </h1>
          <p className="text-slate-500 mb-8 font-medium">Enter a location or let us detect it automatically via Browser Location API to fetch suggestions.</p>
          
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
            {loading ? 'Fetching Recommendations via API...' : 'Show Real-Time Suggestions'}
          </button>
        </div>

        {/* Results Section */}
        {searchInitiated && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between mb-6 px-2">
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Top Results</h2>
               <span className="px-4 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold border border-slate-300 dark:border-slate-600">
                  {results.length} Spots Found
               </span>
            </div>

            {results.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Spots Found Nearby</h3>
                <p className="text-slate-500">We couldn't find any specific "{category}" spots within 10-20km of your current location. Try searching for a different category or entering a larger city manually.</p>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 p-8 group hover:shadow-2xl transition-all duration-300">
                   <div className="flex-1 flex flex-col justify-center">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors leading-tight">{result.name}</h3>
                         <span className="px-3 py-1.5 h-fit bg-orange-100 text-orange-700 font-bold rounded-lg text-sm flex items-center gap-1.5 shrink-0">
                            <span className="material-symbols-outlined text-sm font-bold">star</span>
                            {Number(result.rating || 0).toFixed(1)} / 5
                         </span>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-600">
                         <p className="text-xs text-orange-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">psychology</span>
                           AI Curated Reason
                         </p>
                         <p className="text-slate-600 dark:text-slate-300 font-medium italic">"{result.reason}"</p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-3">
                          <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-colors shadow-md">
                             View Details
                          </button>
                          {result.lat && result.lng && (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">map</span>
                              View on Maps
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Verified via OSM</span>
                           <span className="text-orange-500 text-[10px] font-black uppercase tracking-tighter">Powered by AI</span>
                        </div>
                      </div>
                   </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
export default Suggestions;

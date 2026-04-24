import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const Suggestions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [locationStr, setLocationStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchInitiated, setSearchInitiated] = useState(false);
  
  const query = new URLSearchParams(useLocation().search);
  const category = query.get('category') || 'Activities';
  const navigate = useNavigate();

  const handleGetCurrentLocation = () => {
    setLocationStr("Requesting GPS...");
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => setLocationStr(`Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`),
         () => setLocationStr("Location Blocked - Type Manually")
       );
    } else {
       setLocationStr("Current Location (Simulated)");
    }
  };

  const handleSearch = () => {
    if(!locationStr) return alert("Please enter a location first!");
    setSearchInitiated(true);
    setLoading(true);
    
    // Simulate API Call delay fetching recommendations
    setTimeout(() => {
      setResults([
        {
          id: 1,
          name: `Premium ${category} Spot`,
          price: "$120 / person",
          timing: "9:00 AM - 5:00 PM",
          contact: "+1 800 123 4567 | info@premiumtours.com",
          distance: "2.4 km away",
          image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&fit=crop"
        },
        {
          id: 2,
          name: `Local ${category} Experience`,
          price: "$85 / person",
          timing: "10:00 AM - 6:00 PM",
          contact: "+1 800 987 6543 | contact@localtours.com",
          distance: "4.1 km away",
          image: "https://images.unsplash.com/photo-1504280390467-33afe544be89?w=600&fit=crop"
        },
        {
          id: 3,
          name: `Exclusive VIP ${category}`,
          price: "$200 / person",
          timing: "8:00 AM - 8:00 PM",
          contact: "+1 800 555 0000 | vip@exclusivetours.com",
          distance: "7.8 km away",
          image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&fit=crop"
        }
      ]);
      setLoading(false);
    }, 1500);
  };

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
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">my_location</span>
              <input 
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                type="text" 
                placeholder="Enter city, address or zip code..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-700 dark:text-white font-medium outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleGetCurrentLocation}
              className="px-6 py-4 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-200 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">satellite</span>
              Auto-Detect
            </button>
          </div>
          
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

            {results.map((result) => (
              <div key={result.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-300">
                 <div className="md:w-2/5 lg:w-1/3 h-64 md:h-auto overflow-hidden">
                   <img src={result.image} alt={result.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 </div>
                 <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-2">
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors leading-tight">{result.name}</h3>
                       <span className="px-3 py-1.5 h-fit bg-green-100 text-green-700 font-bold rounded-lg text-sm flex items-center gap-1.5 shrink-0">
                          <span className="material-symbols-outlined text-sm font-bold">payments</span>
                          {result.price}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                       <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined">schedule</span>
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Timings</p>
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{result.timing}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined">map</span>
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Distance</p>
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{result.distance}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3 sm:col-span-2">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined">contact_support</span>
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contact Info</p>
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{result.contact}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-colors shadow-md">
                         View Full Details
                      </button>
                    </div>
                 </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
export default Suggestions;

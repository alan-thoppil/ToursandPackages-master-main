// ══════════════════════════════════════════════════════════
//  Route: GET /api/geocode?q=<place name>
//  Thin proxy around Nominatim so the widget JS
//  doesn't need a CORS workaround in the browser.
// ══════════════════════════════════════════════════════════

import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Missing query param: q" });

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (token) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&limit=5&types=place,locality,address,poi`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length) {
        const results = data.features.map(feat => {
          const [lon, lat] = feat.center;
          return {
            found: true,
            lat,
            lon,
            name: feat.text,
            display_name: feat.place_name,
            secondary: feat.context?.map(c => c.text).join(", ") || ""
          };
        });
        return res.json({ results });
      }
    } catch (err) {
      console.error("Mapbox forward geocode error", err);
    }
  }

  // Fallback to Nominatim
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
  try {
    const response = await fetch(url, { headers: { "User-Agent": "TravelItineraryWidget/1.0" } });
    const data = await response.json();
    if (!data.length) return res.json({ results: [] });
    
    const results = data.map(item => ({
      found: true,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      name: item.display_name.split(',')[0],
      display_name: item.display_name,
      secondary: item.display_name.split(',').slice(1).join(',').trim()
    }));
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (token) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}&limit=1&types=place,locality`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length) {
        const feat = data.features[0];
        const city = feat.text;
        const state = feat.context?.find(c => c.id.startsWith('region'))?.text || "";
        return res.json({ city, display_name: feat.place_name, address: { state } });
      }
    } catch (err) {
      console.error("Mapbox reverse geocode error", err);
    }
  }

  // Fallback to Nominatim
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  try {
    const response = await fetch(url, { headers: { "User-Agent": "TravelItineraryWidget/1.0" } });
    const data = await response.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown";
    res.json({ city, display_name: data.display_name, address: data.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vercel first-party IP geolocation: GET /api/geocode/ip
router.get("/ip", (req, res) => {
  const city = req.headers["x-vercel-ip-city"] || req.headers["x-real-ip-city"];
  const region = req.headers["x-vercel-ip-country-region"];
  const lat = req.headers["x-vercel-ip-latitude"];
  const lon = req.headers["x-vercel-ip-longitude"];
  
  if (city) {
    res.json({ city, region, lat: parseFloat(lat), lon: parseFloat(lon) });
  } else {
    res.status(404).json({ error: "Vercel headers missing or not on edge network" });
  }
});

export default router;

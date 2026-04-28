import { Router } from "express";
import { createLogger } from "../lib/logger.js";

const router = Router();
const log = createLogger("suggestions");

// Category to OpenStreetMap (Overpass) tags mapping
const CATEGORY_MAP = {
  "Stay": 'node["tourism"~"hotel|resort|guest_house|motel"](around:10000,${lat},${lng});',
  "Night Camp": 'node["tourism"="camp_site"](around:15000,${lat},${lng});',
  "Animal Sightseeing": 'node["tourism"~"zoo|aquarium|theme_park"](around:30000,${lat},${lng}); node["leisure"~"nature_reserve|park"](around:30000,${lat},${lng}); node["boundary"="national_park"](around:30000,${lat},${lng});',
  "Nature": 'node["tourism"="viewpoint"](around:15000,${lat},${lng}); node["natural"~"peak|wood|water|beach"](around:15000,${lat},${lng}); node["leisure"~"park|nature_reserve"](around:15000,${lat},${lng});',
  "Hiking": 'node["tourism"="viewpoint"](around:15000,${lat},${lng}); node["natural"="peak"](around:15000,${lat},${lng});',
  "Safari": 'node["leisure"="nature_reserve"](around:25000,${lat},${lng}); node["tourism"="attraction"]["attraction"="animal"](around:25000,${lat},${lng});',
  "Boating": 'node["leisure"~"marina|water_park"](around:15000,${lat},${lng}); node["amenity"="ferry_terminal"](around:15000,${lat},${lng});',
  "Diving": 'node["sport"="diving"](around:20000,${lat},${lng}); node["leisure"="water_park"](around:20000,${lat},${lng});',
  "Food & Wine": 'node["amenity"~"restaurant|bar|pub|wine_bar"](around:10000,${lat},${lng});',
  "Wellness": 'node["leisure"="spa"](around:10000,${lat},${lng}); node["amenity"="massage"](around:10000,${lat},${lng});',
  "Culture": 'node["tourism"~"museum|artwork|gallery"](around:10000,${lat},${lng}); node["amenity"~"place_of_worship|arts_centre|theatre|community_centre"](around:10000,${lat},${lng}); node["historic"~"monument|memorial|ruins|castle"](around:10000,${lat},${lng});'
};

router.post("/", async (req, res) => {
  const { lat, lng, category } = req.body;

  if (!lat || !lng || !category) {
    return res.status(400).json({ error: "Missing lat, lng, or category" });
  }

  log.info(`Fetching OSM suggestions for ${category} at ${lat}, ${lng}`);

  try {
    // 1. Fetch from OpenStreetMap (Ultra-Fast Search)
    const queryTag = CATEGORY_MAP[category] || 'node["tourism"="attraction"](around:10000,${lat},${lng});';
    const rawQuery = queryTag.replace(/\$\{lat\}/g, lat).replace(/\$\{lng\}/g, lng);
    const overpassQuery = `[out:json][timeout:5];(${rawQuery});out 12;`; 

    const otmUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    
    log.debug(`Speed-Fetching OSM: ${category}`);
    const otmRes = await fetch(otmUrl, { headers: { "User-Agent": "TravelItineraryWidget/1.0" } });

    if (!otmRes.ok) throw new Error("Map API slow");

    const otmData = await otmRes.json();
    const places = (otmData.elements || [])
        .filter(e => e.tags && e.tags.name)
        .map(e => ({
            name: e.tags.name,
            kinds: e.tags.tourism || e.tags.amenity || e.tags.leisure || e.tags.natural || "spot",
            lat: e.lat,
            lon: e.lon
        }));

    if (!places.length) return res.json({ suggestions: [] });

    // 2. Curate with AI (NVIDIA NIM - Ultra-Fast 8B Model)
    const prompt = `Pick 5 best ${category} from this list:
${places.slice(0, 10).map(p => `- ${p.name} (Type: ${p.kinds}, Lat: ${p.lat}, Lng: ${p.lon})`).join("\n")}

Return ONLY JSON: [{"name": "...", "rating": 4.5, "reason": "...", "lat": 1.2, "lng": 3.4}]`;

    const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 300
      })
    });

    if (!aiRes.ok) {
        const aiErr = await aiRes.json().catch(() => ({}));
        throw new Error(`NVIDIA API failed: ${aiErr.error?.message || aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    const aiText = aiData.choices[0].message.content.trim();
    
    log.debug("AI Response received from NVIDIA", { aiText });

    let suggestions = [];
    try {
      const jsonMatch = aiText.match(/\[.*\]/s);
      suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch (e) {
      log.error("Failed to parse AI response as JSON", { aiText });
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    res.json({ suggestions });

  } catch (error) {
    log.error("Suggestions error", { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;

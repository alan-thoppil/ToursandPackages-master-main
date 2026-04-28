import { Router } from "express";
import { createLogger } from "../lib/logger.js";

const router = Router();
const log = createLogger("suggestions");

// Category to OpenStreetMap (Overpass) tags mapping
const CATEGORY_MAP = {
  "Stay": 'node["tourism"~"hotel|resort|guest_house|hostel|apartment|villa"](around:25000,${lat},${lng}); way["tourism"~"hotel|resort"](around:25000,${lat},${lng});',
  "Animal Sightseeing": 'node["tourism"~"zoo|wildlife_park"](around:50000,${lat},${lng}); node["leisure"~"nature_reserve|park"]["name"~"Eco|Ecopark"](around:50000,${lat},${lng}); node["leisure"="nature_reserve"](around:50000,${lat},${lng}); node["boundary"="national_park"](around:50000,${lat},${lng}); node["amenity"="elephant_camp"](around:50000,${lat},${lng}); node["tourism"="attraction"]["attraction"~"animal|wildlife"](around:50000,${lat},${lng});',
  "Nature": 'node["tourism"="viewpoint"](around:25000,${lat},${lng}); node["natural"~"peak|wood|water|beach|waterfall|river"](around:25000,${lat},${lng}); node["leisure"~"park|nature_reserve|garden"](around:25000,${lat},${lng});',
  "Night Camp": 'node["tourism"~"camp_site|caravan_site|resort"](around:35000,${lat},${lng}); node["amenity"="shelter"]["shelter_type"~"mountain_hut|tent_site"](around:35000,${lat},${lng});',
  "Hiking": 'node["tourism"="viewpoint"](around:25000,${lat},${lng}); node["natural"~"peak|volcano"](around:25000,${lat},${lng}); way["highway"~"path|track"](around:25000,${lat},${lng});',
  "Safari": 'node["leisure"="nature_reserve"](around:50000,${lat},${lng}); node["tourism"~"attraction|theme_park"](around:50000,${lat},${lng}); node["boundary"="national_park"](around:50000,${lat},${lng});',
  "Culture": 'node["tourism"~"museum|artwork|gallery"](around:20000,${lat},${lng}); node["amenity"~"arts_centre|theatre"](around:20000,${lat},${lng}); node["historic"~"monument|memorial|ruins|castle|fort|palace|archaeological_site"](around:20000,${lat},${lng});',
  "Boating": 'node["leisure"~"marina|water_park"](around:25000,${lat},${lng}); node["amenity"~"ferry_terminal|boat_rental"](around:25000,${lat},${lng}); node["natural"="water"](around:25000,${lat},${lng});',
  "Diving": 'node["sport"~"diving|scuba"](around:40000,${lat},${lng}); node["leisure"="water_park"](around:40000,${lat},${lng}); node["natural"="reef"](around:40000,${lat},${lng});',
  "Food & Wine": 'node["amenity"~"restaurant|bar|pub|wine_bar|cafe|fast_food"](around:15000,${lat},${lng});',
  "Wellness": 'node["leisure"~"spa|sauna"](around:20000,${lat},${lng}); node["amenity"~"massage|clinic|yoga_studio"](around:20000,${lat},${lng});'
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
    const overpassQuery = `[out:json][timeout:10];(${rawQuery});out 20;`; 

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
            lng: e.lon
        }));

    if (!places.length) return res.json({ suggestions: [] });

    // 2. Curate with AI (NVIDIA NIM - Ultra-Fast 8B Model)
    const prompt = `You are a premium travel curator. Your goal is to pick EXACTLY 5 BEST spots for the category "${category}" from the list below, focusing on their unique FEATURES and quality.
List of potential spots from OpenStreetMap:
${places.slice(0, 20).map(p => `- ${p.name} (Type: ${p.kinds}, Lat: ${p.lat}, Lng: ${p.lng})`).join("\n")}

CRITICAL RULES:
1. SELECT THE BEST: Prioritize the most famous, scenic, or feature-rich locations (e.g., luxury resorts, glamping sites, rare wildlife spots, or fine dining).
2. COUNT: You MUST return exactly 5 objects in the array.
3. NO DUPLICATES: Every spot in the list MUST be a unique location. Never repeat the same name.
4. HIGHLIGHT FEATURES: In your "reason" field, mention specific features that make the spot stand out.
5. RELEVANCE: Only pick spots that perfectly fit the "${category}" theme.
   - For "Animal Sightseeing": DISCARD dams, reservoirs, water tanks, generic parks, or aquariums.
   - For "Culture": DISCARD religious sites. Focus on secular heritage.
   - For "Food & Wine": Include a mix of restaurants and bars/pubs where available.
   - For all: Discard generic or irrelevant utility spots.
6. COORDINATE INTEGRITY: You MUST use the exact Lat and Lng provided in the list.
7. Response MUST be a valid JSON array.

Format: [{"name": "...", "rating": 4.9, "reason": "...", "lat": 1.2, "lng": 3.4}, ...]`;

    const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "system", content: "You are a travel assistant that returns ONLY JSON arrays of exactly 5 items." }, { role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!aiRes.ok) {
        const aiErr = await aiRes.json().catch(() => ({}));
        throw new Error(`NVIDIA API failed: ${aiErr.error?.message || aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    let aiText = aiData.choices[0].message.content.trim();
    
    log.debug("AI Response received", { aiText });

    let suggestions = [];
    try {
      const arrayMatch = aiText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        suggestions = JSON.parse(arrayMatch[0]);
      } else {
        const fixedText = "[" + aiText.replace(/\}\s*\{/g, "},{") + "]";
        suggestions = JSON.parse(fixedText);
      }
    } catch (e) {
      log.error("Final JSON parse failed", { aiText, error: e.message });
      suggestions = places.slice(0, 5).map(p => ({
        ...p,
        rating: 4.0,
        reason: "Recommended based on local popularity."
      }));
    }

    // ── STRIKE DUPLICATES ──────────────────────────────────
    // Deduplicate by name (case-insensitive)
    const seen = new Set();
    suggestions = suggestions.filter(s => {
      const slug = s.name.toLowerCase().trim();
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });

    // Ensure we return at least 5 if possible, even if AI was lazy or deduplicated
    if (suggestions.length < 5 && places.length >= 5) {
       const extra = places.filter(p => {
         const slug = p.name.toLowerCase().trim();
         return !seen.has(slug);
       }).slice(0, 5 - suggestions.length);
       
       suggestions = [
         ...suggestions, 
         ...extra.map(p => ({ ...p, rating: 4.0, reason: "Highly rated local spot." }))
       ];
    }

    res.json({ suggestions: suggestions.slice(0, 5) });

  } catch (error) {
    log.error("Suggestions error", { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;

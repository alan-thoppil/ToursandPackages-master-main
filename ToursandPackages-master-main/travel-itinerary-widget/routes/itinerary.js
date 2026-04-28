// ═══════════════════════════════════════════════════════════
//  Route: POST /api/itinerary
//  Orchestrates: Geocode → Overpass POIs → OSRM → AI
//  FREE: Groq/NVIDIA free tiers
// ═══════════════════════════════════════════════════════════

import { Router } from "express";
import { cachedGeocode, cachedPOIs, cachedTravelTime, usageTracker } from "../lib/cache.js";
import { createLogger } from "../lib/logger.js";

const router = Router();
const log    = createLogger("itinerary");

// ── AI call (pure fetch, zero SDK needed) ──────────────
const GROQ_MODEL   = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";

async function callAI(prompt) {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;
  
  let url, key, model;

  if (nvidiaKey) {
    url = "https://integrate.api.nvidia.com/v1/chat/completions";
    key = nvidiaKey;
    model = NVIDIA_MODEL;
    log.debug("Using NVIDIA NIM API", { model });
  } else if (groqKey) {
    url = "https://api.groq.com/openai/v1/chat/completions";
    key = groqKey;
    model = GROQ_MODEL;
    log.debug("Using Groq API", { model });
  } else {
    log.error("AI API Key is missing");
    throw new Error("Neither NVIDIA_API_KEY nor GROQ_API_KEY is set in .env");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${key}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model:       model,
        temperature: 0.7,
        max_tokens:  3500,
        response_format: { type: "json_object" },
        messages: [
          {
            role:    "system",
            content: "You are an expert local travel guide. You specialization is in LUXURY and PREMIUM travel. You always include at least one resort or hotel recommendation in every plan. You correctly identify and highlight VEG vs NON-VEG food options. Always respond with a single valid JSON object — no markdown, no explanation text.",
          },
          {
            role:    "user",
            content: prompt,
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      log.error("AI API error", { status: res.status, error: err.error?.message || res.statusText });
      
      if (res.status === 429) {
        throw new Error("AI provider rate limit hit — please wait a minute or upgrade your plan.");
      }
      throw new Error(`AI API error ${res.status}: ${err?.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      log.error("Empty response from AI", { data });
      throw new Error("Empty response from AI provider");
    }
    return text;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("AI generation timed out (120s). Please try again.");
    }
    throw err;
  }
}

// ── Raw API helpers (passed into cache wrappers) ─────────────

async function _geocode(query, bbox = null) {
  let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  if (bbox) {
    // bbox is [minX, minY, maxX, maxY]
    // Nominatim viewbox is <left>,<top>,<right>,<bottom> i.e. <minLon>,<maxLat>,<maxLon>,<minLat>
    url += `&viewbox=${bbox[0]},${bbox[3]},${bbox[2]},${bbox[1]}&bounded=1`;
  }
  const res = await fetch(url, { headers: { "User-Agent": "TravelItineraryWidget/1.0" } });
  const data = await res.json();
  if (!data.length) {
    // If bounded fails, try unbounded
    if (bbox) return _geocode(query, null);
    return null;
  }
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function _fetchPOIs(lat, lon) {
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="restaurant"](around:5000,${lat},${lon});
      node["amenity"="cafe"](around:4000,${lat},${lon});
      node["tourism"="attraction"](around:6000,${lat},${lon});
      node["leisure"="park"](around:5000,${lat},${lon});
      node["tourism"="museum"](around:6000,${lat},${lon});
      node["amenity"="place_of_worship"](around:5000,${lat},${lon});
      node["tourism"="viewpoint"](around:6000,${lat},${lon});
      node["leisure"="beach"](around:6000,${lat},${lon});
      node["tourism"="hotel"](around:8000,${lat},${lon});
      node["tourism"="resort"](around:8000,${lat},${lon});
    );
    out body;
  `.trim();

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.elements || [])
    .filter((e) => e.tags?.name && e.tags.name.length > 1)
    .slice(0, 25)
    .map((e) => ({
      name:    e.tags.name,
      type:    e.tags.amenity || e.tags.tourism || e.tags.leisure || "place",
      hours:   e.tags.opening_hours || "",
      cuisine: e.tags.cuisine || "",
      lat:     e.lat,
      lon:     e.lon,
    }));
}

async function _getTravelMinutes(lat1, lon1, lat2, lon2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) return 30;
  const data = await res.json();
  return Math.ceil((data.routes?.[0]?.duration || 1800) / 60);
}

// ── Weather helper (Open-Meteo - Free) ───────────────────────

async function _fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) return null;
    
    // Simple mapping for AI
    const codes = { 0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast", 45: "Foggy", 51: "Drizzle", 61: "Rainy", 71: "Snowy", 95: "Thunderstorm" };
    return {
      temp: cw.temperature,
      condition: codes[cw.weathercode] || "Variable",
      wind: cw.windspeed
    };
  } catch (e) {
    return null;
  }
}

// ── Time utilities ───────────────────────────────────────────

function subtractMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total  = Math.max(0, h * 60 + m - mins);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ── Prompt builder ───────────────────────────────────────────

function buildPrompt({ 
  dest, arrPt, depPt, arrTime, depTime, interests, dietaryPreference, 
  pois, travelMins, arrCoords, depCoords, 
  budgetTier, travelGroup, groupSize, transportMode, weatherAdaptive, customStops,
  weatherData, cityCenterCoords, arrivalDate, departureDate
}) {
  const buffer  = travelMins + 25;
  const leaveBy = subtractMinutes(depTime, buffer);

  const weatherContext = weatherData 
    ? `CURRENT WEATHER: ${weatherData.condition}, ${weatherData.temp}°C. ${weatherAdaptive ? "CRITICAL: Adjust itinerary to avoid bad weather if necessary." : ""}` 
    : '';

  const poisBlock =
    pois.length > 0
      ? pois.map((p) =>
          `• ${p.name} [Coords: ${p.lat}, ${p.lon}] (${p.type}${p.cuisine ? " / " + p.cuisine : ""}${p.hours ? " | hrs: " + p.hours : ""})`
        ).join("\n")
      : `(No OSM data — use your knowledge of famous local spots in ${dest})`;

  const customStopsBlock = customStops && customStops.length > 0
    ? `USER'S MUST-VISIT LOCATIONS (Incorporate these into the sequence):\n${customStops.map(s => {
        if (typeof s === 'object') {
          return `- ${s.name} [Coords: ${s.lat}, ${s.lon}]`;
        }
        return `- ${s}`;
      }).join('\n')}`
    : '';

  return {
    leaveBy,
    prompt: `You are an expert local travel guide with deep knowledge of ${dest}.
${weatherContext}

TRIP BRIEF:
- Destination  : ${dest}
- Budget Tier  : ${budgetTier} (LOW=Economical, MID=Balanced, HIGH=Luxury/Premium)
- Travel Group : ${travelGroup} (${groupSize} person(s))
- Mode         : Preferred transport is ${transportMode}
- Arrival      : ${arrTime} on ${arrivalDate || 'today'} at "${arrPt}" [Fixed Coords: ${arrCoords ? arrCoords.lat + ',' + arrCoords.lon : 'unknown'}]
- Departure    : ${depTime} on ${departureDate || 'today'} from "${depPt}" [Fixed Coords: ${depCoords ? depCoords.lat + ',' + depCoords.lon : 'unknown'}]
- Interests    : ${interests.join(", ")}
- Dietary      : ${dietaryPreference === 'veg' ? 'STRICT VEGETARIAN' : 'NON-VEGETARIAN'}

${customStopsBlock}

REAL LOCAL PLACES (OpenStreetMap data):
${poisBlock}

RULES:
1. Build a complete day itinerary from ${arrTime} to ${leaveBy}.
2. BUDGET ALIGNMENT: Select venues (restaurants, activities, resorts) that match the ${budgetTier} budget tier.
3. GROUP SIZE: Ensure recommended places can accommodate ${groupSize} people comfortably.
4. TRANSPORT MODE: Calculate "getting_there" times assuming travel by ${transportMode}.
5. MUST-VISIT: You MUST include all locations from the "USER'S MUST-VISIT LOCATIONS" list in the itinerary.
6. GEOGRAPHICAL CLUSTERING: Minimize travel distance. Ensure the sequence makes geographical sense.
7. The FIRST item MUST be the Arrival at ${arrTime}: "${arrPt}". Use coordinates: lat: ${arrCoords?.lat || cityCenterCoords?.lat || 0}, lon: ${arrCoords?.lon || cityCenterCoords?.lon || 0}.
8. The FINAL item MUST be travel to "${depPt}" at ${leaveBy}. Use coordinates: lat: ${depCoords?.lat || cityCenterCoords?.lat || 0}, lon: ${depCoords?.lon || cityCenterCoords?.lon || 0}.
9. For each item, MUST include "lat" and "lon" coordinates. 
10. Photo queries MUST be specific to ${dest} and the place name.
11. If ${budgetTier} is HIGH, include at least one EXOTIC/STYLISH/PREMIUM resort or hotel.
12. GEOGRAPHICAL CONSTRAINTS: If ${dest} is landlocked but sea travel is implied, or if a specific hub is missing, automatically identify and suggest the NEAREST valid transit hub (e.g., nearest seaport or airport) and adjust the route accordingly.
13. Ensure the departure_alert says: "Leave by ${leaveBy}. Allow ${travelMins} min to reach ${depPt} by ${depTime}."
14. PROVIDE EXTRA SUGGESTIONS for outfit, etiquette, safety, photography, and alternatives in the final object.
15. COMPREHENSIVENESS: Your itinerary MUST contain a minimum of 10 distinct stops/items. This is a STRICT requirement for a premium experience.
16. The items array MUST BEGIN with the arrival point and MUST END with the departure point. Do not skip either.

Return this exact JSON structure:
{
  "city": "${dest}",
  "tagline": "one poetic line about the city",
  "weather_tip": "specific advice for today's forecast",
  "cost_estimate": "estimated range in INR for ${groupSize} people",
  "departure_alert": "leave by message",
  "items": [
    {
      "time": "HH:MM",
      "end_time": "HH:MM",
      "title": "place name",
      "subtitle": "street or neighbourhood",
      "description": "2 vivid sentences",
      "category": "breakfast|coffee|attraction|activity|lunch|dinner|shopping|beach|temple|museum|transport|departure",
      "must_try": "one specific thing to try",
      "tip": "one insider tip",
      "getting_there": "${transportMode} | INR cost | minutes",
      "cost": "INR range or Free",
      "lat": 0.0,
      "lon": 0.0,
      "photo_query": "search term"
    }
  ],
  "extra_suggestions": {
    "outfit": "what to wear based on weather and culture",
    "etiquette": "local customs or phrases to know",
    "safety": "specific safety advice for this location",
    "photography": "best time or angle for photos",
    "alternatives": "one or two backup options if places are crowded or closed",
    "hidden_gems": "2-3 off-the-beaten-path locations not in the main itinerary",
    "local_phrases": "3-4 essential local words or phrases with translations",
    "travel_logistics": "specific advice on local transport apps, ticketing, or hacks"
  }
}`,
  };
}

// ── Route handler ─────────────────────────────────────────────

router.post("/", async (req, res) => {
  const { 
    dest, arrivalPoint, departurePoint, arrivalTime, departureTime, 
    arrivalDate, departureDate,
    interests, dietaryPreference, 
    travelStatus, budgetTier, travelGroup, groupSize, transportMode, weatherAdaptive, customStops,
    userLat, userLon 
  } = req.body;

  const reqId = Math.random().toString(36).slice(2, 8);
  log.info("Request received", { reqId, dest, arrivalTime, departureTime });
  const t0 = Date.now();
  let cityCenterCoords = null;

  try {
    // Step 1: Geocode destination (cached 6h)
    let cityBbox = null;
    cityCenterCoords = await cachedGeocode(dest, async (q) => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "TravelItineraryWidget/1.0" } });
      const data = await res.json();
      if (!data.length) return null;
      const feat = data[0];
      if (feat.boundingbox) cityBbox = [feat.boundingbox[2], feat.boundingbox[0], feat.boundingbox[3], feat.boundingbox[1]]; // lon min, lat min, lon max, lat max
      return { lat: parseFloat(feat.lat), lon: parseFloat(feat.lon), bbox: cityBbox };
    }).catch(() => null);

    if (cityCenterCoords && cityCenterCoords.bbox) cityBbox = cityCenterCoords.bbox;

    if (!cityCenterCoords) {
      log.warn("City geocoding failed", { dest, reqId });
      return res.status(400).json({ error: `We couldn't find coordinates for "${dest}". Please try a more specific name (e.g., "Mysuru, Karnataka").` });
    }

    // Step 2: POIs + travel time in parallel (both cached)
    let arrCoords = null;
    let depCoords = null;

    const [pois, travelMins] = await Promise.all([
      cityCenterCoords
        ? cachedPOIs(cityCenterCoords.lat, cityCenterCoords.lon, _fetchPOIs).catch(() => [])
        : Promise.resolve([]),

      (async () => {
        if (!cityCenterCoords) return 30;
        
        // If LOCAL mode, use user's current GPS coords if available
        if (travelStatus === "LOCAL" && userLat && userLon) {
          arrCoords = { lat: parseFloat(userLat), lon: parseFloat(userLon) };
          depCoords = await cachedGeocode(`${departurePoint}, ${dest}`, (q, prox) => _geocode(q, prox, cityBbox), cityCenterCoords)
            .catch(() => null);
          if (!depCoords) {
             depCoords = await cachedGeocode(departurePoint, (q) => _geocode(q, null, null)).catch(() => null);
          }
          if (!depCoords && departurePoint.includes(',')) {
             const shortName = departurePoint.split(',')[0].trim();
             depCoords = await cachedGeocode(`${shortName}, ${dest}`, (q) => _geocode(q, null, null)).catch(() => null);
             if (!depCoords) depCoords = await cachedGeocode(shortName, (q) => _geocode(q, null, null)).catch(() => null);
          }
        } else {
          // Geocode Arrival and Departure points for accurate itinerary framing
          [arrCoords, depCoords] = await Promise.all([
            (async () => {
              let coords = await cachedGeocode(`${arrivalPoint}, ${dest}`, (q) => _geocode(q, cityBbox), cityCenterCoords).catch(() => null);
              if (!coords) coords = await cachedGeocode(arrivalPoint, (q) => _geocode(q, null)).catch(() => null);
              if (!coords && arrivalPoint.includes(',')) {
                const shortName = arrivalPoint.split(',')[0].trim();
                coords = await cachedGeocode(`${shortName}, ${dest}`, (q) => _geocode(q, cityBbox), cityCenterCoords).catch(() => null);
                if (!coords) coords = await cachedGeocode(shortName, (q) => _geocode(q, null)).catch(() => null);
              }
              return coords;
            })(),
            (async () => {
              let coords = await cachedGeocode(`${departurePoint}, ${dest}`, (q) => _geocode(q, cityBbox), cityCenterCoords).catch(() => null);
              if (!coords) coords = await cachedGeocode(departurePoint, (q) => _geocode(q, null)).catch(() => null);
              if (!coords && departurePoint.includes(',')) {
                const shortName = departurePoint.split(',')[0].trim();
                coords = await cachedGeocode(`${shortName}, ${dest}`, (q) => _geocode(q, cityBbox), cityCenterCoords).catch(() => null);
                if (!coords) coords = await cachedGeocode(shortName, (q) => _geocode(q, null)).catch(() => null);
              }
              return coords;
            })()
          ]);
        }

        if (!arrCoords) {
          throw new Error(`Invalid Arrival Point: "${arrivalPoint}". Please enter a valid location.`);
        }
        if (!depCoords) {
          throw new Error(`Invalid Departure Point: "${departurePoint}". Please enter a valid location.`);
        }

        return cachedTravelTime(
          cityCenterCoords.lat, cityCenterCoords.lon,
          depCoords.lat, depCoords.lon,
          _getTravelMinutes
        ).catch(() => 30);
      })(),
    ]);

    let weatherData = null;
    if (cityCenterCoords && (weatherAdaptive || weatherAdaptive === 'true')) {
      weatherData = await _fetchWeather(cityCenterCoords.lat, cityCenterCoords.lon);
    }

    // Geocode custom stops for high precision
    let geocodedCustomStops = customStops || [];
    if (customStops && customStops.length > 0) {
      geocodedCustomStops = await Promise.all(customStops.map(async (stopName) => {
        if (!stopName.trim()) return stopName;
        try {
          const query = `${stopName}, ${dest}`;
          const coords = await cachedGeocode(query, (q, prox) => _geocode(q, prox, cityBbox), cityCenterCoords)
            .catch(() => cachedGeocode(stopName, (q) => _geocode(q, null, null)));
          if (coords) return { name: stopName, lat: coords.lat, lon: coords.lon };
        } catch(e) {}
        return stopName;
      }));
    }

    log.debug("Data gathered", { reqId, poisCount: pois.length, travelMins, arrCoords, depCoords, hasWeather: !!weatherData });

    // Step 3: Build prompt → call Groq
    const { leaveBy, prompt } = buildPrompt({
      dest,
      arrPt:   arrivalPoint,
      depPt:   departurePoint,
      arrTime: arrivalTime,
      depTime: departureTime,
      interests,
      dietaryPreference,
      pois,
      travelMins,
      arrCoords,
      depCoords,
      budgetTier,
      travelGroup,
      groupSize,
      transportMode,
      weatherAdaptive,
      customStops: geocodedCustomStops,
      weatherData,
      cityCenterCoords,
      arrivalDate,
      departureDate
    });

    log.debug("Calling AI provider");
    const rawText = await callAI(prompt);
    console.log("--- RAW AI RESPONSE ---", rawText);

    // Step 4: Parse
    let itinerary;
    try {
      itinerary = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      log.error("AI returned malformed JSON", { reqId, preview: rawText.slice(0, 200) });
      return res.status(500).json({ error: "AI returned malformed response — please retry." });
    }
    console.log("--- PARSED ITINERARY ---", itinerary);

    // Step 4.5: Ensure Frame Points (Arrival/Departure) are present
    if (itinerary.items && itinerary.items.length > 0) {
      const first = itinerary.items[0];
      const last = itinerary.items[itinerary.items.length - 1];

      // If last item isn't the departure point, append it
      if (!last.title.toLowerCase().includes(departurePoint.split(',')[0].toLowerCase()) && 
          last.category !== 'departure') {
        itinerary.items.push({
          time: leaveBy,
          end_time: departureTime,
          title: departurePoint,
          subtitle: dest,
          description: `Arrival at ${departurePoint} for your departure.`,
          category: 'departure',
          must_try: 'Check in and relax before your journey.',
          tip: 'Have your tickets and ID ready.',
          getting_there: `${transportMode} | ${travelMins} min`,
          cost: 'Free',
          lat: depCoords.lat,
          lon: depCoords.lon,
          photo_query: `${departurePoint} ${dest}`
        });
      }
    }

    // Step 5: High-Precision Verification (Verify every stop with Nominatim)
    log.debug("Verifying stop coordinates with OSM", { reqId });
    const verifiedItems = await Promise.all((itinerary.items || []).map(async (item, idx, array) => {
      // RULE: Always use precise geocoded arrival/departure coords for the frame
      if (idx === 0) {
        return { ...item, lat: arrCoords.lat, lon: arrCoords.lon };
      }
      if (idx === array.length - 1) {
        return { ...item, lat: depCoords.lat, lon: depCoords.lon };
      }

      const query = `${item.title}, ${dest}`;
      try {
        const realCoords = await cachedGeocode(query, (q) => _geocode(q, cityBbox), cityCenterCoords);
        if (realCoords && cityCenterCoords) {
          const dist = Math.sqrt(Math.pow(realCoords.lat - cityCenterCoords.lat, 2) + Math.pow(realCoords.lon - cityCenterCoords.lon, 2));
          if (dist < 0.00001) return item; 
          return { ...item, lat: realCoords.lat, lon: realCoords.lon };
        }
      } catch (e) { log.warn(`Coord verification failed for ${item.title}`, e); }
      return item; 
    }));
    itinerary.items = verifiedItems;

    // MANDATORY SAFETY SNAP: Prevent any pin from landing in the ocean
    itinerary.items = (itinerary.items || []).map(item => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      if (!lat || !lon || (Math.abs(lat) < 0.1 && Math.abs(lon) < 0.1)) {
        return { ...item, lat: cityCenterCoords?.lat || 0, lon: cityCenterCoords?.lon || 0 };
      }
      return item;
    });

    itinerary._meta = {
      poisFound:           pois.length,
      travelMinsToStation: travelMins,
      leaveBy,
      durationMs:          Date.now() - t0,
      generatedAt:         new Date().toISOString(),
      model:               "AI Provider"
    };

    log.info("Itinerary generated", {
      reqId, city: itinerary.city,
      stops: itinerary.items?.length,
      ms: itinerary._meta.durationMs,
    });

    res.json({ success: true, itinerary });

  } catch (err) {
    log.error("Error", { reqId, err: err.message });
    res.status(500).json({ error: err.message || "Failed to generate itinerary" });
  }
});

export default router;

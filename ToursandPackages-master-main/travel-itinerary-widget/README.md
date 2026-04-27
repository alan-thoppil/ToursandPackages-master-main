# ✈️ Travel Itinerary Widget

AI-powered day planner for modern travelers. Drop a few lines into any website to give your users a premium itinerary experience.

---

## What it does

A traveler arrives in a city (or is already there) and needs a plan.
They open your website — this widget:

1. **Detects GPS** via the browser for "I'm Already Here" mode.
2. Accepts arrival/departure points, times, and interests.
3. Your Node.js server orchestrates:
   - **Nominatim** → High-precision geocoding for the destination and transit hubs.
   - **Overpass API** → Real restaurants, landmarks, and resorts from OpenStreetMap.
   - **OSRM** → Real road travel time to ensure you reach your departure on time.
   - **Groq AI (Llama 3.3)** → Crafts a vivid, time-mapped itinerary tailored to budget and group size.
4. Renders an **animated timeline** — every stop with time window, vivid description, must-try, insider tip, transport info, and cost.
5. **Departure alert** pinned at the top — "Leave by 18:10" to avoid missing your transport.

---

## File Structure

```
travel-itinerary-widget/
├── server.js               ← Standalone Express server
├── embed.js                ← Mount into an EXISTING Express app
├── package.json
├── .env                    ← Your API Keys (Groq)
├── test.js                 ← CLI test runner
│
├── routes/
│   ├── itinerary.js        ← Geocode → POIs → OSRM → Groq AI
│   └── geocode.js          ← Geocoding proxy
│
├── middleware/
│   └── validate.js         ← Input validation
│
├── lib/
│   ├── cache.js            ← In-memory TTL cache (geo/POI/route)
│   └── logger.js           ← Structured logger
│
└── public/
    ├── itinerary-widget.js ← The drop-in frontend script
    └── demo.html           ← Live demo page
```

---

## Quick Start (Standalone)

```bash
# 1. Install
npm install

# 2. Configure
# Create a .env file and add:
GROQ_API_KEY=gsk_xxx

# 3. Start
npm start

# 4. Open demo
# → http://localhost:3001/demo
```

### Embed on any page (2 lines)

```html
<div id="itinerary-widget"></div>

<script
  src="https://yourserver.com/widget/itinerary-widget.js"
  data-api-base="https://yourserver.com"
  data-target="#itinerary-widget">
</script>
```

---

## Plug into an Existing Express App

Use `embed.js` instead of running `server.js` separately:

```js
// In your existing app.js / server.js
import express from "express";
import { mountWidget } from "./travel-itinerary-widget/embed.js";

const app = express();

// Your existing routes...
app.get("/", (req, res) => res.send("My website"));

// Mount the widget (5 lines)
mountWidget(app, {
  apiPrefix:    "/api/travel",   // default
  staticPrefix: "/widget",       // default
  rateLimit:    20,              // requests/IP/15min
});

app.listen(3000);
```

Then in your HTML:

```html
<div id="trip-planner"></div>
<script
  src="/widget/itinerary-widget.js"
  data-api-base="https://mysite.com"
  data-target="#trip-planner">
</script>
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/itinerary` | Generate day itinerary |
| `GET`  | `/api/geocode?q=place` | Forward geocode |
| `GET`  | `/api/geocode/reverse?lat=X&lon=Y` | Reverse geocode |
| `GET`  | `/api/health` | Health + cache stats |

### POST /api/itinerary

**Request Body Example:**
```json
{
  "dest": "Kozhikode, Kerala",
  "arrivalPoint": "Kozhikode Railway Station",
  "departurePoint": "Kozhikode Railway Station",
  "arrivalTime": "09:00",
  "departureTime": "19:00",
  "interests": ["food", "culture", "beaches"],
  "budgetTier": "MID",
  "travelGroup": "Family",
  "groupSize": 4,
  "transportMode": "Car"
}
```

---

## Running Tests

```bash
# Start the server first
npm start

# In another terminal:
npm test            # all suites
node test.js health    # health suite only
node test.js geocode   # geocode suite only
node test.js validation  # validation suite only
node test.js itinerary  # full Groq call
```

---

## Caching

Geocoding, POI, and routing results are cached in memory (TTL: 6 hours for geo/POI, 1 hour for routes). This means:

- Repeat requests for the same city are ~1–2s faster
- Third-party free APIs are not hammered unnecessarily
- Cache stats exposed at `GET /api/health`

Itinerary results from Groq are **not cached** — each call is unique creative output.

---

## Environment Variables

```env
GROQ_API_KEY=gsk_xxx             # Required (get at console.groq.com)
PORT=3001                        # Default: 3001
GROQ_MODEL=llama-3.3-70b-versatile
RATE_LIMIT=20                   # req/IP/15min
LOG_LEVEL=info                  # debug|info|warn|error
NODE_ENV=production             # switches to JSON log output
```

---

## Requirements

- **Node.js ≥ 18.0.0** (native `fetch` — no `node-fetch` needed)
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)

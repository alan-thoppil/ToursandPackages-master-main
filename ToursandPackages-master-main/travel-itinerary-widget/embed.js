// ═══════════════════════════════════════════════════════════
//  embed.js — Mount the widget into an EXISTING Express app
//
//  If you already have an Express server, import this instead
//  of running server.js separately.
//
//  Usage in your existing app.js / server.js:
//
//    import { mountWidget } from "./travel-itinerary-widget/embed.js";
//    mountWidget(app, { apiPrefix: "/travel", staticPrefix: "/widget" });
//
//  Then in your HTML:
//    <div id="itinerary-widget"></div>
//    <script
//      src="/widget/itinerary-widget.js"
//      data-api-base=""
//      data-target="#itinerary-widget">
//    </script>
// ═══════════════════════════════════════════════════════════

import "dotenv/config";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";

import itineraryRouter from "./routes/itinerary.js";
import geocodeRouter   from "./routes/geocode.js";
import { validateItinerary } from "./middleware/validate.js";
import { cache } from "./lib/cache.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Mount the travel itinerary widget onto an existing Express app.
 *
 * @param {import('express').Application} app - your existing express app
 * @param {object} options
 * @param {string} [options.apiPrefix="/api/travel"]  - prefix for API routes
 * @param {string} [options.staticPrefix="/widget"]   - prefix for widget JS
 * @param {number} [options.rateLimit=20]             - requests/IP/15min
 */
export function mountWidget(app, options = {}) {
  const {
    apiPrefix    = "/api/travel",
    staticPrefix = "/widget",
    rateLimit: rl = 20,
  } = options;

  // Rate limiter scoped to widget routes only
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      rl,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: "Too many requests — please wait." },
  });

  const widgetRouter = Router();
  widgetRouter.use(limiter);
  widgetRouter.use(express.json({ limit: "16kb" }));

  widgetRouter.post("/itinerary",         validateItinerary, itineraryRouter);
  widgetRouter.use("/geocode",            geocodeRouter);
  widgetRouter.get("/health",  (_req, res) =>
    res.json({ status: "ok", cache: cache.stats() })
  );

  app.use(apiPrefix, widgetRouter);
  app.use(staticPrefix, express.static(join(__dirname, "public")));

  console.log(`[travel-widget] API mounted at    ${apiPrefix}/itinerary`);
  console.log(`[travel-widget] Widget JS at      ${staticPrefix}/itinerary-widget.js`);
  console.log(`[travel-widget] Then embed with:`);
  console.log(`[travel-widget]   data-api-base="<your-origin>"`);
  console.log(`[travel-widget]   src="${staticPrefix}/itinerary-widget.js"`);

  // Return useful values for consumer
  return { apiPrefix, staticPrefix, cache };
}

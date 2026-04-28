// ═══════════════════════════════════════════════════════════════
//  Travel Itinerary Widget — Express Server  (server.js)
//  Drop this folder into any Node.js project and run:
//      node server.js
// ═══════════════════════════════════════════════════════════════

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import itineraryRouter from "./routes/itinerary.js";
import geocodeRouter   from "./routes/geocode.js";
import transportRouter from "./routes/transport.js";
import suggestionsRouter from "./routes/suggestions.js";
import { validateItinerary } from "./middleware/validate.js";
import { requestLogger, cacheStatsHandler, createLogger } from "./lib/logger.js";
import { cache } from "./lib/cache.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3001;
const log  = createLogger("server");

// ── Security headers ──────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy:    false, // Keep flexible for widget embedding
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Custom header for Permissions-Policy to silence compute-pressure warnings
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "compute-pressure=(self)");
  next();
});

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin)                         return cb(null, true);
      if (allowedOrigins.length === 0)     return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      
      // Always allow localhost in dev or if specifically debugging
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return cb(null, true);
      }

      log.warn("CORS blocked", { origin });
      cb(new Error(`CORS: origin ${origin} not permitted`));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT || "300", 10),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many requests — please try again in a few minutes." },
});
app.use("/api/", limiter);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));

// ── Request logger ────────────────────────────────────────────
app.use(requestLogger);

// ── Static widget assets ──────────────────────────────────────
app.use("/widget", express.static(join(__dirname, "public")));

// ── API routes ────────────────────────────────────────────────
app.use("/api/itinerary", validateItinerary, itineraryRouter);
app.use("/api/geocode",   geocodeRouter);
app.use("/api/transport", transportRouter);
app.use("/api/suggestions", suggestionsRouter);

// ── Health + cache stats ──────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status:  "ok",
    widget:  "travel-itinerary-widget",
    version: "1.0.0",
    model:   process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
    cache:   cache.stats(),
  });
});

app.get("/api/cache/stats", cacheStatsHandler(cache));

// ── Demo page ─────────────────────────────────────────────────
app.get("/demo", (_req, res) => {
  res.sendFile(join(__dirname, "public", "demo.html"));
});

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  log.error("Unhandled middleware error", { message: err.message });
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ── Start (only if not running as a Vercel function) ──────────
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    log.info(`Server ready on port ${PORT}`);
    log.info(`Endpoints:`);
    log.info(`  POST /api/itinerary       → generate day plan`);
    log.info(`  POST /api/transport       → generate inter-city transport plan`);
    log.info(`  GET  /api/geocode         → forward geocode`);
    log.info(`  GET  /api/geocode/reverse → reverse geocode`);
    log.info(`  GET  /api/health          → health + cache stats`);
    log.info(`  GET  /demo                → live demo page`);
    log.info(`  GET  /widget/itinerary-widget.js  → drop-in script`);
  });
}

export default app;

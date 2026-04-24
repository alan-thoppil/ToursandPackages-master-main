import fs from "fs";
import path from "path";

const USAGE_FILE = path.join(process.cwd(), "mapbox_usage.json");
const MAX_MAPBOX_REQUESTS = 10000;

class UsageTracker {
  constructor() {
    this._count = 0;
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(USAGE_FILE)) {
        const data = JSON.parse(fs.readFileSync(USAGE_FILE, "utf8"));
        this._count = data.count || 0;
      }
    } catch (err) {
      console.error("Failed to load mapbox usage", err);
    }
  }

  _save() {
    try {
      fs.writeFileSync(USAGE_FILE, JSON.stringify({ count: this._count }), "utf8");
    } catch (err) {
      console.error("Failed to save mapbox usage", err);
    }
  }

  increment() {
    this._count++;
    this._save();
  }

  get count() {
    return this._count;
  }

  get isOverLimit() {
    return this._count >= MAX_MAPBOX_REQUESTS;
  }
}

export const usageTracker = new UsageTracker();

// ═══════════════════════════════════════════════════════════

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

class TTLCache {
  constructor(ttlMs = DEFAULT_TTL_MS, maxSize = 500) {
    this._store  = new Map();
    this._ttl    = ttlMs;
    this._max    = maxSize;
  }

  /** Round coordinate to 3 decimal places for key normalisation (~110m precision) */
  static coordKey(n) {
    return Number(n).toFixed(3);
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this._ttl) {
    // Evict oldest entries when at capacity
    if (this._store.size >= this._max) {
      const firstKey = this._store.keys().next().value;
      this._store.delete(firstKey);
    }
    this._store.set(key, { value, expires: Date.now() + ttlMs });
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this._store.delete(key);
  }

  /** Remove all expired entries (call periodically if needed) */
  purge() {
    const now = Date.now();
    for (const [k, v] of this._store) {
      if (now > v.expires) this._store.delete(k);
    }
  }

  get size() {
    return this._store.size;
  }

  stats() {
    return {
      entries: this._store.size,
      maxSize: this._max,
      ttlHours: this._ttl / 3600000,
    };
  }
}

// Single shared instance across the process
export const cache = new TTLCache();

// ── Cached wrappers ──────────────────────────────────────────

/**
 * Geocode with caching.
 * @param {string} query
 * @param {Function} geocodeFn
 * @returns {Promise<{lat:number,lon:number}|null>}
 */
export async function cachedGeocode(query, geocodeFn, proximity = null) {
  const proxKey = proximity ? `:${TTLCache.coordKey(proximity.lat)}:${TTLCache.coordKey(proximity.lon)}` : "";
  const key = `geo:${query.toLowerCase().trim()}${proxKey}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const result = await geocodeFn(query, proximity);
  if (result) cache.set(key, result);
  return result;
}

/**
 * Fetch POIs with caching (keyed to 3-decimal coords).
 * @param {number} lat
 * @param {number} lon
 * @param {Function} fetchFn
 * @returns {Promise<Array>}
 */
export async function cachedPOIs(lat, lon, fetchFn) {
  const key = `poi:${TTLCache.coordKey(lat)}:${TTLCache.coordKey(lon)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const result = await fetchFn(lat, lon);
  if (result.length) cache.set(key, result);
  return result;
}

/**
 * OSRM travel time with caching.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {Function} routeFn
 * @returns {Promise<number>} minutes
 */
export async function cachedTravelTime(lat1, lon1, lat2, lon2, routeFn) {
  const key = [
    "osrm",
    TTLCache.coordKey(lat1),
    TTLCache.coordKey(lon1),
    TTLCache.coordKey(lat2),
    TTLCache.coordKey(lon2),
  ].join(":");
  const hit = cache.get(key);
  if (hit !== null) return hit;
  const mins = await routeFn(lat1, lon1, lat2, lon2);
  cache.set(key, mins, 60 * 60 * 1000); // 1 hour TTL for routes (traffic shifts)
  return mins;
}

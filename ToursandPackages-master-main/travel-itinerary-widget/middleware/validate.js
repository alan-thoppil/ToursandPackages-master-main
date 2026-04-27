// ═══════════════════════════════════════════════════════════
//  middleware/validate.js
//  Validates and sanitises the POST /api/itinerary body.
//  Returns structured 400 errors before we touch any API.
// ═══════════════════════════════════════════════════════════

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ALLOWED_INTERESTS = new Set([
  "food", "culture", "nature", "shopping", "shop", "photo", "peace",
  "beaches", "adventure", "heritage", "nightlife",
]);

/**
 * Parse "HH:MM" → total minutes since midnight
 */
function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function validateItinerary(req, res, next) {
  const errors = [];
  const body   = req.body || {};

  // ── dest ──────────────────────────────────────────────────
  if (!body.dest || typeof body.dest !== "string") {
    errors.push("dest is required (string)");
  } else if (body.dest.trim().length < 2) {
    errors.push("dest must be at least 2 characters");
  } else if (body.dest.trim().length > 120) {
    errors.push("dest must be 120 characters or fewer");
  }

  // ── arrivalPoint / departurePoint ─────────────────────────
  if (body.arrivalPoint && body.arrivalPoint.length > 160)
    errors.push("arrivalPoint must be 160 characters or fewer");

  if (body.departurePoint && body.departurePoint.length > 160)
    errors.push("departurePoint must be 160 characters or fewer");

  // ── arrivalTime ───────────────────────────────────────────
  if (!body.arrivalTime) {
    errors.push("arrivalTime is required (HH:MM)");
  } else if (!TIME_RE.test(body.arrivalTime)) {
    errors.push("arrivalTime must be in HH:MM format (e.g. 09:00)");
  }

  // ── departureTime ─────────────────────────────────────────
  if (!body.departureTime) {
    errors.push("departureTime is required (HH:MM)");
  } else if (!TIME_RE.test(body.departureTime)) {
    errors.push("departureTime must be in HH:MM format (e.g. 19:00)");
  }

  // ── time window sanity check ──────────────────────────────
  if (
    TIME_RE.test(body.arrivalTime) &&
    TIME_RE.test(body.departureTime)
  ) {
    let arrTotalMins = toMins(body.arrivalTime);
    let depTotalMins = toMins(body.departureTime);

    if (body.arrivalDate && body.departureDate) {
      const arrD = new Date(body.arrivalDate);
      const depD = new Date(body.departureDate);
      const dayDiff = Math.round((depD - arrD) / (1000 * 60 * 60 * 24));
      if (dayDiff > 0) {
        depTotalMins += dayDiff * 24 * 60;
      }
    }

    const gap = depTotalMins - arrTotalMins;
    if (gap < 90) {
      errors.push("You need at least 90 minutes between arrival and departure to plan a meaningful day");
    }
    // We remove the strict 16 hours limit to support multi-day itineraries if dates differ.
    if (gap > 16 * 60 && !(body.arrivalDate && body.departureDate && body.arrivalDate !== body.departureDate)) {
      errors.push("Single-day time window cannot exceed 16 hours");
    }
  }

  // ── interests ─────────────────────────────────────────────
  if (body.interests !== undefined) {
    if (!Array.isArray(body.interests)) {
      errors.push("interests must be an array of strings");
    } else {
      const invalid = body.interests.filter((i) => !ALLOWED_INTERESTS.has(i));
      if (invalid.length) {
        errors.push(`Unknown interest(s): ${invalid.join(", ")}. Allowed: ${[...ALLOWED_INTERESTS].join(", ")}`);
      }
      if (body.interests.length > 8) {
        errors.push("interests array cannot have more than 8 items");
      }
    }
  }

  // ── return errors ─────────────────────────────────────────
  if (errors.length) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // ── sanitise ──────────────────────────────────────────────
  req.body.dest           = body.dest.trim();
  req.body.arrivalPoint   = (body.arrivalPoint   || "").trim() || req.body.dest;
  req.body.departurePoint = (body.departurePoint || "").trim() || req.body.dest;
  req.body.interests      = body.interests || ["food", "culture"];

  next();
}

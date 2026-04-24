#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
//  test.js  — Manual API test runner
//
//  Usage:
//    node test.js                      # all tests
//    node test.js health               # single suite
//    node test.js itinerary            # itinerary suite only
//
//  Requires the server to be running:
//    node server.js
// ═══════════════════════════════════════════════════════════

import "dotenv/config";

const BASE = `http://localhost:${process.env.PORT || 3001}`;
const FILTER = process.argv[2] || null;

// ── Tiny test harness ────────────────────────────────────────

let passed = 0, failed = 0;

function ok(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function suite(name, fn) {
  if (FILTER && !name.toLowerCase().includes(FILTER.toLowerCase())) return;
  console.log(`\n📋 ${name}`);
  try {
    await fn();
  } catch (e) {
    console.log(`  💥 Suite threw: ${e.message}`);
    failed++;
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json();
  return { status: res.status, body };
}

async function post(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const body = await res.json();
  return { status: res.status, body };
}

// ── Suites ───────────────────────────────────────────────────

await suite("Health check", async () => {
  const { status, body } = await get("/api/health");
  ok("returns 200",      status === 200);
  ok("status is ok",     body.status === "ok");
  ok("has model field",  typeof body.model === "string");
  ok("has cache stats",  typeof body.cache === "object");
});

await suite("Geocode — forward", async () => {
  const { status, body } = await get("/api/geocode?q=Kozhikode%2C+Kerala");
  ok("returns 200",   status === 200);
  ok("found=true",    body.found === true);
  ok("has lat",       typeof body.lat === "number");
  ok("has lon",       typeof body.lon === "number");
  ok("lat in range",  body.lat > 8 && body.lat < 14,   `got ${body.lat}`);
});

await suite("Geocode — missing query param", async () => {
  const { status, body } = await get("/api/geocode");
  ok("returns 400",  status === 400);
  ok("has error",    typeof body.error === "string");
});

await suite("Geocode — reverse", async () => {
  // Kozhikode approx coords
  const { status, body } = await get("/api/geocode/reverse?lat=11.258&lon=75.780");
  ok("returns 200",  status === 200);
  ok("has city",     typeof body.city === "string");
  ok("city non-empty", body.city.length > 0);
});

await suite("Validation — missing required fields", async () => {
  const { status, body } = await post("/api/itinerary", {});
  ok("returns 400",          status === 400);
  ok("has details array",    Array.isArray(body.details));
  ok("mentions dest",        body.details.some((d) => d.includes("dest")));
  ok("mentions arrivalTime", body.details.some((d) => d.includes("arrivalTime")));
});

await suite("Validation — bad time format", async () => {
  const { status, body } = await post("/api/itinerary", {
    dest: "Kozhikode", arrivalTime: "9am", departureTime: "7pm",
  });
  ok("returns 400",  status === 400);
  ok("mentions time format", body.details.some((d) => d.includes("HH:MM")));
});

await suite("Validation — too narrow window", async () => {
  const { status, body } = await post("/api/itinerary", {
    dest: "Kozhikode", arrivalTime: "09:00", departureTime: "09:30",
  });
  ok("returns 400",  status === 400);
  ok("mentions 90 minutes", body.details.some((d) => d.includes("90")));
});

await suite("Validation — invalid interests", async () => {
  const { status, body } = await post("/api/itinerary", {
    dest: "Kozhikode", arrivalTime: "09:00", departureTime: "19:00",
    interests: ["food", "skydiving", "moon_landing"],
  });
  ok("returns 400",  status === 400);
  ok("mentions unknown interests", body.details.some((d) => d.toLowerCase().includes("unknown")));
});

await suite("Itinerary — full generation (real Claude call, ~15s)", async () => {
  console.log("  ⏳ Calling Claude... (this takes ~10-20 seconds)");
  const t0 = Date.now();

  const { status, body } = await post("/api/itinerary", {
    dest:           "Kozhikode, Kerala",
    arrivalPoint:   "Kozhikode Railway Station",
    departurePoint: "Kozhikode Railway Station",
    arrivalTime:    "09:00",
    departureTime:  "19:00",
    interests:      ["food", "culture", "beaches"],
  });

  const ms = Date.now() - t0;
  console.log(`  ⏱️  Completed in ${ms}ms`);

  ok("returns 200",          status === 200, `got ${status}`);
  ok("success flag",         body.success === true);
  ok("has itinerary",        typeof body.itinerary === "object");

  const it = body.itinerary;
  ok("has city",             typeof it.city === "string" && it.city.length > 0);
  ok("has tagline",          typeof it.tagline === "string");
  ok("has cost_estimate",    typeof it.cost_estimate === "string");
  ok("has departure_alert",  typeof it.departure_alert === "string");
  ok("items is array",       Array.isArray(it.items));
  ok("at least 5 stops",     it.items?.length >= 5, `got ${it.items?.length}`);
  ok("has _meta",            typeof it._meta === "object");
  ok("meta has leaveBy",     typeof it._meta?.leaveBy === "string");
  ok("meta has durationMs",  typeof it._meta?.durationMs === "number");

  const lastItem = it.items?.at(-1);
  ok("last item is departure", lastItem?.category === "departure", `got ${lastItem?.category}`);

  // Spot-check first item structure
  const first = it.items?.[0];
  ok("first item has time",        typeof first?.time === "string");
  ok("first item has title",       typeof first?.title === "string");
  ok("first item has description", typeof first?.description === "string");
  ok("first item has category",    typeof first?.category === "string");
});

await suite("Cache — second itinerary call is faster (geocode cached)", async () => {
  const payload = {
    dest: "Kozhikode, Kerala",
    arrivalPoint: "Kozhikode Railway Station",
    departurePoint: "Kozhikode Railway Station",
    arrivalTime: "10:00",
    departureTime: "18:00",
    interests: ["nature"],
  };

  console.log("  ⏳ Second call (geocode/POI should hit cache)...");
  const t0 = Date.now();
  const { status } = await post("/api/itinerary", payload);
  const ms = Date.now() - t0;

  ok("returns 200",        status === 200);
  ok("completed < 30s",   ms < 30000, `took ${ms}ms`);
  console.log(`  ℹ️  Second call took ${ms}ms`);
});

// ── Summary ──────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("🎉 All tests passed!\n");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Check output above.\n");
  process.exit(1);
}

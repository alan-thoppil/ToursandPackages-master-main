/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║    Travel Itinerary Widget  —  itinerary-widget.js        ║
 * ║    Drop-in script for any website                         ║
 * ║                                                           ║
 * ║    Usage:                                                 ║
 * ║    <div id="itinerary-widget"></div>                      ║
 * ║    <script                                                ║
 * ║      src="/itinerary-widget.js?v=2.0.14"                  ║
 * ║      data-api-base="https://tours-and-packages.vercel.app" ║
 * ║      data-target="#itinerary-widget">                     ║
 * ║    </script>                                              ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────
  const TARGET_SEL = "data-target" in document.currentScript.dataset 
    ? document.currentScript.dataset.target 
    : "#itinerary-widget";

  const script = document.currentScript;
  const state  = {
    dest:              "",
    currentPhase:      "welcome",
    travelStatus:      "PRE_TRIP", // LOCAL | PRE_TRIP
    budgetTier:        "MID",      // LOW | MID | HIGH
    travelGroup:       "INDIVIDUAL", // INDIVIDUAL | GROUP
    groupSize:         1,
    transportMode:     "CAR",      // CAR | BIKE | BUS | WALK
    weatherAdaptive:   false,
    activeInterests:   [],
    dietaryPreference: "VEG",
    arrivalPoint:      "",
    arrivalTime:       "09:00",
    departurePoint:    "",
    departureTime:     "19:00",
    customStops:       [],
    userLat:           null,
    userLon:           null,
  };

  // ── Inject Styles ───────────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Chewy&family=Playfair+Display:ital,wght@0,700;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .tiw-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #FFFFFF !important; line-height: 1.5;
      background: rgba(15, 23, 42, 0.85) !important; 
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); 
      border-radius: 28px;
      overflow: hidden; max-width: 800px; margin: 0 auto;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      text-align: left;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tiw-root:hover {
      background: rgba(15, 23, 42, 0.92) !important;
      border-color: rgba(255, 255, 255, 0.25);
    }

    /* CRITICAL: Force inputs to be visible in dark themes */
    .tiw-root input, .tiw-root select, .tiw-root textarea {
      background: #FFFFFF !important;
      color: #0F172A !important;
      border: 1px solid #E2E8F0 !important;
      font-family: inherit;
      -webkit-appearance: none;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
    }
    .tiw-root input::placeholder {
      color: #94A3B8 !important;
    }

    .tiw-phase { display: none; }
    .tiw-phase.tiw-active { display: block; animation: tiw-fade .5s ease-out; }

    @keyframes tiw-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes tiw-pulse { 0% { opacity: .5; } 50% { opacity: 1; } 100% { opacity: .5; } }
    @keyframes tiw-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes tiw-flight-orbit {
      0%   { transform: translate(-160px, 220px) rotate(36deg); opacity: 0; }
      10%  { opacity: 1; }
      50%  { transform: translate(0px, 0px) rotate(36deg); opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translate(160px, -220px) rotate(36deg); opacity: 0; }
    }
    @keyframes tiw-float1 { 0%, 100% { transform: translateY(0px) scale(0.95); } 50% { transform: translateY(-8px) scale(0.95); } }
    @keyframes tiw-float2 { 0%, 100% { transform: translateY(0px) scale(0.95); } 50% { transform: translateY(-12px) scale(0.95); } }
    @keyframes tiw-float3 { 0%, 100% { transform: translateY(0px) scale(0.95); } 50% { transform: translateY(-6px) scale(0.95); } }

    .tiw-dest-card {
      position: absolute; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
      border-radius: 14px; padding: 5px; display: flex; flex-direction: column;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1); width: 110px; z-index: 10;
      border: 1px solid rgba(255,255,255,0.8); font-family: inherit;
    }
    .tiw-dest-card img { width: 100%; height: 75px; border-radius: 10px; object-fit: cover; }
    .tiw-dest-text { padding: 8px 4px 4px 4px; text-align: left; }
    .tiw-dest-text h4 { margin:0; font-size: 11.5px; font-weight:700; color:#0F172A; line-height: 1.2; }
    .tiw-dest-text p { margin:2px 0 0 0; font-size: 9px; color:#64748B; font-weight: 500;}
    .tiw-pin {
      position: absolute; width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 11;
    }
    .tiw-pin svg { width: 12px; height: 12px; fill: currentColor; }

    .tiw-btn-primary {
      background: #14B8A6; color: white !important; border: none;
      padding: .85rem 2rem; border-radius: 12px; font-weight: 700;
      cursor: pointer; transition: all .2s; font-size: .9rem;
      box-shadow: 0 4px 15px rgba(20,184,166,0.25);
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    }
    .tiw-btn-primary:hover:not(:disabled) { background: #0D9488; transform: translateY(-2px); }
    .tiw-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .tiw-btn-ghost {
      background: #14B8A6; border: none;
      padding: .85rem 2rem; border-radius: 12px; font-size: .9rem;
      font-weight: 700; cursor: pointer; color: white !important;
      transition: all .2s; box-shadow: 0 4px 15px rgba(20,184,166,0.25);
    }
    .tiw-btn-ghost:hover { background: #0D9488; transform: translateY(-2px); }

    .tiw-card {
      background: #F8FAFC; border: 1px solid #E2E8F0;
      border-radius: 18px; padding: 1.75rem;
    }

    .tiw-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 480px) { .tiw-grid-2 { grid-template-columns: 1fr; } }

    .tiw-timeline-item {
      display: flex; gap: 1rem; margin-bottom: 2.5rem;
      opacity: 0; transform: translateX(20px);
      transition: opacity .45s ease, transform .45s ease;
    }
    .tiw-timeline-item.tiw-visible { opacity: 1; transform: translateX(0); }

    .tiw-stop-card {
      flex: 1; background: #FFFFFF !important;
      border: 1px solid #E2E8F0; border-radius: 0 14px 14px 14px;
      padding: 1.5rem; border-left-width: 4px; border-left-style: solid;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .tiw-pill {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: .68rem; font-weight: 700; padding: 4px 10px;
      border-radius: 100px; text-transform: uppercase; letter-spacing: .06em;
    }

    .tiw-info-tag {
      display: flex; align-items: center; gap: 8px;
      padding: .85rem 1.25rem; border-radius: 12px; font-size: .8rem;
      font-weight: 600; width: 100%; margin-bottom: .5rem;
    }

    .tiw-interest-chip {
      cursor: pointer; padding: .45rem 1rem; border-radius: 100px;
      font-size: .85rem; font-weight: 600; border: 1px solid;
      transition: all .2s; user-select: none;
    }
    .tiw-interest-chip.active {
      background: rgba(20,184,166,.12) !important;
      border-color: rgba(20,184,166,.4); color: #14B8A6;
    }
    .tiw-interest-chip.inactive {
      background: #F8FAFC !important; border-color: #E2E8F0; color: #475569;
    }
    #tiw-map-container {
      width: 100%; height: 360px; border-radius: 14px; margin-bottom: 2.5rem;
      border: 1px solid #E2E8F0; overflow: hidden; position: relative;
      background: #F1F5F9; transition: all 0.3s ease;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
    }
    .leaflet-container { background: #F8FAFC !important; }
    .tiw-marker { cursor: pointer; transition: transform 0.2s ease; }
    .tiw-marker:hover { transform: scale(1.15); z-index: 10; }
    .mapboxgl-popup { z-index: 20; }
    .mapboxgl-popup-content { padding: 6px 10px !important; border-radius: 8px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; border: 1px solid #E2E8F0 !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .mapboxgl-popup-close-button { display: none !important; }

    .tiw-toggle-btn { 
      background: transparent; color: #64748B; 
    }
    .tiw-toggle-btn.active {
      background: #FFFFFF; color: #14B8A6; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .tiw-stop-input-row {
      display: flex; gap: 8px; align-items: center;
    }
    .tiw-btn-remove {
      background: #FEE2E2; color: #EF4444; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-weight: 800; display: flex; align-items: center; justify-content: center;
    }
    .tiw-switch {
      position: relative; display: inline-block; width: 44px; height: 24px;
    }
    .tiw-switch input { opacity: 0; width: 0; height: 0; }
    .tiw-slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #E2E8F0; transition: .4s; border-radius: 24px;
    }
    .tiw-slider:before {
      position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%;
    }
    input:checked + .tiw-slider { background-color: #14B8A6; }
    input:checked + .tiw-slider:before { transform: translateX(20px); }

    .tiw-suggestions {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 1000;
      background: white; border-radius: 12px; margin-top: 8px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      border: 1px solid #E2E8F0; overflow: hidden; display: none;
    }
    .tiw-suggestion-item {
      padding: 14px 18px; cursor: pointer; display: flex; align-items: flex-start; gap: 14px;
      transition: all 0.2s; border-bottom: 1px solid #F1F5F9;
    }
    .tiw-suggestion-item:last-child { border-bottom: none; }
    .tiw-suggestion-item:hover { background: #F8FAFC; }
    .tiw-suggestion-icon {
      width: 36px; height: 36px; border-radius: 10px; background: #F1F5F9;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      color: #64748B; font-size: 1.2rem; border: 1px solid #E2E8F0;
    }
    .tiw-suggestion-item:hover .tiw-suggestion-icon { background: #E2E8F0; color: #14B8A6; border-color: #14B8A6; }
    .tiw-suggestion-content { display: flex; flex-direction: column; gap: 3px; }
    .tiw-suggestion-name { font-weight: 700; color: #0F172A; font-size: 1rem; }
    .tiw-suggestion-addr { color: #64748B; font-size: 0.8rem; line-height: 1.4; font-weight: 500; }
    
    .tiw-autocomplete-container { position: relative; width: 100%; }
    .tiw-advice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .tiw-advice-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.25rem; transition: all 0.3s ease; }
    .tiw-advice-card:hover { border-color: #14B8A6; box-shadow: 0 4px 12px rgba(20,184,166,0.1); }
    .tiw-advice-title { font-size: 0.8rem; font-weight: 800; color: #14B8A6; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
    .tiw-advice-content { font-size: 0.9rem; color: #475569; line-height: 1.5; font-weight: 500; }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // ── Category Definitions ────────────────────────────────────
  const CATEGORIES = {
    breakfast:  { emoji: "🍳", color: "#D97706", light: "rgba(217,119,6,.12)" },
    coffee:     { emoji: "☕", color: "#B45309", light: "rgba(180,83,9,.1)" },
    attraction: { emoji: "🏛️", color: "#3B82F6", light: "rgba(59,130,246,.1)" },
    activity:   { emoji: "🎭", color: "#10B981", light: "rgba(16,185,129,.1)" },
    lunch:      { emoji: "🍽️", color: "#EF4444", light: "rgba(239,68,68,.1)" },
    dinner:     { emoji: "🌙", color: "#8B5CF6", light: "rgba(139,92,246,.1)" },
    shopping:   { emoji: "🛍️", color: "#F59E0B", light: "rgba(245,158,11,.1)" },
    beach:      { emoji: "🏖️", color: "#06B6D4", light: "rgba(6,182,212,.1)" },
    transport:  { emoji: "🚗", color: "#64748B", light: "rgba(100,116,139,.1)" },
    departure:  { emoji: "🚂", color: "#F43F5E", light: "rgba(244,63,94,.12)" },
    temple:     { emoji: "🕌", color: "#A78BFA", light: "rgba(167,139,250,.1)" },
    museum:     { emoji: "🖼️", color: "#60A5FA", light: "rgba(96,165,250,.1)" },
  };
  const getCat = (c) => CATEGORIES[c] || CATEGORIES.attraction;

  // ── Interests List ──────────────────────────────────────────
  const ALL_INTERESTS = [
    { id: "nature",  label: "🌿 Nature" },
    { id: "culture", label: "🏛️ Culture" },
    { id: "food",    label: "🍲 Foodie" },
    { id: "shop",    label: "🛍️ Shopping" },
    { id: "photo",   label: "📸 Photo Spots" },
    { id: "peace",   label: "🧘 Peace" },
  ];

  // ── HTML Template ───────────────────────────────────────────
  function buildHTML() {
    return `
      <!-- PHASE: WELCOME -->
      <div id="tiw-ph-welcome" class="tiw-phase tiw-active" style="padding:4rem 2rem; text-align:center">
        <h2 style="font-family:'Chewy', cursive; font-size:4.5rem; margin-bottom:1rem; color:#FFFFFF; text-shadow: 0 4px 15px rgba(0,0,0,0.5); font-weight:normal; letter-spacing:2px">AI Trip Planner</h2>
        <p style="color:#CBD5E1; margin-bottom:3rem; max-width:440px; margin-left:auto; margin-right:auto; font-size:1.15rem; line-height:1.6; font-weight:500;">
          Let AI map out your perfect day — thoughtfully organizing your time, places, and experiences into a smooth, well-balanced journey.
        </p>
        <div style="display:flex; flex-direction:column; gap:1.2rem; align-items:center">
          <button class="tiw-btn-primary" id="tiw-btn-detect" style="min-width:260px; padding: 1.2rem">⚡ Map My Perfect Day</button>
          <button class="tiw-btn-primary" id="tiw-btn-transport-mode" style="min-width:260px; padding: 1.2rem; background: #6366F1; box-shadow: 0 4px 15px rgba(99,102,241,0.25)">🚀 Inter-city Transport</button>
          <button class="tiw-btn-ghost" id="tiw-btn-manual" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2)">Enter Destination Manually</button>
        </div>
      </div>

      <!-- PHASE: TRANSPORT SETUP -->
      <div id="tiw-ph-transport" class="tiw-phase" style="padding:3.5rem 2.5rem; background: #FFFFFF; border-radius: 28px;">
        <h3 style="font-size:1.6rem; font-weight:800; margin-bottom:2rem; border-left:5px solid #6366F1; padding-left:1.2rem; color:#0F172A">Inter-city Planner</h3>
        
        <div style="margin-bottom:2rem; position:relative">
          <label style="display:block; font-size:.8rem; font-weight:800; text-transform:uppercase; color:#64748B; margin-bottom:.8rem; letter-spacing:.05em">Origin City</label>
          <div class="tiw-autocomplete-container">
            <input type="text" id="tiw-input-origin" autocomplete="off" placeholder="e.g. Bangalore, India" style="width:100%; padding:1.2rem 1.5rem; border-radius:16px; border:2px solid #F1F5F9; font-size:1.1rem; background:#fff !important; color:#0F172A !important">
            <div id="tiw-suggestions-origin" class="tiw-suggestions"></div>
          </div>
        </div>

        <div style="margin-bottom:3rem; position:relative">
          <label style="display:block; font-size:.8rem; font-weight:800; text-transform:uppercase; color:#64748B; margin-bottom:.8rem; letter-spacing:.05em">Destination City</label>
          <div class="tiw-autocomplete-container">
            <input type="text" id="tiw-input-transport-dest" autocomplete="off" placeholder="e.g. Goa, India" style="width:100%; padding:1.2rem 1.5rem; border-radius:16px; border:2px solid #F1F5F9; font-size:1.1rem; background:#fff !important; color:#0F172A !important">
            <div id="tiw-suggestions-transport-dest" class="tiw-suggestions"></div>
          </div>
        </div>

        <button class="tiw-btn-primary" style="width:100%; padding:1.25rem; font-size:1.15rem; border-radius:16px; background: #6366F1" id="tiw-btn-generate-transport">Find Best Routes</button>
        <button class="tiw-btn-ghost" id="tiw-btn-transport-back" style="width:100%; margin-top: 1rem; background: transparent; color: #64748B !important; box-shadow: none">Go Back</button>
      </div>

      <!-- PHASE: TRANSPORT RESULTS -->
      <div id="tiw-ph-transport-results" class="tiw-phase" style="padding:3.5rem 2.5rem; background: #FFFFFF; border-radius: 28px;">
        <h3 style="font-size:1.6rem; font-weight:800; margin-bottom:1rem; color:#0F172A">Travel Options</h3>
        <p id="tiw-transport-route-title" style="color:#64748B; font-weight:600; margin-bottom:2.5rem"></p>
        
        <div id="tiw-transport-list" style="display:flex; flex-direction:column; gap:1.5rem; margin-bottom: 2rem"></div>
        
        <div id="tiw-transport-map-container" style="display:none; margin-bottom: 2rem">
          <label style="display:block; font-size:.8rem; font-weight:800; text-transform:uppercase; color:#64748B; margin-bottom:.8rem; letter-spacing:.05em">Route Map</label>
          <div id="tiw-transport-map" style="width:100%; height:300px; border-radius:20px; border:1px solid #E2E8F0; overflow:hidden"></div>
        </div>

        <div style="text-align:center; margin-top:3.5rem; padding-top:2.5rem; border-top:1px solid #F1F5F9">
          <button class="tiw-btn-ghost" id="tiw-btn-transport-reset" style="padding:0.8rem 2rem; background: #6366F1">↩ Plan Another Trip</button>
        </div>
      </div>

      <!-- PHASE: SETUP -->
      <div id="tiw-ph-setup" class="tiw-phase" style="padding:3.5rem 2.5rem; background: #FFFFFF; border-radius: 28px;">
        <h3 style="font-size:1.6rem; font-weight:800; margin-bottom:2rem; border-left:5px solid #14B8A6; padding-left:1.2rem; color:#0F172A">Plan Your Tour</h3>
        
        <!-- TRAVEL CONTEXT TOGGLE -->
        <div style="background: #F1F5F9; border-radius: 16px; padding: 6px; display: flex; gap: 4px; margin-bottom: 2rem">
          <button id="tiw-toggle-local" class="tiw-toggle-btn" style="flex: 1; padding: 0.8rem; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s">📍 I'm Already There</button>
          <button id="tiw-toggle-pretrip" class="tiw-toggle-btn active" style="flex: 1; padding: 0.8rem; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s">✈️ Planning Pre-Trip</button>
        </div>

        <div style="margin-bottom:2rem; position:relative">
          <label style="display:block; font-size:.8rem; font-weight:800; text-transform:uppercase; color:#64748B; margin-bottom:.8rem; letter-spacing:.05em">Target City</label>
          <div class="tiw-autocomplete-container">
            <input type="text" id="tiw-input-dest" autocomplete="off" placeholder="e.g. Kozhikode, Kerala" style="width:100%; padding:1.2rem 1.5rem; border-radius:16px; border:2px solid #F1F5F9; font-size:1.1rem; padding-right:55px; background:#fff !important; color:#0F172A !important">
            <button id="tiw-btn-re-detect" title="Auto-detect location" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:20px; z-index:10">📍</button>
            <div id="tiw-suggestions-dest" class="tiw-suggestions"></div>
          </div>
        </div>

        <!-- ARRIVAL / DEPARTURE SECTION -->
        <div class="tiw-grid-2" style="margin-bottom:2rem">
          <div id="tiw-section-arrival">
            <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:.8rem; text-transform:uppercase">Arrival Point</label>
            <div class="tiw-autocomplete-container" style="margin-bottom:1.5rem">
              <input type="text" id="tiw-input-arr-pt" autocomplete="off" placeholder="e.g. Railway/Airport" style="width:100%; padding:1rem; border-radius:12px; border:2px solid #F1F5F9; background:#fff !important; color:#0F172A !important">
              <div id="tiw-suggestions-arr-pt" class="tiw-suggestions"></div>
            </div>
            <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:.8rem; text-transform:uppercase">Arrival Date & Time</label>
            <div style="margin-bottom:1.5rem">
              <input type="datetime-local" id="tiw-input-arr" value="2024-05-01T09:00" style="width:100%; padding:1rem; border-radius:12px; border:2px solid #F1F5F9; background:#fff !important; color:#0F172A !important; font-size:0.9rem">
            </div>
          </div>
          <div id="tiw-section-departure">
            <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:.8rem; text-transform:uppercase">Departure Point</label>
            <div class="tiw-autocomplete-container" style="margin-bottom:1.5rem">
              <input type="text" id="tiw-input-dep-pt" autocomplete="off" placeholder="e.g. Railway/Airport" style="width:100%; padding:1rem; border-radius:12px; border:2px solid #F1F5F9; background:#fff !important; color:#0F172A !important">
              <div id="tiw-suggestions-dep-pt" class="tiw-suggestions"></div>
            </div>
            <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:.8rem; text-transform:uppercase">Departure Date & Time</label>
            <div style="margin-bottom:1.5rem">
              <input type="datetime-local" id="tiw-input-dep" value="2024-05-01T19:00" style="width:100%; padding:1rem; border-radius:12px; border:2px solid #F1F5F9; background:#fff !important; color:#0F172A !important; font-size:0.9rem">
            </div>
          </div>
        </div>

        <!-- CUSTOM STOPS SECTION -->
        <div style="margin-bottom:2rem">
          <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:1rem; text-transform:uppercase">Custom Stops (Must Visit)</label>
          <div id="tiw-custom-stops-list" style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px"></div>
          <button id="tiw-btn-add-stop" style="background:rgba(20,184,166,0.05); color:#14B8A6; border:1px dashed #14B8A6; padding:0.8rem; border-radius:12px; width:100%; font-weight:700; cursor:pointer">+ Add a specific location</button>
        </div>

        <!-- BUDGET & GROUP CONFIG -->
        <div class="tiw-grid-2" style="margin-bottom:2.5rem">
          <div>
            <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:1.2rem; text-transform:uppercase">Budget Tier</label>
            <div id="tiw-budget-selector" style="display:flex; gap:8px">
              <div class="tiw-interest-chip active" data-tier="LOW">Low</div>
              <div class="tiw-interest-chip active" data-tier="MID">Mid</div>
              <div class="tiw-interest-chip inactive" data-tier="HIGH">High</div>
            </div>
          </div>
          <div>
            <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:1.2rem; text-transform:uppercase">Travel Group</label>
            <div id="tiw-group-selector" style="display:flex; gap:8px">
              <div class="tiw-interest-chip active" data-type="INDIVIDUAL">Solo</div>
              <div class="tiw-interest-chip inactive" data-type="GROUP">Group</div>
            </div>
          </div>
        </div>

        <!-- TRANSPORT MODE -->
        <div style="margin-bottom:2.5rem">
          <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:1.2rem; text-transform:uppercase">Preferred Transport</label>
          <div id="tiw-transport-selector" style="display:flex; flex-wrap:wrap; gap:.8rem">
            <div class="tiw-interest-chip active" data-mode="CAR">🚗 Car</div>
            <div class="tiw-interest-chip inactive" data-mode="BIKE">🏍️ Bike</div>
            <div class="tiw-interest-chip inactive" data-mode="BUS">🚌 Bus</div>
            <div class="tiw-interest-chip inactive" data-mode="WALK">🚶 Walk</div>
          </div>
        </div>

        <!-- ADVANCED TOGGLES -->
        <div style="margin-bottom:3rem; display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; padding:1.2rem; border-radius:16px; border:1px solid #F1F5F9">
          <div>
            <div style="font-size:0.9rem; font-weight:700; color:#0F172A">Smart Weather Adaptive</div>
            <div style="font-size:0.75rem; color:#64748B">Regenerate route based on forecast</div>
          </div>
          <label class="tiw-switch">
            <input type="checkbox" id="tiw-check-weather">
            <span class="tiw-slider"></span>
          </label>
        </div>

        <div style="margin-bottom:2.5rem">
          <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:1.2rem; text-transform:uppercase">What's your mood?</label>
          <div id="tiw-interests" style="display:flex; flex-wrap:wrap; gap:.8rem"></div>
        </div>

        <div style="margin-bottom:3rem">
          <label style="display:block; font-size:.8rem; font-weight:800; color:#64748B; margin-bottom:1.2rem; text-transform:uppercase">Dietary Preference</label>
          <div id="tiw-dietary" style="display:flex; gap:.8rem"></div>
        </div>

        <button class="tiw-btn-primary" style="width:100%; padding:1.25rem; font-size:1.15rem; border-radius:16px" id="tiw-btn-generate">Generate Premium Itinerary</button>
      </div>

      <!-- PHASE: LOADING -->
      <div id="tiw-ph-loading" class="tiw-phase" style="padding:6rem 2rem; text-align:center">
        <div style="width:70px; height:70px; border:5px solid #F1F5F9; border-top-color:#14B8A6; border-radius:50%; animation:tiw-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin:0 auto 2.5rem"></div>
        <style>@keyframes tiw-spin { to { transform: rotate(360deg); } }</style>
        <h3 id="tiw-loading-title" style="font-size:1.6rem; font-weight:800; margin-bottom:.7rem; color:#0F172A">Crafting Your Vision...</h3>
        <p id="tiw-loading-sub" style="color:#64748B; font-size:1rem; max-width:320px; margin:0 auto">Our AI is mapping the best resorts, hidden cafes, and scenic spots for you.</p>
      </div>

      <!-- PHASE: ITINERARY -->
      <div id="tiw-ph-itinerary" class="tiw-phase">
        <div id="tiw-hero" style="background:linear-gradient(160deg,#F8FAFC 0%,#F1F5F9 100%);padding:3rem 2rem 3.5rem;text-align:center;border-bottom:1px solid #E2E8F0;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50% 0%,rgba(20,184,166,0.08),transparent 70%);pointer-events:none"></div>
          <p id="tiw-eyebrow" style="color:#14B8A6;font-size:.75rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.6rem">Your Day in</p>
          <h2 id="tiw-city" style="font-family:'Playfair Display',serif;font-size:clamp(2rem,6vw,3.5rem);font-weight:700;color:#0F172A;margin-bottom:.6rem;line-height:1.1;text-transform:capitalize">—</h2>
          <p id="tiw-tagline" style="color:#334155;font-style:italic;font-size:1.1rem;margin-bottom:1.5rem;max-width:500px;margin-left:auto;margin-right:auto">—</p>
          <div id="tiw-pref-summary" style="display:flex;justify-content:center;gap:1.2rem;margin-bottom:2rem;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.15em;color:#94A3B8"></div>
          <div id="tiw-badges" style="display:flex;justify-content:center;gap:.8rem;flex-wrap:wrap;margin-bottom:1.2rem"></div>
          <div id="tiw-alert" style="display:none;margin:0 auto;max-width:480px;background:rgba(244,63,94,.08);border:1px solid rgba(244,63,94,.15);border-radius:100px;padding:.6rem 1.4rem;font-size:.85rem;color:#E11D48;font-weight:600;display:inline-flex;align-items:center;gap:8px"></div>
        </div>
        <div style="max-width:680px;margin:0 auto;padding:2.5rem 1.5rem 5rem">
          <div id="tiw-map-container">
            <div id="tiw-map" style="width:100%; height:100%"></div>
          </div>
          <div style="position:relative">
            <div style="position:absolute;left:21px;top:15px;bottom:15px;width:2px;background:linear-gradient(to bottom, #14B8A6 0%, #E2E8F0 100%);opacity:.4"></div>
            <div id="tiw-timeline"></div>
          </div>
          <div style="text-align:center;margin-top:3.5rem;padding-top:2.5rem;border-top:1px solid #F1F5F9">
            <p style="color:#94A3B8;font-size:.8rem;margin-bottom:1.5rem;font-weight:500">Intelligently curated for you · Powered by AI & Mapbox</p>
            <button class="tiw-btn-ghost" id="tiw-btn-reset" style="padding:0.8rem 2rem">↩ Plan Another Trip</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Logic ───────────────────────────────────────────────────
  function showPhase(id) {
    document.querySelectorAll(".tiw-phase").forEach(p => p.classList.remove("tiw-active"));
    const el = document.getElementById(`tiw-ph-${id}`);
    if (el) el.classList.add("tiw-active");
    state.currentPhase = id;
  }

  function renderInterests(container) {
    if(!container) return;
    container.innerHTML = ALL_INTERESTS.map(i => `<div class="tiw-interest-chip ${state.activeInterests.includes(i.id) ? "active" : "inactive"}" data-id="${i.id}">${i.label}</div>`).join("");
  }
  function renderDietary(container) {
    if(!container) return;
    const opts = ["VEG", "NON-VEG"];
    container.innerHTML = opts.map(val => `<div class="tiw-interest-chip ${state.dietaryPreference === val ? "active" : "inactive"}" data-val="${val}">${val === "VEG" ? "🥗 Pure Veg" : "🍖 Non-Veg OK"}</div>`).join("");
  }

  // ── Autocomplete Engine ─────────────────────────────────────
  function setupAutocomplete(inputId, suggestionsId) {
    const input = root.querySelector(`#${inputId}`);
    const list = root.querySelector(`#${suggestionsId}`);
    let timeout = null;

    // Ensure list is scrollable
    list.style.maxHeight = "300px";
    list.style.overflowY = "auto";

    input.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      clearTimeout(timeout);
      
      if (val.length < 2) { 
        list.style.display = "none"; 
        return; 
      }

      // Show a subtle loading state in the dropdown if it's already open
      if (list.style.display === "block") {
        list.style.opacity = "0.7";
      }

      timeout = setTimeout(async () => {
        try {
          const apiBase = (script.dataset.apiBase !== undefined) ? script.dataset.apiBase : "https://tours-and-packages.vercel.app";
          const res = await fetch(`${apiBase}/api/geocode?q=${encodeURIComponent(val)}`);
          const data = await res.json();
          
          list.style.opacity = "1";
          
          if (data.results && data.results.length) {
            list.innerHTML = data.results.map(item => {
              const lower = item.display_name.toLowerCase();
              let icon = "📍";
              if (lower.includes("airport")) icon = "✈️";
              else if (lower.includes("station") || lower.includes("railway")) icon = "🚂";
              else if (lower.includes("bus") || lower.includes("terminal")) icon = "🚌";
              else if (lower.includes("hotel") || lower.includes("resort") || lower.includes("stay")) icon = "🏨";
              else if (lower.includes("beach") || lower.includes("coast")) icon = "🏖️";
              else if (lower.includes("park") || lower.includes("garden")) icon = "🌳";
              else if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("food")) icon = "🍴";
              
              return `
                <div class="tiw-suggestion-item" data-full="${item.display_name}">
                  <div class="tiw-suggestion-icon">${icon}</div>
                  <div class="tiw-suggestion-content">
                    <div class="tiw-suggestion-name">${item.name}</div>
                    <div class="tiw-suggestion-addr">${item.secondary || item.display_name}</div>
                  </div>
                </div>
              `;
            }).join("");
            list.style.display = "block";

            list.querySelectorAll(".tiw-suggestion-item").forEach(item => {
              item.onmousedown = (e) => {
                e.preventDefault(); // Prevent blur before click
                input.value = item.dataset.full;
                list.style.display = "none";
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              };
            });
          } else {
            list.style.display = "none";
          }
        } catch(err) { 
          console.error("Autocomplete failed", err);
          list.style.display = "none";
        }
      }, 400);
    });

    input.addEventListener("blur", () => {
      // Small timeout to allow click to register before hiding
      setTimeout(() => { list.style.display = "none"; }, 200);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2 && list.innerHTML.length > 0) {
        list.style.display = "block";
      }
    });
  }

  async function detectLocation(root) {
    const btnWelcome = root.querySelector("#tiw-btn-detect");
    const btnPin     = root.querySelector("#tiw-btn-re-detect");
    const activeBtn  = (state.currentPhase === "welcome") ? btnWelcome : btnPin;
    
    const origHTML = activeBtn ? activeBtn.innerHTML : "";
    if (activeBtn) {
      if (state.currentPhase === "welcome") activeBtn.innerHTML = "🛰️ Locating...";
      else activeBtn.style.animation = "tiw-pulse 1s ease-in-out infinite";
      activeBtn.disabled = true;
    }

    console.log("TIW: Starting location detection...");
    
    try {
      const apiBase = (script.dataset.apiBase !== undefined) ? script.dataset.apiBase : "https://tours-and-packages.vercel.app";
      let city = null;

      // 1. Try Browser GPS first (Most accurate)
      if (navigator.geolocation) {
        console.log("TIW: Requesting Browser Geolocation...");
        try {
          const pos = await new Promise((rs, rj) => 
            navigator.geolocation.getCurrentPosition(rs, rj, {timeout: 6000, enableHighAccuracy: true})
          ).catch((err) => {
            console.warn("TIW: GPS Promise rejected/timeout", err);
            return null;
          });

          if (pos) {
            console.log("TIW: GPS fixed:", pos.coords.latitude, pos.coords.longitude);
            state.userLat = pos.coords.latitude;
            state.userLon = pos.coords.longitude;
            
            const rev = await fetch(`${apiBase}/api/geocode/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
              .then(r => r.json())
              .catch(err => {
                console.error("TIW: Reverse geocode fetch failed", err);
                return null;
              });
            if (rev && rev.city) {
              city = rev.city + (rev.address?.state ? `, ${rev.address.state}` : "");
              console.log("TIW: City identified:", city);
            }
          }
        } catch(e) { console.warn("TIW: GPS Block failed", e); }
      }

      // 2. Fallback to first-party Vercel IP geocoding
      if (!city) {
        console.log("TIW: Falling back to IP Geocoding...");
        try {
          const r0 = await fetch(`${apiBase}/api/geocode/ip`).then(r => r.json()).catch(() => ({}));
          if(r0.city) {
            city = r0.city + (r0.region ? `, ${r0.region}` : "");
            console.log("TIW: IP city found (Vercel):", city);
          }
        } catch(e) {}
      }

      // 3. Fallback to third-party IP geocoding chain
      if (!city) {
        const providers = ["https://ipwho.is/", "https://ipapi.co/json/", "https://get.geojs.io/v1/ip/geo.json"];
        for (const url of providers) {
          try {
            console.log("TIW: Trying provider:", url);
            const res = await fetch(url).then(r => r.json());
            if (res.city) {
              city = res.city + (res.region || res.region_name ? `, ${res.region || res.region_name}` : "");
              console.log("TIW: IP city found (3rd-party):", city);
              break;
            }
          } catch(e) {}
        }
      }

      if (city) {
        state.dest = city;
        const input = root.querySelector("#tiw-input-dest");
        if (input) {
          const titleCase = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          input.value = titleCase;
          state.dest = titleCase;
        }
      } else {
        console.warn("TIW: No location could be determined automatically.");
      }
    } finally {
      if (activeBtn) {
        activeBtn.innerHTML = origHTML;
        activeBtn.style.animation = "";
        activeBtn.disabled = false;
      }
      if (state.currentPhase === "welcome") showPhase("setup");
      renderInterests(root.querySelector("#tiw-interests"));
      renderDietary(root.querySelector("#tiw-dietary"));
    }
  }

  async function generate(root) {
    state.dest = root.querySelector("#tiw-input-dest").value;
    state.arrivalPoint = root.querySelector("#tiw-input-arr-pt")?.value || "Railway Station";
    
    const arrVal = root.querySelector("#tiw-input-arr")?.value || "";
    if (arrVal.includes("T")) {
      const [d, t] = arrVal.split("T");
      state.arrivalDate = d;
      state.arrivalTime = t;
    } else {
      state.arrivalDate = "";
      state.arrivalTime = "09:00";
    }

    state.departurePoint = root.querySelector("#tiw-input-dep-pt")?.value || "Railway Station";
    
    const depVal = root.querySelector("#tiw-input-dep")?.value || "";
    if (depVal.includes("T")) {
      const [d, t] = depVal.split("T");
      state.departureDate = d;
      state.departureTime = t;
    } else {
      state.departureDate = "";
      state.departureTime = "19:00";
    }
    if (!state.dest) return alert("Please specify a city!");

    showPhase("loading");
    try {
      const apiBase = (script.dataset.apiBase !== undefined) ? script.dataset.apiBase : "https://tours-and-packages.vercel.app";
      const res = await fetch(`${apiBase}/api/itinerary`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...state})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      renderItinerary(root, data.itinerary || data);
    } catch (e) {
      console.error("TIW Generation Error:", e);
      alert(`Error: ${e.message}\n\nPlease try again or use manual input.`);
      showPhase("setup");
    }
  }

  async function generateTransport(root) {
    const origin = root.querySelector("#tiw-input-origin").value;
    const destination = root.querySelector("#tiw-input-transport-dest").value;
    if (!origin || !destination) return alert("Please specify both origin and destination!");

    showPhase("loading");
    document.getElementById("tiw-loading-title").innerText = "Analyzing Routes...";
    document.getElementById("tiw-loading-sub").innerText = "Finding the best flights, trains, and bus connections for your trip.";

    try {
      const apiBase = (script.dataset.apiBase !== undefined) ? script.dataset.apiBase : "https://tours-and-packages.vercel.app";
      const res = await fetch(`${apiBase}/api/transport`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ origin, destination })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      renderTransportResults(root, data, origin, destination);
    } catch (e) {
      console.error("TIW Transport Error:", e);
      alert(`Error: ${e.message}`);
      showPhase("transport");
    } finally {
      document.getElementById("tiw-loading-title").innerText = "Crafting Your Vision...";
      document.getElementById("tiw-loading-sub").innerText = "Our AI is mapping the best resorts, hidden cafes, and scenic spots for you.";
    }
  }

  function renderTransportResults(root, data, origin, destination) {
    root.querySelector("#tiw-transport-route-title").innerText = `${origin} ➔ ${destination}`;
    const list = root.querySelector("#tiw-transport-list");
    list.innerHTML = "";

    (data.options || []).forEach(opt => {
      const card = document.createElement("div");
      card.className = "tiw-card";
      card.style.padding = "1.5rem";
      card.style.borderLeft = opt.rank === 1 ? "6px solid #6366F1" : "6px solid #E2E8F0";
      
      const badgeColor = opt.rank === 1 ? "#6366F1" : (opt.rank === 2 ? "#10B981" : "#F59E0B");
      const badgeText = opt.rank === 1 ? "BEST OVERALL" : (opt.rank === 2 ? "CHEAPEST" : "ALTERNATIVE");

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem">
          <div>
            <span class="tiw-pill" style="background: ${badgeColor}20; color: ${badgeColor}; margin-bottom: 0.5rem">${badgeText}</span>
            <h4 style="margin:0; font-size:1.2rem; color:#0F172A">${opt.title}</h4>
            <p style="margin:4px 0 0; color:#64748B; font-size:0.85rem; font-weight:700">🚌 ${opt.mode}</p>
          </div>
          <div style="text-align:right">
            <div style="color:#0F172A; font-weight:800; font-size:1.1rem">${opt.cost}</div>
            <div style="color:#64748B; font-size:0.75rem; font-weight:600">⏱️ ${opt.duration}</div>
          </div>
        </div>
        <div style="background:#F1F5F9; border-radius:12px; padding:1rem; margin-bottom:1rem">
          <ul style="margin:0; padding:0 0 0 1.2rem; font-size:0.9rem; color:#475569">
            ${opt.steps.map(s => `<li style="margin-bottom:4px">${s}</li>`).join("")}
          </ul>
        </div>
        ${opt.transfers && opt.transfers.length ? `
          <div style="display:flex; gap:6px; flex-wrap:wrap">
            ${opt.transfers.map(t => `<span style="font-size:0.7rem; background:#E2E8F0; color:#475569; padding:2px 8px; border-radius:4px; font-weight:700">${t}</span>`).join("")}
          </div>
        ` : ""}
      `;
      list.appendChild(card);
    });

    showPhase("transport-results");
    renderTransportMap(root, origin, destination);
  }

  async function renderTransportMap(root, origin, destination) {
    const mapEl = root.querySelector("#tiw-transport-map");
    const container = root.querySelector("#tiw-transport-map-container");
    if (!mapEl) return;

    try {
      const apiBase = (script.dataset.apiBase !== undefined) ? script.dataset.apiBase : "https://tours-and-packages.vercel.app";
      const [g1, g2] = await Promise.all([
        fetch(`${apiBase}/api/geocode?q=${encodeURIComponent(origin)}`).then(r => r.json()),
        fetch(`${apiBase}/api/geocode?q=${encodeURIComponent(destination)}`).then(r => r.json())
      ]);

      if (g1.results?.[0] && g2.results?.[0]) {
        container.style.display = "block";
        const p1 = g1.results[0];
        const p2 = g2.results[0];
        
        // Use the same map logic as itinerary but simplified
        if (!window.L) {
          const l = document.createElement("link"); l.rel="stylesheet"; l.href="https://unpkg.com/leaflet/dist/leaflet.css"; document.head.appendChild(l);
          const s = document.createElement("script"); s.src="https://unpkg.com/leaflet/dist/leaflet.js"; 
          s.onload = () => renderTransportMap(root, origin, destination); document.head.appendChild(s);
          return;
        }

        // Cleanup old map if exists
        if (mapEl._tiw_map) { mapEl._tiw_map.remove(); }
        
        const map = L.map(mapEl, {attributionControl: false});
        mapEl._tiw_map = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        const markers = [
          L.marker([p1.lat, p1.lon]).addTo(map).bindPopup(`<strong>Origin:</strong> ${origin}`),
          L.marker([p2.lat, p2.lon]).addTo(map).bindPopup(`<strong>Destination:</strong> ${destination}`)
        ];

        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));

        // Draw line
        L.polyline([[p1.lat, p1.lon], [p2.lat, p2.lon]], {color: '#6366F1', weight: 4, dashArray: '10, 10'}).addTo(map);
      }
    } catch (e) {
      console.error("Transport map failed", e);
    }
  }

  function renderItinerary(root, data) {
    const formattedCity = (data.city || state.dest || "").split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    root.querySelector("#tiw-city").innerText = formattedCity;
    root.querySelector("#tiw-tagline").innerText = data.tagline;
    root.querySelector("#tiw-pref-summary").innerText = `${state.travelGroup} · ${state.dietaryPreference} · ${state.activeInterests.join(" & ") || "EXPLORING"}`;
    root.querySelector("#tiw-badges").innerHTML = `
      <div class="tiw-pill" style="background:rgba(20,184,166,.08);color:#14B8A6;border:1px solid rgba(20,184,166,.15)">☔ ${data.weather_tip || "Check weather"}</div>
      <div class="tiw-pill" style="background:rgba(245,158,11,.08);color:#D97706;border:1px solid rgba(245,158,11,.15)">💰 ${state.budgetTier} · ${data.cost_estimate || "Calculating..."}</div>
      <div class="tiw-pill" style="background:rgba(99,102,241,.08);color:#6366F1;border:1px solid rgba(99,102,241,.15)">📍 ${state.transportMode}</div>
    `;
    const alertEl = root.querySelector("#tiw-alert");
    if(data.departure_alert) { alertEl.style.display = "inline-flex"; alertEl.innerHTML = `<span>🚨</span> ${data.departure_alert}`; }
    else alertEl.style.display = "none";

    const tl = root.querySelector("#tiw-timeline"); tl.innerHTML = "";
    (data.items || []).forEach((item, idx) => {
      const cat = getCat(item.category);
      const div = document.createElement("div"); div.className = "tiw-timeline-item";
      div.innerHTML = `
        <div style="width:42px; text-align:right; flex-shrink:0">
          <div style="width:12px; height:12px; border-radius:50%; background:${cat.color}; border:3px solid white; box-shadow:0 0 0 2px ${cat.light}; margin:8px 0 0 auto"></div>
          <div style="color:#64748B;font-size:.7rem;font-weight:700;margin-top:6px;text-align:right">${item.time}</div>
        </div>
        <div class="tiw-stop-card" style="border-left-color:${cat.color}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:0.8rem">
            <div>
              <span class="tiw-pill" style="background:${cat.light};color:${cat.color};margin-bottom:6px">${cat.emoji} ${item.category}</span>
              <h4 style="margin:0; font-size:1.15rem; font-weight:700; color:#0F172A">${item.title}</h4>
            </div>
            ${item.cost ? `<div style="background:#0F172A; color:#10B981; padding:4px 10px; border-radius:8px; font-size:.75rem; font-weight:800; border:1px solid #334155">${item.cost.replace('$', '₹')}</div>` : ""}
          </div>
          <p style="font-size:0.95rem; color:#475569; margin:0 0 1.2rem; line-height:1.6">${item.description}</p>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1rem">
            ${item.must_try ? `<div class="tiw-info-tag" style="background:rgba(245,158,11,.05); color:#92400E; border:1px solid rgba(245,158,11,.1); margin:0"><span style="font-size:1.2rem">🥘</span> <b>Must Try:</b> ${item.must_try}</div>` : ""}
            ${item.tip ? `<div class="tiw-info-tag" style="background:rgba(16,185,129,.05); color:#065F46; border:1px solid rgba(16,185,129,.1); margin:0"><span style="font-size:1.2rem">💡</span> ${item.tip}</div>` : ""}
          </div>
          <div style="border-top:1px solid #F1F5F9; padding-top:1rem; display:flex; justify-content:space-between; align-items:center">
             <span style="font-size:0.75rem; color:#94A3B8; font-weight:600">🗺️ ${item.getting_there || "Walk or Cab"}</span>
             <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + ' ' + (data.city || ''))}" target="_blank" style="color:#14B8A6; font-size:0.8rem; font-weight:800; text-decoration:none; display:flex; align-items:center; gap:5px">📍 GOOGLE MAPS</a>
          </div>
        </div>
      `;
      tl.appendChild(div);
      setTimeout(() => div.classList.add("tiw-visible"), idx * 150 + 100);
    });

    // Extra Suggestions Section (Premium Advice)
    if (data.extra_suggestions) {
      const suggestions = data.extra_suggestions;
      const adviceDiv = document.createElement("div");
      adviceDiv.id = "tiw-extra-advice";
      adviceDiv.innerHTML = `
        <div style="margin-top: 1.5rem; padding: 2rem; background: #F8FAFC; border-radius: 20px; border: 1px solid #E2E8F0; margin-bottom: 2.5rem">
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px">
            <span style="background: #14B8A6; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem">✨</span>
            Premium Travel Advice
          </h3>
          <div class="tiw-advice-grid">
            ${suggestions.outfit ? `<div class="tiw-advice-card"><div class="tiw-advice-title">🧥 What to Wear</div><div class="tiw-advice-content">${suggestions.outfit}</div></div>` : ""}
            ${suggestions.etiquette ? `<div class="tiw-advice-card"><div class="tiw-advice-title">🤝 Local Etiquette</div><div class="tiw-advice-content">${suggestions.etiquette}</div></div>` : ""}
            ${suggestions.local_phrases ? `<div class="tiw-advice-card"><div class="tiw-advice-title">🗣️ Local Phrases</div><div class="tiw-advice-content">${suggestions.local_phrases}</div></div>` : ""}
            ${suggestions.photography ? `<div class="tiw-advice-card"><div class="tiw-advice-title">📸 Photography</div><div class="tiw-advice-content">${suggestions.photography}</div></div>` : ""}
            ${suggestions.safety ? `<div class="tiw-advice-card"><div class="tiw-advice-title">🛡️ Safety First</div><div class="tiw-advice-content">${suggestions.safety}</div></div>` : ""}
            ${suggestions.travel_logistics ? `<div class="tiw-advice-card"><div class="tiw-advice-title">🚌 Travel Logistics</div><div class="tiw-advice-content">${suggestions.travel_logistics}</div></div>` : ""}
            ${suggestions.hidden_gems ? `<div class="tiw-advice-card"><div class="tiw-advice-title">💎 Hidden Gems</div><div class="tiw-advice-content">${suggestions.hidden_gems}</div></div>` : ""}
            ${suggestions.alternatives ? `<div class="tiw-advice-card"><div class="tiw-advice-title">🔄 Alternatives</div><div class="tiw-advice-content">${suggestions.alternatives}</div></div>` : ""}
          </div>
        </div>
      `;
      const mapContainer = root.querySelector("#tiw-map-container");
      if (mapContainer) mapContainer.after(adviceDiv);
      else tl.parentElement.prepend(adviceDiv);
    }

    renderMap(root, data);
    showPhase("itinerary");
    setTimeout(() => mapInstance && mapInstance.resize(), 500);
    root.scrollIntoView({ behavior: "smooth" });
  }

  let mapInstance = null;
  async function renderMap(root, data) {
    const items = (data.items || []).filter(i => {
      const lat = parseFloat(i.lat);
      const lon = parseFloat(i.lon);
      return !isNaN(lat) && !isNaN(lon) && Math.abs(lat) > 0.1 && Math.abs(lon) > 0.1;
    });
    const token = script.dataset.mapboxToken || "";
    const mapEl = root.querySelector("#tiw-map");
    if (!mapEl || !items.length) return;
    if (mapInstance) { if(typeof mapInstance.remove === 'function') mapInstance.remove(); mapInstance = null; }
    
    if (data._meta?.mapboxOverLimit) return renderLeaflet(mapEl, items);

    if (!window.mapboxgl) {
      const l = document.createElement("link"); l.rel="stylesheet"; l.href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"; document.head.appendChild(l);
      const s = document.createElement("script"); s.src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"; 
      s.onload = () => renderMap(root, data); document.head.appendChild(s);
      return;
    }

    // PROACTIVE TOKEN CHECK: Avoid 403 console spam by checking token before initializing the map engine
    if (token) {
      try {
        const check = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/health.json?access_token=${token}&limit=1`).catch(() => ({ok: false}));
        if (!check.ok) {
          console.warn("Mapbox token appears invalid (403), falling back to Leaflet immediately.");
          return renderLeaflet(mapEl, items);
        }
      } catch(e) {}
    }

    mapboxgl.accessToken = token;
    try {
      mapInstance = new mapboxgl.Map({ 
        container: mapEl, 
        style: "mapbox://styles/mapbox/streets-v11", 
        center: [parseFloat(items[0].lon), parseFloat(items[0].lat)], 
        zoom: 12, 
        attributionControl: false, 
        preserveDrawingBuffer: true 
      });

      mapInstance.on("error", (e) => {
        console.warn("Mapbox GL error, falling back to Leaflet:", e);
        if (mapInstance) { mapInstance.remove(); mapInstance = null; }
        renderLeaflet(mapEl, items);
      });
      
      mapInstance.on("load", async () => {
        const b = new mapboxgl.LngLatBounds();
        items.forEach(i => {
          const cat = getCat(i.category);
          const el = document.createElement('div');
          el.className = 'tiw-marker';
          el.innerHTML = `<div style="background:${cat.color};width:24px;height:24px;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${cat.emoji}</div>`;
          const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`<div style="font-weight:700;font-size:12px;color:#0F172A;white-space:nowrap">${i.title}</div>`);
          new mapboxgl.Marker(el).setLngLat([parseFloat(i.lon), parseFloat(i.lat)]).setPopup(popup).addTo(mapInstance);
          b.extend([parseFloat(i.lon), parseFloat(i.lat)]);
        });

        if (items.length > 1) {
          let unvisited = [...items];
          let ordered = [unvisited.shift()];
          let current = ordered[0];

          while (unvisited.length > 0) {
            let nearestIdx = 0, minDist = Infinity;
            unvisited.forEach((u, idx) => {
              const d = Math.pow(parseFloat(current.lon) - parseFloat(u.lon), 2) + Math.pow(parseFloat(current.lat) - parseFloat(u.lat), 2);
              if (d < minDist) { minDist = d; nearestIdx = idx; }
            });
            current = unvisited.splice(nearestIdx, 1)[0];
            ordered.push(current);
          }
          
          const coords = ordered.map(i => `${i.lon},${i.lat}`);
          const modeMap = { CAR: "driving", BIKE: "cycling", WALK: "walking", BUS: "driving" };
          const profile = modeMap[state.transportMode] || "driving";
          const routeColor = state.transportMode === "WALK" ? "#6366F1" : (state.transportMode === "BIKE" ? "#F59E0B" : "#14B8A6");
          
          try {
            const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords.join(';')}?geometries=geojson&access_token=${token}`);
            if (!res.ok) throw new Error(`Directions failed: ${res.status}`);
            const json = await res.json();
            if (json.routes?.[0]) {
              mapInstance.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: json.routes[0].geometry }});
              mapInstance.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': routeColor, 'line-width': 4, 'line-opacity': 0.8, 'line-dasharray': state.transportMode === "WALK" ? [2, 1] : [1] }});
            }
          } catch(err){ console.warn("Mapbox directions fetch failed", err); }
        }
        mapInstance.fitBounds(b, {padding: 60, maxZoom: 15});
        setTimeout(() => mapInstance && mapInstance.resize(), 500);
      });
    } catch (e) {
      console.error("Mapbox init failed, falling back to Leaflet", e);
      renderLeaflet(mapEl, items);
    }
  }

  async function renderLeaflet(el, items) {
    if (!window.L) {
      const l = document.createElement("link"); l.rel="stylesheet"; l.href="https://unpkg.com/leaflet/dist/leaflet.css"; document.head.appendChild(l);
      const s = document.createElement("script"); s.src="https://unpkg.com/leaflet/dist/leaflet.js"; 
      s.onload = () => renderLeaflet(el, items); document.head.appendChild(s);
      return;
    }
    if (mapInstance) { try { mapInstance.remove(); } catch(e){} mapInstance = null; }
    
    mapInstance = L.map(el, {attributionControl: false}).setView([items[0].lat, items[0].lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    items.forEach(i => {
      const cat = getCat(i.category);
      const icon = L.divIcon({
        className: 'tiw-leaflet-marker',
        html: `<div style="background:${cat.color};width:24px;height:24px;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${cat.emoji}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([i.lat, i.lon], {icon}).bindPopup(`<strong style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px">${i.title}</strong>`).addTo(mapInstance);
    });

    const group = new L.featureGroup(items.map(i => L.marker([i.lat, i.lon])));
    mapInstance.fitBounds(group.getBounds().pad(0.1));

    // Add Route Line via OSRM (Public instance)
    if (items.length > 1) {
      const coords = items.map(i => `${i.lon},${i.lat}`).join(';');
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
        const json = await res.json();
        if (json.routes?.[0]) {
          L.geoJSON(json.routes[0].geometry, {
            style: { color: '#14B8A6', weight: 4, opacity: 0.7 }
          }).addTo(mapInstance);
        }
      } catch(e) { console.warn("OSRM routing failed", e); }
    }
  }

  function renderCustomStops(root) {
    const list = root.querySelector("#tiw-custom-stops-list");
    list.innerHTML = state.customStops.map((stop, idx) => `
      <div class="tiw-stop-input-row">
        <input type="text" class="tiw-custom-stop-input" data-idx="${idx}" value="${stop}" placeholder="e.g. Specific Beach or Cafe" style="flex:1; padding:0.85rem; border-radius:10px; border:1px solid #F1F5F9; font-size:0.9rem">
        <button class="tiw-btn-remove" data-idx="${idx}">×</button>
      </div>
    `).join("");

    list.querySelectorAll(".tiw-custom-stop-input").forEach(input => {
      input.onchange = e => { state.customStops[e.target.dataset.idx] = e.target.value; };
    });
    list.querySelectorAll(".tiw-btn-remove").forEach(btn => {
      btn.onclick = () => { state.customStops.splice(btn.dataset.idx, 1); renderCustomStops(root); };
    });
  }

  function mount() {
    document.querySelectorAll(TARGET_SEL).forEach(root => {
      root.classList.add("tiw-root"); root.innerHTML = buildHTML();
      
      // Basic Actions
      root.querySelector("#tiw-btn-detect").onclick = () => detectLocation(root);
      root.querySelector("#tiw-btn-transport-mode").onclick = () => { showPhase("transport"); };
      root.querySelector("#tiw-btn-manual").onclick = () => { showPhase("setup"); renderInterests(root.querySelector("#tiw-interests")); renderDietary(root.querySelector("#tiw-dietary")); };
      root.querySelector("#tiw-btn-re-detect")?.addEventListener("click", () => detectLocation(root));
      root.querySelector("#tiw-btn-generate").onclick = () => generate(root);
      root.querySelector("#tiw-btn-generate-transport").onclick = () => generateTransport(root);
      root.querySelector("#tiw-btn-transport-back").onclick = () => showPhase("welcome");
      root.querySelector("#tiw-btn-reset").onclick = () => showPhase("welcome");
      root.querySelector("#tiw-btn-transport-reset").onclick = () => showPhase("welcome");
      
      // Initialize Autocomplete
      setupAutocomplete("tiw-input-dest", "tiw-suggestions-dest");
      setupAutocomplete("tiw-input-arr-pt", "tiw-suggestions-arr-pt");
      setupAutocomplete("tiw-input-dep-pt", "tiw-suggestions-dep-pt");
      setupAutocomplete("tiw-input-origin", "tiw-suggestions-origin");
      setupAutocomplete("tiw-input-transport-dest", "tiw-suggestions-transport-dest");

      // Set default dates to today
      const now = new Date();
      const localISO = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      
      const arrInput = root.querySelector("#tiw-input-arr");
      if (arrInput) arrInput.value = localISO;
      
      const depInput = root.querySelector("#tiw-input-dep");
      if (depInput) {
        // Default departure to 8 hours later or evening
        const depTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        depInput.value = depTime;
      }

      // Status Toggles
      const toggleLocal = root.querySelector("#tiw-toggle-local");
      const togglePre = root.querySelector("#tiw-toggle-pretrip");
      const arrivalSec = root.querySelector("#tiw-section-arrival");
      const arrivalInp = root.querySelector("#tiw-input-arr-pt");

      arrivalInp.oninput = () => { state.userLat = null; state.userLon = null; };

      toggleLocal.onclick = () => {
        state.travelStatus = "LOCAL";
        toggleLocal.classList.add("active"); togglePre.classList.remove("active");
        arrivalSec.style.opacity = "0.4"; arrivalSec.style.pointerEvents = "none";
        arrivalInp.value = "Current Location";
        detectLocation(root);
      };
      togglePre.onclick = () => {
        state.travelStatus = "PRE_TRIP";
        togglePre.classList.add("active"); toggleLocal.classList.remove("active");
        arrivalSec.style.opacity = "1"; arrivalSec.style.pointerEvents = "auto";
        if (arrivalInp.value === "Current Location") arrivalInp.value = "";
      };

      // Custom Stops
      root.querySelector("#tiw-btn-add-stop").onclick = () => {
        state.customStops.push("");
        renderCustomStops(root);
      };

      // Selectors (Budget, Group, Transport, etc)
      const setupSelector = (id, stateKey, attr) => {
        root.querySelector(`#${id}`).onclick = e => {
          const val = e.target.getAttribute(attr);
          if (val) {
            state[stateKey] = val;
            root.querySelectorAll(`#${id} .tiw-interest-chip`).forEach(c => {
              c.classList.toggle("active", c.getAttribute(attr) === val);
              c.classList.toggle("inactive", c.getAttribute(attr) !== val);
            });
          }
        };
      };

      setupSelector("tiw-budget-selector", "budgetTier", "data-tier");
      setupSelector("tiw-group-selector", "travelGroup", "data-type");
      setupSelector("tiw-transport-selector", "transportMode", "data-mode");

      document.addEventListener("click", e => { 
        root.querySelectorAll(".tiw-suggestions").forEach(list => {
          if (!root.contains(e.target)) list.style.display = "none";
        });
      });

      root.querySelector("#tiw-check-weather").onchange = e => { state.weatherAdaptive = e.target.checked; };

      root.querySelector("#tiw-interests").onclick = e => { 
        if (e.target.dataset.id) { 
          const id = e.target.dataset.id; 
          console.log("TIW: Toggling Interest:", id);
          if (state.activeInterests.includes(id)) state.activeInterests = state.activeInterests.filter(x => x !== id); 
          else state.activeInterests.push(id); 
          renderInterests(root.querySelector("#tiw-interests")); 
        } 
      };
      root.querySelector("#tiw-dietary").onclick = e => { 
        if (e.target.dataset.val) { 
          const val = e.target.dataset.val;
          console.log("TIW: Setting Dietary:", val);
          state.dietaryPreference = val; 
          renderDietary(root.querySelector("#tiw-dietary")); 
        } 
      };
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.TravelItineraryWidget = { mount };
})();

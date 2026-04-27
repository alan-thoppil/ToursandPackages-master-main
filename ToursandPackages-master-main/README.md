# Tours & Package — Extraordinary Expeditions

A premium, modern travel and tourism web application equipped with an AI-powered trip planner. Built with **React**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

---

## 🌟 Key Features

- **Parallax Hero Experience**: Immersive, multi-layer parallax entrance.
- **AI Trip Planner (Premium)**: A dynamic travel itinerary widget powered by **Groq AI (Llama 3.3)** and **OpenStreetMap**.
  - **High-Precision Geocoding**: Uses Nominatim for pinpoint accuracy in location searching.
  - **Real-time GPS Detection**: Captures user coordinates for "local" planning.
  - **Dynamic Route Maps**: Visualizes your daily path with Leaflet.js and OSRM.
  - **Intelligent Itineraries**: Crafts vivid, time-mapped schedules based on real POI data (OpenStreetMap).
- **Tour Listings**: Filterable grid of curated experiences.
- **Responsive & Premium UI**: Clean white-themed aesthetics with smooth micro-animations.

---

## 📂 Project Structure

This project is organized into two main parts:

- **Frontend (`/src`)**: The main React application built with Vite.
- **Backend (`/travel-itinerary-widget`)**: A standalone Node.js/Express server that handles AI orchestration and mapping data.
- **API Bridge (`/api`)**: A serverless function entry point (for Vercel) that proxies requests to the backend server.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18 or higher.
- **Groq API Key**: Get a free key at [console.groq.com](https://console.groq.com/).

### 2. Installation
```bash
# Clone the repo
git clone <your-repo-url>
cd ToursandPackages-master

# Install all dependencies
npm install
```

### 3. Configuration
Open **`travel-itinerary-widget/.env`** and add your keys:
```env
GROQ_API_KEY=your_groq_key_here
```

### 4. Run Locally (Unified Command)
We've unified the frontend and the AI backend into one easy command:
```bash
npm run dev:all
```
- **Frontend**: http://localhost:5173
- **AI Widget Server**: http://localhost:3001

---

## 📦 Deployment

### Vercel (Recommended)
This project is configured for a seamless one-click deployment on Vercel.

1. **Connect GitHub**: Push your code to a GitHub repo and link it to Vercel.
2. **Environment Variables**: Add `GROQ_API_KEY` in your Vercel Project Settings.
3. **Automatic Routing**: The included `vercel.json` automatically configures the **Serverless Functions** to handle both the React SPA and the AI API.

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion.
- **AI/Backend**: Node.js, Express, Groq (Llama 3.3).
- **Mapping**: Leaflet.js (UI), Nominatim (Geocoding), OSRM (Directions), OpenStreetMap (POIs).

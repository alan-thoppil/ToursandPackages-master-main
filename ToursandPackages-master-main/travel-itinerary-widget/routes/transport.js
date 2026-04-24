import { Router } from "express";
import { createLogger } from "../lib/logger.js";

const router = Router();
const log    = createLogger("transport");

const GROQ_MODEL   = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    log.error("GROQ_API_KEY is missing from process.env");
    throw new Error("GROQ_API_KEY is not set in .env");
  }

  const res = await fetch(GROQ_API_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      temperature: 0.5, // Lower temperature for more factual transport info
      max_tokens:  2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role:    "system",
          content: "You are a professional travel planning assistant. You provide realistic, practical transportation options between cities. You respond ONLY with a JSON object.",
        },
        {
          role:    "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq API error ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content;
}

router.post("/", async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination are required" });
  }

  const prompt = `
    You are a travel planning assistant.
    Plan a trip from ${origin} to ${destination} using available transportation options.

    Requirements:
    - Do NOT invent unrealistic routes.
    - Use commonly available transport modes: flights, trains, buses, taxis, or car travel.
    - Prefer practical and commonly used routes.

    Instructions:
    1. Return 2–3 best travel options only (avoid too many).
    2. Each option must include:
       - Transport modes (e.g., flight + taxi)
       - Step-by-step route
       - Total travel time (realistic estimate)
       - Estimated cost range (in local currency)
       - Key transfer locations
    3. Rank options:
       - First: best overall (fastest or based on user preference)
       - Second: cheapest
       - Third: alternative (if applicable)
    4. Avoid unnecessary explanations—keep output structured and concise.
    5. If no direct route exists, include logical connections.

    Output strictly in JSON format:
    {
      "options": [
        {
          "rank": 1,
          "title": "Best Option",
          "mode": "Flight + Taxi",
          "steps": ["Step 1", "Step 2"],
          "duration": "5h 30m",
          "cost": "₹4000 - ₹6000",
          "transfers": ["Airport A", "City B"]
        }
      ]
    }
  `;

  try {
    const rawText = await callGroq(prompt);
    const data = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    res.json({ success: true, ...data });
  } catch (err) {
    log.error("Transport API error", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

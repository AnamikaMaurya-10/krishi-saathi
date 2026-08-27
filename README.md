# KrishiSaathi — Smart Crop Advisory & Farmer Support

**Hackathon Problem: PS-02 | Smart Crop Advisory & Farmer Distress Early-Warning System**

A multilingual, mobile-first farmer decision-support platform that combines real weather data, crop information, market prices, and rainfall analysis to generate actionable advisories and an explainable Farmer Financial Distress Risk score.

## Problem

Farmers in India often lack timely, localized advisory on crop health, weather risk, rainfall variability, market prices, and government support. This can lead to crop losses, poor selling decisions, debt distress, and delayed intervention.

## Solution

KrishiSaathi provides two connected modules:

### Module A — Smart Crop Advisory Engine
- Real-time weather from Open-Meteo API
- Rainfall deviation tracking against district normals
- Crop-stage-specific farming recommendations
- Market price comparison across nearby mandis
- Multilingual voice-enabled advisories (English, Odia, Hindi)

### Module B — Farmer Distress Early-Warning System
- Transparent, explainable weighted risk scoring (0–100)
- Contributing factors: rainfall deviation (40%), market price decline (35%), loan due proximity (25%)
- Why-this-matters explanations in plain language
- Suggested interventions for agriculture officers
- Prioritized farmer list for officers

**Important**: This system does NOT claim to medically or psychologically diagnose a farmer or predict suicide. It is called "Farmer Financial Distress Risk" — a decision-support flag.

## Architecture

```
Frontend (React + Vite + Tailwind CSS + shadcn/ui)
    ↓
Services Layer (weather, market, risk, advisory, i18n, voice)
    ↓
Data Layer (Open-Meteo API, AGMARKNET datasets, sample data)
    ↓
Backend (Convex - auth, user data, schema)
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 4, shadcn/ui (New York) |
| Icons | Lucide React |
| Animation | Framer Motion |
| Routing | React Router 7 |
| Backend | Convex (auth, data) |
| Weather API | Open-Meteo (free, no API key) |
| Market Data | AGMARKNET dataset-based reference prices |
| Speech | Web Speech API (browser native) |
| i18n | Custom locale files (en, od, hi) |
| Package Manager | Bun |

## Setup

```bash
# Install dependencies
bun install

# Start development (Freebuff runs this automatically)
bun run dev
```

The application starts in demo mode with sample data. No additional configuration needed.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL (managed by Freebuff) |

Weather API (Open-Meteo) does NOT require an API key.

## Risk Scoring Formula

```
distress_score = 0.40 × rainfall_risk + 0.35 × price_risk + 0.25 × loan_risk

Rainfall Risk (0-100):
  0-10% deviation  → 15 (Low)
  10-20% deviation → 45 (Moderate)
  20-30% deviation → 70 (High)
  >30% deviation   → 90 (Very High)

Market Price Risk (0-100):
  0-5% decline   → 15 (Low)
  5-10% decline  → 45 (Moderate)
  10-20% decline → 70 (High)
  >20% decline   → 90 (Very High)

Loan Proximity Risk (0-100):
  >60 days  → 15 (Low)
  31-60 days → 45 (Moderate)
  15-30 days → 70 (High)
  ≤14 days   → 90 (Very High)

Risk Categories:
  0-34   = LOW (Green)
  35-64  = MEDIUM (Amber)
  65-100 = HIGH (Red)
```

Thresholds are configurable in `src/data/riskThresholds.ts`.

## Advisory Engine

The rule-based advisory engine combines:
- Weather conditions (temperature, humidity, rainfall)
- Rainfall deviation from normal
- Crop type and growth stage
- Soil type and irrigation availability
- Market price trends

Example rules:
- Low rainfall + no irrigation → Urgent irrigation advisory
- High temperature → Heat stress warning
- Price decline > 10% → Market selling suggestion
- Paddy at reproductive stage → Water management advice

## Multilingual Support

| Language | Code | Coverage |
|----------|------|----------|
| English | en | Full |
| Odia (ଓଡ଼ିଆ) | od | Full |
| Hindi (हिन्दी) | hi | Full |

Translation files: `src/locales/en.json`, `src/locales/od.json`, `src/locales/hi.json`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with project overview |
| `/dashboard` | Farmer dashboard (main page) |
| `/weather` | Detailed weather & forecast |
| `/market` | Mandi price comparison |
| `/officer` | Agriculture officer dashboard |
| `/profile` | Farmer profile & details |
| `/auth` | Authentication (Convex Auth) |

## Demo Flow

1. Farmer Ramesh opens KrishiSaathi → sees Sambalpur weather
2. System fetches real Open-Meteo data → identifies rainfall deviation
3. Generates irrigation advisory → shows market prices
4. Calculates distress risk: 79/100 (HIGH)
5. Officer dashboard auto-prioritizes Ramesh
6. Officer sees exact reasons and suggested interventions

## Project Structure

```
src/
  components/     # UI components (WeatherCard, RiskScoreCard, etc.)
  contexts/       # React contexts (LanguageContext)
  data/           # Data files (farmers, crops, market prices, thresholds)
  hooks/          # Custom hooks (useWeather)
  lib/            # Utilities
  locales/        # Translation files (en, od, hi)
  pages/          # Route pages (Dashboard, Weather, Market, Officer, Profile)
  services/       # Business logic (weather, advisory, risk, i18n, voice)
  convex/         # Convex backend (schema, auth, users)
```

## Known Limitations

1. Market prices are dataset-based reference values, not live AGMARKNET feeds
2. Risk model is deterministic (not ML-based) — by design for explainability
3. Farmer data is sample/demo data for 20 fictional farmers
4. Voice synthesis depends on browser Web Speech API availability
5. No real SMS/phone integration for officer actions (demo interactions)
6. Offline PWA not yet implemented

## Future Improvements

1. Live AGMARKNET API integration for real-time prices
2. ML-based risk model layer (optional, with explainability)
3. SMS/WhatsApp notifications for advisories
4. PWA with offline support
5. Real-time observed rainfall from IMD stations
6. SoilGrids API integration for soil data
7. Expansion to more crops and districts
8. Farmer registration and authentication flow
9. Government scheme eligibility checker
10. Voice input for farmer queries

## License

Prototype for hackathon demonstration purposes.

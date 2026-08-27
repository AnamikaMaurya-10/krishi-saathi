# KrishiSaathi — Data Sources

## Weather Data

### Open-Meteo API
- **URL**: https://api.open-meteo.com
- **Purpose**: Real-time weather data and 7-day forecast
- **Fields used**: temperature, humidity, precipitation, wind speed, weather code, daily forecast
- **Update frequency**: Real-time (hourly)
- **License**: CC BY 4.0 (free for non-commercial use)
- **API Key**: Not required (free tier)
- **Fallback**: Hardcoded cached weather data when API is unavailable
- **Configuration**: Uses district coordinates (Sambalpur: 21.4669°N, 83.9812°E)

## Market / Mandi Price Data

### AGMARKNET (Dataset-based Reference)
- **URL**: https://agmarknet.gov.in
- **Purpose**: Agricultural commodity prices across Indian mandis
- **Fields used**: Market name, commodity, min price, max price, modal price
- **Update frequency**: Dataset-based (not real-time) — reference prices for demonstration
- **License**: Government of India open data
- **Coverage**: Sambalpur, Bargarh, Jharsuguda, Sundargarh, Subarnapur, Balangir
- **Crops covered**: Paddy (Common), Maize, Groundnut
- **Fallback**: Hardcoded reference prices

### Price Trend Data
- Historical prices are based on typical seasonal price patterns for paddy in Western Odisha
- Reference period: July–August 2025
- Prices represent approximate modal prices in ₹/quintal

## Rainfall Data

### India Meteorological Department (IMD)
- **Source**: IMD long-period averages, data.gov.in
- **Purpose**: Normal (average) monsoon rainfall by district
- **Fields used**: District, monthly normal rainfall (mm), seasonal normal
- **Coverage**: Sambalpur, Bargarh, Jharsuguda, Sundargarh, Subarnapur, Balangir, Anugul
- **Normal rainfall range**: 880–1050 mm (June–September)
- **Fallback**: District-level averages hardcoded in `/data/rainNormals.ts`

## Crop Data

### ICAR / Government Agricultural Calendars
- **Sources**: ICAR crop calendars, state agricultural university publications
- **Purpose**: Crop growth stages, water requirements, temperature sensitivities
- **Crops**: Paddy (Rice), Maize, Groundnut
- **Fields**: Growth stages with day ranges, water needs, temperature range, advisory rules
- **Fallback**: Embedded in `/data/crops.ts`

## Soil Data

- Soil type entered by farmer (Loamy, Clay, Sandy, Other)
- Based on general soil classification for Western Odisha districts
- No external API dependency

## Sample Farmer Data

- 20 fictional farmers with realistic profiles
- Villages/areas around Sambalpur, Bargarh, Jharsuguda (Western Odisha)
- Internally consistent: loan amounts, due dates, risk profiles
- No real people's private information used

## Government Scheme Information

- **PMFBY**: Pradhan Mantri Fasal Bima Yojana (https://pmfby.gov.in)
- **KCC**: Kisan Credit Card
- **PM-KISAN**: Direct income support scheme (https://pmkisan.gov.in)
- **PMKSY**: Pradhan Mantri Krishi Sinchayee Yojana (https://pmksy.gov.in)
- **Soil Health Card**: https://soilhealth.dac.gov.in
- Eligibility verification deferred to relevant departments

## Data Architecture

```
┌─────────────────┐
│   External APIs  │ ← Open-Meteo (weather)
│   & Datasets     │ ← AGMARKNET (market prices)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Service Layer   │ ← weatherService.ts, marketPrices.ts
│  (Data Adapters) │    rainNormals.ts, advisoryEngine.ts
└────────┬────────┘
         ↓
┌─────────────────┐
│  Normalized     │ ← WeatherData, MarketPrice, CropInfo
│  Internal Model │    Farmer, RiskResult, Advisory
└────────┬────────┘
         ↓
┌─────────────────┐
│  Application    │ ← React components & pages
│  (UI Layer)     │
└─────────────────┘

If API fails → Cached/sample dataset → Application continues
```

## Limitations

1. Market prices are dataset-based reference values, not live AGMARKNET feeds
2. Rainfall deviation uses forecast data against historical normals (not actual observed rainfall)
3. Soil data is farmer-entered, not from SoilGrids or other soil databases
4. Weather forecasts limited to 7-day horizon
5. Risk model is deterministic and explainable — not ML-based
6. Multilingual translations may need refinement by native speakers

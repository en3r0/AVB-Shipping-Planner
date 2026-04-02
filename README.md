# AVB Shipping Planner

A delivery zone planning tool for AVB members. Define store locations, set delivery radii and pricing, and generate zip code–based shipping rules for Magento.

## Features

- **Multi-location support** — Add multiple store locations and geocode addresses via Google Maps
- **Delivery zones** — Up to 5 concentric zones per location with configurable radius and pricing
- **Category pricing** — Optional per-category pricing (e.g., Furniture vs. Electronics)
- **Interactive map** — Live Google Maps visualization of delivery zones
- **Export CSV** — Download matching zip codes with distances and prices
- **Export Rules** — Generate Magento-ready shipping rule CSVs
- **Dark / Light mode** — Toggle between themes
- **Resizable sidebar** — Drag to adjust the control panel width

## Setup

```bash
npm install
cp .env.example .env
# Add your Google Maps API key to .env
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (Geocoding + Maps JavaScript API) |

## Deployment

Pushes to `main` trigger automatic deployment to GitHub Pages via the included workflow.

## Tech Stack

React 19 · Vite · Google Maps API · us-zips · Lucide Icons

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

## Requirements

- **Node.js**: v18.0.0 or higher (for building the app)
- **Package Manager**: npm, yarn, or pnpm

## Setup Instructions

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd avb-shipping-planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and assign your Google Maps API key to `VITE_GOOGLE_MAPS_API_KEY`.
   *(Note: Ensure your key has the **Geocoding API** and **Maps JavaScript API** enabled in the Google Cloud Console).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (Geocoding + Maps JavaScript API) |

## Hosting Requirements & Deployment

The AVB Shipping Planner is a purely client-side application (React + Vite). It does **not** require a Node.js backend or database.

- **Hosting Solutions**: Any static file hosting service can be used (e.g., GitHub Pages, AWS S3, Vercel, Netlify, Cloudflare Pages, Firebase Hosting, or a traditional Apache/Nginx web server).
- **Building for Production**: 
  1. Run `npm run build` locally or in your CI/CD pipeline.
  2. The bundled static HTML, CSS, and JS files will be generated in the `dist/` directory.
  3. Upload the contents of the `dist/` directory to your static web host.

**GitHub Pages Automation:** By default, pushes to the `main` branch will trigger an automatic deployment to GitHub Pages via the included GitHub Actions workflow.
## Tech Stack

React 19 · Vite · Google Maps API · us-zips · Lucide Icons

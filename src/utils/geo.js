import usZips from 'us-zips';

// Haversine formula to calculate distance between two coordinates
export function getDistance(lat1, lon1, lat2, lon2, unit = 'mi') {
  const R = unit === 'mi' ? 3958.8 : 6371; // Earth's radius in miles or km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get all zip codes within a set of zones.
// A zip code belongs to the SMALLEST zone it falls into.
// When categoryPricingEnabled is true, each result includes categoryPrices.
export function calculateZipCodesForZones(centerLat, centerLng, zones, unit = 'mi', categoryPricingEnabled = false, categories = []) {
  if (!centerLat || !centerLng || !zones || zones.length === 0) return [];

  // Sort zones by radius (smallest to largest)
  const sortedZones = [...zones].sort((a, b) => Number(a.radius) - Number(b.radius));
  
  const results = [];
  
  // Iterate through all US zip codes
  for (const [zip, coords] of Object.entries(usZips)) {
    const { latitude, longitude } = coords;
    const distance = getDistance(centerLat, centerLng, latitude, longitude, unit);
    
    // Find the smallest zone this zip code falls into
    const matchingZone = sortedZones.find(zone => distance <= Number(zone.radius));
    
    if (matchingZone) {
      // Use the zone's position in the sorted list (1-indexed) as a human-readable zone number
      const zoneNumber = sortedZones.indexOf(matchingZone) + 1;
      const result = {
        zipCode: zip,
        distance: distance.toFixed(2),
        price: matchingZone.price,
        zoneId: zoneNumber,
        color: matchingZone.color
      };

      // Include category prices when enabled
      if (categoryPricingEnabled && categories.length > 0) {
        result.categoryPrices = {};
        categories.forEach(cat => {
          result.categoryPrices[cat] = matchingZone.categoryPrices?.[cat] || matchingZone.price || '';
        });
      }

      results.push(result);
    }
  }
  
  // Sort results by distance
  return results.sort((a, b) => Number(a.distance) - Number(b.distance));
}

// Calculate zip codes across multiple locations, deduplicating by zip code.
// When a zip appears from multiple locations, the entry with the shortest distance wins.
export function calculateZipCodesForMultipleLocations(locations, zones, unit = 'mi', categoryPricingEnabled = false, categories = []) {
  if (!locations || locations.length === 0 || !zones || zones.length === 0) return [];

  // Collect results from all locations
  const zipMap = new Map();

  for (const [index, location] of locations.entries()) {
    const locationResults = calculateZipCodesForZones(
      location.lat, location.lng, zones, unit, categoryPricingEnabled, categories
    );

    for (const result of locationResults) {
      const existing = zipMap.get(result.zipCode);
      if (!existing || Number(result.distance) < Number(existing.distance)) {
        // Tag the winning result with its fulfilled location
        result.locationLabel = location.label || `Location ${index + 1}`;
        zipMap.set(result.zipCode, result);
      }
    }
  }

  // Convert map to array and sort by distance
  return Array.from(zipMap.values()).sort((a, b) => Number(a.distance) - Number(b.distance));
}

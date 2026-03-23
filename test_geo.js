import { getDistance, calculateZipCodesForZones, calculateZipCodesForMultipleLocations } from './src/utils/geo.js';

const loc1 = { id: '1', lat: 36.1389, lng: -115.2245 }; // Vegas
const loc2 = { id: '2', lat: 36.0395, lng: -114.9817 }; // Henderson (near Vegas)

const zones = [
  { id: 'z1', radius: '10', price: '10' },
  { id: 'z2', radius: '25', price: '25' }
];

console.log('--- One Location (Vegas) ---');
const res1 = calculateZipCodesForMultipleLocations([loc1], zones, 'mi');
const z1Count1 = res1.filter(r => r.zoneId === 1).length;
const z2Count1 = res1.filter(r => r.zoneId === 2).length;
console.log(`Zone 1 count: ${z1Count1}`);
console.log(`Zone 2 count: ${z2Count1}`);
console.log(`Total: ${res1.length}`);

console.log('\n--- Two Locations (Vegas + Henderson) ---');
const res2 = calculateZipCodesForMultipleLocations([loc1, loc2], zones, 'mi');
const z1Count2 = res2.filter(r => r.zoneId === 1).length;
const z2Count2 = res2.filter(r => r.zoneId === 2).length;
console.log(`Zone 1 count: ${z1Count2}`);
console.log(`Zone 2 count: ${z2Count2}`);
console.log(`Total: ${res2.length}`);


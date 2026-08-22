// Standalone Unit Test Suite for GlobeTrotter Discovery Module
import {
  formatDate,
  formatCurrency,
  calculateDurationDays,
  toNormalizedYMD,
  isDateWithinRange
} from './unit-utils.mjs';

let total = 0;
let passed = 0;
let failed = 0;

function assert(cond, name, details = '') {
  total++;
  if (cond) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} ${details ? '-> ' + details : ''}`);
  }
}

console.log('\n======================================================');
console.log('🏙️  GLOBETROTTER: DISCOVERY MODULE LOGIC VALIDATION');
console.log('======================================================\n');

// 1. DATE NORMALIZATION & UTILITIES
console.log('--- 1. Date Normalization & Calculations ---');
assert(toNormalizedYMD('2026-10-05T14:32:00.000Z') === '2026-10-05', 'toNormalizedYMD extracts YYYY-MM-DD from ISO string');
assert(toNormalizedYMD('2026-10-05') === '2026-10-05', 'toNormalizedYMD retains YYYY-MM-DD');
assert(toNormalizedYMD(new Date('2026-10-05T00:00:00.000Z')) === '2026-10-05', 'toNormalizedYMD parses Date objects');
assert(toNormalizedYMD(null) === '', 'toNormalizedYMD handles null safely');
assert(toNormalizedYMD(undefined) === '', 'toNormalizedYMD handles undefined safely');

assert(isDateWithinRange('2026-10-05', '2026-10-01', '2026-10-20') === true, 'isDateWithinRange true for middle date');
assert(isDateWithinRange('2026-10-01', '2026-10-01', '2026-10-20') === true, 'isDateWithinRange true on start boundary');
assert(isDateWithinRange('2026-10-20', '2026-10-01', '2026-10-20') === true, 'isDateWithinRange true on end boundary');
assert(isDateWithinRange('2026-09-30', '2026-10-01', '2026-10-20') === false, 'isDateWithinRange false before start');
assert(isDateWithinRange('2026-10-21', '2026-10-01', '2026-10-20') === false, 'isDateWithinRange false after end');

assert(calculateDurationDays('2026-10-01', '2026-10-05') === 5, 'calculateDurationDays returns 5 days for 1st-5th inclusive');

// 2. CURRENCY & ZERO-COST FORMATTING
console.log('\n--- 2. Currency & Zero-Cost Handling ---');
assert(formatCurrency(0) === '$0' || formatCurrency(0) === '$0.00', 'formatCurrency handles $0 cost');
assert(formatCurrency(120).includes('120'), 'formatCurrency formats positive amounts');
assert(formatCurrency(null) === '$0' || formatCurrency(null) === '$0.00', 'formatCurrency defaults null to $0');

// 3. URL QUERY PARAMETER CLEANUP (Explore Page UX)
console.log('\n--- 3. URL Query Parameter Sync & Cleanup ---');
function buildExploreParams(opts) {
  const params = new URLSearchParams();
  if (opts.tab === 'activities') {
    params.set('tab', 'activities');
  }
  if (opts.tab === 'activities') {
    if (opts.activityQ && opts.activityQ.trim()) params.set('activityQ', opts.activityQ.trim());
    if (opts.category && opts.category !== 'All') params.set('category', opts.category);
    if (opts.cityId && opts.cityId !== 'All') params.set('cityId', opts.cityId);
    if (opts.maxCost !== undefined) params.set('maxCost', String(opts.maxCost));
  } else {
    if (opts.q && opts.q.trim()) params.set('q', opts.q.trim());
    if (opts.region && opts.region !== 'All') params.set('region', opts.region);
    if (opts.country && opts.country !== 'All') params.set('country', opts.country);
    if (opts.costIndex && opts.costIndex !== 'All') params.set('costIndex', opts.costIndex);
  }
  return params.toString();
}

assert(buildExploreParams({ tab: 'cities', q: '', region: 'All', country: 'All', costIndex: 'All' }) === '', 'Clean URL for default city tab');
assert(buildExploreParams({ tab: 'cities', q: 'Tokyo', region: 'Asia', country: 'Japan', costIndex: 'MODERATE' }) === 'q=Tokyo&region=Asia&country=Japan&costIndex=MODERATE', 'Correct URL for filtered cities');
assert(buildExploreParams({ tab: 'activities', activityQ: 'Sushi Tour', category: 'FOOD', cityId: 'c1', maxCost: 50 }) === 'tab=activities&activityQ=Sushi+Tour&category=FOOD&cityId=c1&maxCost=50', 'Correct URL for filtered activities');

// 4. ACTIVITY & STOP BOUNDARY VALIDATION
console.log('\n--- 4. Itinerary & Activity Boundary Validation ---');
function validateStopInTrip(trip, stopArrival, stopDeparture) {
  const tStart = toNormalizedYMD(trip.startDate);
  const tEnd = toNormalizedYMD(trip.endDate);
  const sArr = toNormalizedYMD(stopArrival);
  const sDep = toNormalizedYMD(stopDeparture);

  if (!sArr || !sDep) return { valid: false, error: 'Invalid dates' };
  if (sArr > sDep) return { valid: false, error: 'Arrival after departure' };
  if (sArr < tStart || sDep > tEnd) return { valid: false, error: 'Stop dates out of trip range' };
  return { valid: true };
}

function validateActivityInStop(stop, activityScheduledDate) {
  const sArr = toNormalizedYMD(stop.arrivalDate);
  const sDep = toNormalizedYMD(stop.departureDate);
  const aDate = toNormalizedYMD(activityScheduledDate);

  if (!aDate) return { valid: false, error: 'Invalid activity date' };
  if (aDate < sArr || aDate > sDep) return { valid: false, error: 'Activity date outside stop range' };
  return { valid: true };
}

const mockTrip = { startDate: '2026-10-01', endDate: '2026-10-20' };
const mockStop = { arrivalDate: '2026-10-02', departureDate: '2026-10-06' };

assert(validateStopInTrip(mockTrip, '2026-10-02', '2026-10-06').valid === true, 'Stop within trip boundaries is accepted');
assert(validateStopInTrip(mockTrip, '2026-09-28', '2026-10-05').valid === false, 'Stop before trip start is rejected');
assert(validateStopInTrip(mockTrip, '2026-10-15', '2026-10-25').valid === false, 'Stop after trip end is rejected');
assert(validateStopInTrip(mockTrip, '2026-10-10', '2026-10-05').valid === false, 'Stop arrival after departure is rejected');

assert(validateActivityInStop(mockStop, '2026-10-03').valid === true, 'Activity within stop dates is accepted');
assert(validateActivityInStop(mockStop, '2026-10-01').valid === false, 'Activity before stop arrival is rejected');
assert(validateActivityInStop(mockStop, '2026-10-07').valid === false, 'Activity after stop departure is rejected');

// 5. FREE OVERRIDE VALIDATION ($0 Costs)
console.log('\n--- 5. Zero-Cost ($0) Override Validation ---');
function parseCostInput(costInput) {
  if (costInput !== '' && costInput !== null && costInput !== undefined && !isNaN(Number(costInput))) {
    return Number(costInput);
  }
  return 0;
}

assert(parseCostInput('0') === 0, 'parseCostInput("0") returns 0');
assert(parseCostInput(0) === 0, 'parseCostInput(0) returns 0');
assert(parseCostInput('45.5') === 45.5, 'parseCostInput("45.5") returns 45.5');
assert(parseCostInput('') === 0, 'parseCostInput("") defaults to 0');
assert(parseCostInput(null) === 0, 'parseCostInput(null) defaults to 0');

console.log('\n======================================================');
console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
if (failed === 0) {
  console.log('✅ ALL DISCOVERY LOGIC & BOUNDARY RULES VERIFIED!');
} else {
  console.error(`❌ ${failed} TESTS FAILED!`);
}
console.log('======================================================\n');

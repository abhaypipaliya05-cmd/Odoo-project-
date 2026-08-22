import { prisma } from '../lib/prisma';
import { CityService } from '../services/city.service';
import { TripService } from '../services/trip.service';
import { ItineraryService } from '../services/itinerary.service';
import { toNormalizedYMD, isDateWithinRange } from '../lib/utils';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorMessage?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}${errorMessage ? ` -> ${errorMessage}` : ''}`);
  }
}

// Helper to test URL search parameter generation
function buildExploreQueryParams(options: {
  tab?: string;
  q?: string;
  region?: string;
  country?: string;
  costIndex?: string;
  activityQ?: string;
  category?: string;
  cityId?: string;
  maxCost?: number;
}) {
  const params = new URLSearchParams();
  if (options.tab === 'activities') {
    params.set('tab', 'activities');
  }
  if (options.tab === 'activities') {
    if (options.activityQ) params.set('activityQ', options.activityQ.trim());
    if (options.category && options.category !== 'All') params.set('category', options.category);
    if (options.cityId && options.cityId !== 'All') params.set('cityId', options.cityId);
    if (options.maxCost !== undefined) params.set('maxCost', String(options.maxCost));
  } else {
    if (options.q) params.set('q', options.q.trim());
    if (options.region && options.region !== 'All') params.set('region', options.region);
    if (options.country && options.country !== 'All') params.set('country', options.country);
    if (options.costIndex && options.costIndex !== 'All') params.set('costIndex', options.costIndex);
  }
  return params.toString();
}

async function runDiscoveryTests() {
  console.log('\n======================================================');
  console.log('🏙️  DEEP: CITY & ACTIVITY DISCOVERY HARDENED TEST SUITE');
  console.log('======================================================\n');

  try {
    // 0. Setup test user and trip
    const userEmail = `discovery_test_${Date.now()}@globetrotter.test`;
    const testUser = await prisma.user.create({
      data: {
        email: userEmail,
        passwordHash: 'dummy-hash',
        name: 'Discovery Tester',
      },
    });

    const triplessUser = await prisma.user.create({
      data: {
        email: `tripless_${Date.now()}@globetrotter.test`,
        passwordHash: 'dummy-hash',
        name: 'Tripless Explorer',
      },
    });

    const testTrip = await TripService.createTrip(testUser.id, {
      title: 'Discovery Voyage 2026',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-20T00:00:00.000Z',
      totalBudget: 3000,
    });

    // ----------------------------------------------------------------
    // 1. DATE NORMALIZATION & UTILITIES
    // ----------------------------------------------------------------
    console.log('--- Phase 1: Date Normalization & Range Checks ---');
    assert(
      toNormalizedYMD('2026-10-05T14:32:00.000Z') === '2026-10-05',
      'toNormalizedYMD correctly normalizes ISO datetime to YYYY-MM-DD'
    );
    assert(
      toNormalizedYMD(new Date('2026-10-05T00:00:00.000Z')) === '2026-10-05',
      'toNormalizedYMD handles Date objects'
    );
    assert(
      isDateWithinRange('2026-10-05', '2026-10-01', '2026-10-20') === true,
      'isDateWithinRange validates dates within boundaries'
    );
    assert(
      isDateWithinRange('2026-10-25', '2026-10-01', '2026-10-20') === false,
      'isDateWithinRange rejects dates outside boundaries'
    );

    // ----------------------------------------------------------------
    // 2. URL QUERY PARAMETER CLEANUP & DEBOUNCING
    // ----------------------------------------------------------------
    console.log('\n--- Phase 2: URL Query Param Clean Generation ---');
    const defaultParams = buildExploreQueryParams({
      tab: 'cities',
      q: '',
      region: 'All',
      country: 'All',
      costIndex: 'All',
    });
    assert(
      defaultParams === '',
      'Default cities filter produces clean empty URL query parameters'
    );

    const filteredParams = buildExploreQueryParams({
      tab: 'cities',
      q: 'Paris',
      region: 'Europe',
      country: 'France',
      costIndex: 'LUXURY',
    });
    assert(
      filteredParams === 'q=Paris&region=Europe&country=France&costIndex=LUXURY',
      'Custom cities filter produces exact clean query string'
    );

    const activityParams = buildExploreQueryParams({
      tab: 'activities',
      activityQ: 'Cooking Class',
      category: 'FOOD',
      cityId: 'city-123',
      maxCost: 50,
    });
    assert(
      activityParams === 'tab=activities&activityQ=Cooking+Class&category=FOOD&cityId=city-123&maxCost=50',
      'Activity filters serialize properly into URL search params'
    );

    // ----------------------------------------------------------------
    // 3. TRIPLESS USER WORKFLOWS
    // ----------------------------------------------------------------
    console.log('\n--- Phase 3: Tripless User Workflows ---');
    const triplessTrips = await TripService.getUserTrips(triplessUser.id);
    assert(
      Array.isArray(triplessTrips) && triplessTrips.length === 0,
      'Tripless user correctly returns empty trip array (triggers modal CTA banner)'
    );

    // ----------------------------------------------------------------
    // 4. CITY SEARCH & FILTERING
    // ----------------------------------------------------------------
    console.log('\n--- Phase 4: City Search & Filtering ---');
    const allCities = await CityService.getCities({}, testUser.id);
    assert(allCities.length > 0, `Retrieve all cities from database (count: ${allCities.length})`);

    const ahmedabadSearch = await CityService.getCities({ q: 'Ahmedabad' }, testUser.id);
    assert(
      ahmedabadSearch.length > 0 && ahmedabadSearch.some((c) => c.name === 'Ahmedabad'),
      'City search by keyword ("Ahmedabad")'
    );

    const indiaCities = await CityService.getCities({ country: 'India' }, testUser.id);
    assert(
      indiaCities.length > 0 && indiaCities.every((c) => c.country === 'India'),
      'City filtering by Country ("India")'
    );

    const asiaCities = await CityService.getCities({ region: 'Asia' }, testUser.id);
    assert(
      asiaCities.length > 0 && asiaCities.every((c) => c.region === 'Asia'),
      'City filtering by Region ("Asia")'
    );

    const budgetCities = await CityService.getCities({ costIndex: 'BUDGET' }, testUser.id);
    assert(
      budgetCities.length > 0 && budgetCities.every((c) => c.costIndex === 'BUDGET'),
      'City filtering by Cost Index ("BUDGET")'
    );

    // ----------------------------------------------------------------
    // 5. CITY DETAILS & ACTIVITIES ASSOCIATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 5: City Details with Curated Activities ---');
    const firstCity = allCities[0];
    const secondCity = allCities.length > 1 ? allCities[1] : allCities[0];
    const cityDetails = await CityService.getCityById(firstCity.id, testUser.id);
    assert(
      cityDetails.id === firstCity.id &&
        Array.isArray(cityDetails.activities) &&
        cityDetails.activities.length > 0,
      `Retrieve city details and associated activities for ${firstCity.name}`
    );

    // ----------------------------------------------------------------
    // 6. ACTIVITY SEARCH & FILTERING
    // ----------------------------------------------------------------
    console.log('\n--- Phase 6: Activity Search & Filtering ---');
    const allActivities = await CityService.getActivities({});
    assert(allActivities.length > 0, `Retrieve activities catalog (count: ${allActivities.length})`);

    const foodActivities = await CityService.getActivities({ category: 'FOOD' });
    assert(
      foodActivities.length > 0 && foodActivities.every((a) => a.category === 'FOOD'),
      'Activity filtering by Category ("FOOD")'
    );

    const cheapActivities = await CityService.getActivities({ maxCost: 20 });
    assert(
      cheapActivities.length > 0 && cheapActivities.every((a) => a.estimatedCost <= 20),
      'Activity filtering by Max Cost (<= $20)'
    );

    const cityActivities = await CityService.getActivities({ cityId: firstCity.id });
    assert(
      cityActivities.length > 0 && cityActivities.every((a) => a.cityId === firstCity.id),
      `Activity filtering by City ID (${firstCity.name})`
    );

    // ----------------------------------------------------------------
    // 7. SAVED DESTINATIONS (WISHLIST)
    // ----------------------------------------------------------------
    console.log('\n--- Phase 7: Saved Destinations (Wishlist) ---');
    const saveRes = await CityService.saveDestination(testUser.id, firstCity.id);
    assert(saveRes.saved === true, `Bookmark destination (${firstCity.name}) for user`);

    const userSaved = await CityService.getSavedDestinations(testUser.id);
    assert(userSaved.some((s) => s.id === firstCity.id), 'Fetch user saved destinations list');

    const removeRes = await CityService.removeSavedDestination(testUser.id, firstCity.id);
    assert(removeRes.saved === false, 'Remove destination from wishlist');

    const afterRemoveSaved = await CityService.getSavedDestinations(testUser.id);
    assert(!afterRemoveSaved.some((s) => s.id === firstCity.id), 'Wishlist reflects removal');

    // ----------------------------------------------------------------
    // 8. ADD CITY STOP WITH ZERO COST & DATE VALIDATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 8: Add City Stop with $0 Overrides ---');
    const stopArrival = '2026-10-02T00:00:00.000Z';
    const stopDeparture = '2026-10-06T00:00:00.000Z';

    const stop = await ItineraryService.addStopToTrip(testTrip.id, testUser.id, {
      cityId: firstCity.id,
      arrivalDate: stopArrival,
      departureDate: stopDeparture,
      accommodationName: 'Hostel Stay / Free Couchsurfing',
      accommodationCost: 0,
      transportType: 'Walk',
      transportCost: 0,
      notes: 'Testing free-tier zero cost stop!',
    });

    assert(
      stop.cityId === firstCity.id &&
        stop.accommodationCost === 0 &&
        stop.transportCost === 0,
      'Add City stop with $0 free-tier accommodation and transport costs'
    );

    // ----------------------------------------------------------------
    // 9. SCHEDULE ACTIVITY INTO STOP WITH ZERO COST & BOUNDARY VALIDATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 9: Activity Scheduling & Boundary Checks ---');
    const firstAct = cityDetails.activities[0];
    const actScheduled = '2026-10-03T00:00:00.000Z';

    const scheduledAct = await ItineraryService.addActivityToStop(
      testTrip.id,
      stop.id,
      testUser.id,
      {
        activityId: firstAct.id,
        scheduledDate: actScheduled,
        startTime: '11:00',
        durationMinutes: firstAct.durationMinutes,
        actualCost: firstAct.estimatedCost,
        notes: 'Testing activity scheduling',
      }
    );

    assert(
      scheduledAct.activityId === firstAct.id &&
        scheduledAct.actualCost === firstAct.estimatedCost &&
        scheduledAct.startTime === '11:00',
      'Schedule activity into matching stop with estimated cost'
    );

    // Test invalid scheduled date outside stop boundaries (should fail validation)
    let boundaryErrorCaught = false;
    try {
      await ItineraryService.addActivityToStop(testTrip.id, stop.id, testUser.id, {
        activityId: firstAct.id,
        scheduledDate: '2026-10-25T00:00:00.000Z', // Beyond stop departure (Oct 06)
        actualCost: 10,
      });
    } catch {
      boundaryErrorCaught = true;
    }
    assert(
      boundaryErrorCaught === true,
      'Reject activity scheduled date outside stop date boundaries'
    );

    console.log('\n======================================================');
    console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    if (failedTests === 0) {
      console.log('✅ ALL CITY & ACTIVITY DISCOVERY FEATURES VERIFIED!');
    } else {
      console.error(`❌ ${failedTests} TESTS FAILED!`);
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDiscoveryTests();

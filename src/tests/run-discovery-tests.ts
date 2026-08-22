import { prisma } from '../lib/prisma';
import { CityService } from '../services/city.service';
import { TripService } from '../services/trip.service';
import { ItineraryService } from '../services/itinerary.service';

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

async function runDiscoveryTests() {
  console.log('\n======================================================');
  console.log('🏙️  DEEP: CITY & ACTIVITY DISCOVERY TEST SUITE');
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

    const testTrip = await TripService.createTrip(testUser.id, {
      title: 'Discovery Voyage 2026',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-20T00:00:00.000Z',
      totalBudget: 3000,
    });

    // ----------------------------------------------------------------
    // 1. CITY SEARCH & DISCOVERY
    // ----------------------------------------------------------------
    console.log('--- Phase 1: City Search & Filtering ---');
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
    // 2. CITY DETAILS & ACTIVITIES ASSOCIATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 2: City Details with Activities ---');
    const firstCity = allCities[0];
    const cityDetails = await CityService.getCityById(firstCity.id, testUser.id);
    assert(
      cityDetails.id === firstCity.id &&
        Array.isArray(cityDetails.activities) &&
        cityDetails.activities.length > 0,
      `Retrieve city details and associated activities for ${firstCity.name}`
    );

    // ----------------------------------------------------------------
    // 3. ACTIVITY SEARCH & DISCOVERY
    // ----------------------------------------------------------------
    console.log('\n--- Phase 3: Activity Search & Filtering ---');
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
    // 4. SAVED DESTINATIONS (WISHLIST)
    // ----------------------------------------------------------------
    console.log('\n--- Phase 4: Saved Destinations (Wishlist) ---');
    const saveRes = await CityService.saveDestination(testUser.id, firstCity.id);
    assert(saveRes.saved === true, `Bookmark destination (${firstCity.name}) for user`);

    const userSaved = await CityService.getSavedDestinations(testUser.id);
    assert(userSaved.some((s) => s.id === firstCity.id), 'Fetch user saved destinations list');

    const removeRes = await CityService.removeSavedDestination(testUser.id, firstCity.id);
    assert(removeRes.saved === false, 'Remove destination from wishlist');

    const afterRemoveSaved = await CityService.getSavedDestinations(testUser.id);
    assert(!afterRemoveSaved.some((s) => s.id === firstCity.id), 'Wishlist reflects removal');

    // ----------------------------------------------------------------
    // 5. ADD CITY STOP TO TRIP INTEGRATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 5: Add City Stop to Trip Flow ---');
    const stopArrival = '2026-10-02T00:00:00.000Z';
    const stopDeparture = '2026-10-06T00:00:00.000Z';

    const stop = await ItineraryService.addStopToTrip(testTrip.id, testUser.id, {
      cityId: firstCity.id,
      arrivalDate: stopArrival,
      departureDate: stopDeparture,
      accommodationName: 'Grand Heritage Stay',
      accommodationCost: 300,
      transportType: 'Train',
      transportCost: 45,
      notes: 'Excited for sightseeing and street food!',
    });

    assert(
      stop.cityId === firstCity.id &&
        stop.accommodationCost === 300 &&
        stop.transportType === 'Train',
      'Add City stop to existing trip with accommodation and transport details'
    );

    // ----------------------------------------------------------------
    // 6. ADD ACTIVITY TO TRIP STOP INTEGRATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 6: Add Activity to Trip Stop Flow ---');
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
        notes: 'Booked online',
      }
    );

    assert(
      scheduledAct.activityId === firstAct.id &&
        scheduledAct.startTime === '11:00' &&
        scheduledAct.customTitle === firstAct.title,
      'Schedule activity into trip stop with date/time constraints'
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

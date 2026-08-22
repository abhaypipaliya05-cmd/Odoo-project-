import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../lib/auth';
import { TripService } from '../services/trip.service';
import { ItineraryService } from '../services/itinerary.service';
import { BudgetService } from '../services/budget.service';
import { CityService } from '../services/city.service';
import { PublicTripService } from '../services/public-trip.service';
import { DashboardService } from '../services/dashboard.service';
import { AiService } from '../services/ai.service';

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

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 GLOBETROTTER BACKEND COMPREHENSIVE TEST SUITE');
  console.log('======================================================\n');

  try {
    // ----------------------------------------------------------------
    // 1. AUTHENTICATION & TOKEN VERIFICATION TESTS
    // ----------------------------------------------------------------
    console.log('--- Phase 1: Authentication & Token Security ---');
    const testPassword = 'SecurePassword123!';
    const hashed = await hashPassword(testPassword);
    const isValidPassword = await comparePassword(testPassword, hashed);
    const isInvalidPassword = await comparePassword('WrongPassword', hashed);

    assert(isValidPassword, 'Password hashing & bcrypt comparison (valid)');
    assert(!isInvalidPassword, 'Password verification fails for incorrect password');

    const tokenPayload = { userId: 'user-uuid-123', email: 'test@example.com', role: 'USER' };
    const token = generateToken(tokenPayload);
    const decoded = verifyToken(token);
    assert(decoded !== null && decoded.userId === 'user-uuid-123', 'JWT generation and cryptographic verification');

    // Create Test Users in DB
    const user1Email = `tester1_${Date.now()}@globetrotter.test`;
    const user2Email = `tester2_${Date.now()}@globetrotter.test`;

    const user1 = await prisma.user.create({
      data: {
        email: user1Email,
        passwordHash: hashed,
        name: 'Tester One',
        currency: 'USD',
        language: 'en',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: user2Email,
        passwordHash: hashed,
        name: 'Tester Two',
        currency: 'EUR',
        language: 'en',
      },
    });

    assert(!!user1.id && !!user2.id, 'User creation in database');

    // Test Duplicate Email Constraint
    let duplicateFailedAsExpected = false;
    try {
      await prisma.user.create({
        data: {
          email: user1Email,
          passwordHash: hashed,
          name: 'Duplicate User',
        },
      });
    } catch {
      duplicateFailedAsExpected = true;
    }
    assert(duplicateFailedAsExpected, 'Duplicate email registration rejected by database unique constraint');

    // ----------------------------------------------------------------
    // 2. CITY & ACTIVITY DISCOVERY TESTS
    // ----------------------------------------------------------------
    console.log('\n--- Phase 2: City & Activity Discovery ---');
    const allCities = await CityService.getCities({}, user1.id);
    assert(allCities.length > 0, `Retrieve cities from database (found ${allCities.length} cities)`);

    const filteredCities = await CityService.getCities({ country: 'India' }, user1.id);
    assert(
      filteredCities.length > 0 && filteredCities.every((c) => c.country === 'India'),
      'City search with country filter (India)'
    );

    const firstCity = allCities[0];
    const cityDetails = await CityService.getCityById(firstCity.id, user1.id);
    assert(
      cityDetails.id === firstCity.id && Array.isArray(cityDetails.activities),
      'City details retrieval with associated activities'
    );

    const activitiesList = await CityService.getActivities({ category: 'FOOD' });
    assert(
      activitiesList.length > 0 && activitiesList.every((a) => a.category === 'FOOD'),
      'Activity discovery with category filter (FOOD)'
    );

    // Test Saved Destinations (Bookmarks)
    await CityService.saveDestination(user1.id, firstCity.id);
    const savedDestinations = await CityService.getSavedDestinations(user1.id);
    assert(
      savedDestinations.some((s) => s.id === firstCity.id),
      'Save/Bookmark destination for user'
    );

    await CityService.removeSavedDestination(user1.id, firstCity.id);
    const savedAfterRemove = await CityService.getSavedDestinations(user1.id);
    assert(
      !savedAfterRemove.some((s) => s.id === firstCity.id),
      'Remove saved destination'
    );

    // ----------------------------------------------------------------
    // 3. TRIP CRUD & BUSINESS LOGIC DATES VALIDATION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 3: Trip Management & Validation ---');
    const validTripStart = '2026-11-01T00:00:00.000Z';
    const validTripEnd = '2026-11-10T00:00:00.000Z';

    const trip1 = await TripService.createTrip(user1.id, {
      title: 'Grand Euro Tour',
      description: 'Visiting iconic European capitals',
      startDate: validTripStart,
      endDate: validTripEnd,
      totalBudget: 1500.0,
      currency: 'USD',
      visibility: 'PRIVATE',
      status: 'PLANNED',
    });

    assert(trip1.title === 'Grand Euro Tour' && trip1.totalBudget === 1500.0, 'Create trip with valid parameters');

    // Test Invalid Date Boundary (startDate > endDate)
    let invalidTripRejected = false;
    try {
      await TripService.createTrip(user1.id, {
        title: 'Broken Dates Trip',
        startDate: '2026-11-10T00:00:00.000Z',
        endDate: '2026-11-01T00:00:00.000Z',
      });
    } catch {
      invalidTripRejected = true;
    }
    assert(invalidTripRejected, 'Trip creation rejects startDate > endDate');

    // ----------------------------------------------------------------
    // 4. ITINERARY MULTI-CITY STOPS & REORDERING
    // ----------------------------------------------------------------
    console.log('\n--- Phase 4: Itinerary Multi-City Stops & Reordering ---');
    const paris = allCities.find((c) => c.name === 'Paris') || allCities[0];
    const tokyo = allCities.find((c) => c.name === 'Tokyo') || allCities[1];

    // Add Stop 1: Paris (Nov 1 - Nov 5)
    const stop1 = await ItineraryService.addStopToTrip(trip1.id, user1.id, {
      cityId: paris.id,
      arrivalDate: '2026-11-01T00:00:00.000Z',
      departureDate: '2026-11-05T00:00:00.000Z',
      orderIndex: 0,
      accommodationName: 'Le Marais Boutique Hotel',
      accommodationCost: 400.0,
      transportType: 'Flight',
      transportCost: 350.0,
    });

    assert(stop1.accommodationCost === 400.0 && stop1.transportCost === 350.0, 'Add valid Stop 1 (Paris) to trip');

    // Add Stop 2: Tokyo (Nov 5 - Nov 10)
    const stop2 = await ItineraryService.addStopToTrip(trip1.id, user1.id, {
      cityId: tokyo.id,
      arrivalDate: '2026-11-05T00:00:00.000Z',
      departureDate: '2026-11-10T00:00:00.000Z',
      orderIndex: 1,
      accommodationName: 'Shinjuku Ryokan',
      accommodationCost: 450.0,
      transportType: 'Flight',
      transportCost: 400.0,
    });

    assert(stop2.accommodationCost === 450.0, 'Add valid Stop 2 (Tokyo) to trip');

    // Test Invalid Stop Date (Outside Trip Range)
    let invalidStopRejected = false;
    try {
      await ItineraryService.addStopToTrip(trip1.id, user1.id, {
        cityId: paris.id,
        arrivalDate: '2026-10-25T00:00:00.000Z', // Before trip startDate
        departureDate: '2026-11-02T00:00:00.000Z',
      });
    } catch {
      invalidStopRejected = true;
    }
    assert(invalidStopRejected, 'Stop creation rejects dates outside parent trip boundaries');

    // Test Reordering Stops
    const reorderedStops = await ItineraryService.reorderStops(trip1.id, user1.id, [stop2.id, stop1.id]);
    assert(
      reorderedStops[0].id === stop2.id && reorderedStops[1].id === stop1.id,
      'Reorder trip stops transactionally'
    );

    // Restore order
    await ItineraryService.reorderStops(trip1.id, user1.id, [stop1.id, stop2.id]);

    // ----------------------------------------------------------------
    // 5. ACTIVITY SCHEDULING & TIME CONSTRAINTS
    // ----------------------------------------------------------------
    console.log('\n--- Phase 5: Activity Scheduling & Constraints ---');
    const act1 = await ItineraryService.addActivityToStop(trip1.id, stop1.id, user1.id, {
      customTitle: 'Louvre Art Tour',
      category: 'CULTURE',
      scheduledDate: '2026-11-02T00:00:00.000Z',
      startTime: '10:00',
      durationMinutes: 120,
      actualCost: 50.0,
    });

    assert(act1.actualCost === 50.0 && act1.customTitle === 'Louvre Art Tour', 'Schedule activity within stop dates');

    // Test Invalid Activity Date (Outside Stop Date Range)
    let invalidActRejected = false;
    try {
      await ItineraryService.addActivityToStop(trip1.id, stop1.id, user1.id, {
        customTitle: 'Out of range activity',
        scheduledDate: '2026-11-08T00:00:00.000Z', // Outside stop1 date range
      });
    } catch {
      invalidActRejected = true;
    }
    assert(invalidActRejected, 'Activity scheduling rejects date outside parent stop');

    // ----------------------------------------------------------------
    // 6. BUDGET ENGINE & OVERBUDGET CALCULATIONS
    // ----------------------------------------------------------------
    console.log('\n--- Phase 6: Budget Engine & Financial Calculations ---');
    // Add custom expenses
    await BudgetService.addExpense(trip1.id, user1.id, {
      category: 'MEALS',
      title: 'French Gourmet Dinner',
      amount: 120.0,
    });

    await BudgetService.addExpense(trip1.id, user1.id, {
      category: 'MISCELLANEOUS',
      title: 'City Museum Passes & Metro',
      amount: 60.0,
    });

    // Current Trip Cost Breakdown:
    // Transport: 350 + 400 = 750
    // Stay: 400 + 450 = 850
    // Activities: 50
    // Meals: 120
    // Misc: 60
    // Total: 750 + 850 + 50 + 120 + 60 = 1830.0
    // Budget is 1500.0 => isOverBudget: true, overBudgetAmount: 330.0

    const budget = await BudgetService.calculateTripBudget(trip1.id, user1.id);

    assert(budget.categories.transport === 750.0, `Transport total calculation ($750 expected, got $${budget.categories.transport})`);
    assert(budget.categories.stay === 850.0, `Stay total calculation ($850 expected, got $${budget.categories.stay})`);
    assert(budget.categories.activities === 50.0, `Activities total calculation ($50 expected, got $${budget.categories.activities})`);
    assert(budget.categories.meals === 120.0, `Meals total calculation ($120 expected, got $${budget.categories.meals})`);
    assert(budget.categories.miscellaneous === 60.0, `Misc total calculation ($60 expected, got $${budget.categories.miscellaneous})`);
    assert(budget.totalEstimatedCost === 1830.0, `Total estimated cost ($1830 expected, got $${budget.totalEstimatedCost})`);
    assert(budget.isOverBudget === true, 'Overbudget flag correctly set to true');
    assert(budget.overBudgetAmount === 330.0, `Overbudget amount ($330 expected, got $${budget.overBudgetAmount})`);
    assert(budget.averageDailyCost > 0, `Average daily cost calculation ($${budget.averageDailyCost}/day)`);

    // ----------------------------------------------------------------
    // 7. TIMELINE & CALENDAR STRUCTURED DATA
    // ----------------------------------------------------------------
    console.log('\n--- Phase 7: Timeline & Calendar Engine ---');
    const timeline = await ItineraryService.getTimeline(trip1.id, user1.id);
    assert(timeline.days.length === 10, `Timeline days span full date range (10 days expected, got ${timeline.days.length})`);
    assert(timeline.days[1].activities.length > 0, 'Timeline includes scheduled day activities');

    // ----------------------------------------------------------------
    // 8. PUBLIC SHARING & SANITIZATION TESTS
    // ----------------------------------------------------------------
    console.log('\n--- Phase 8: Public Sharing & Security Sanitization ---');
    const shareResult = await PublicTripService.setTripSharing(trip1.id, user1.id, 'PUBLIC');
    assert(!!shareResult.shareSlug && shareResult.visibility === 'PUBLIC', 'Enable public trip sharing & generate slug');

    const publicTrip = await PublicTripService.getPublicTripBySlug(shareResult.shareSlug!);
    assert(
      publicTrip.id === trip1.id &&
        !('passwordHash' in publicTrip) &&
        !('email' in publicTrip.creator) &&
        publicTrip.creator.name === user1.name,
      'Public itinerary view returns sanitized data without exposing email or passwordHash'
    );

    // ----------------------------------------------------------------
    // 9. CLONE / COPY TRIP ATOMIC TRANSACTION
    // ----------------------------------------------------------------
    console.log('\n--- Phase 9: Trip Cloning & Forking ---');
    const clonedTrip = await PublicTripService.cloneTrip(trip1.id, user2.id);
    assert(
      clonedTrip.userId === user2.id &&
        clonedTrip.id !== trip1.id &&
        clonedTrip.stops.length === 2 &&
        clonedTrip.visibility === 'PRIVATE' &&
        clonedTrip.shareSlug === null,
      'Clone trip into another user account with independent stops and private visibility'
    );

    // ----------------------------------------------------------------
    // 10. AUTHORIZATION & ACCESS CONTROL ENFORCEMENT
    // ----------------------------------------------------------------
    console.log('\n--- Phase 10: Authorization & RBAC Enforcement ---');
    // Set trip back to PRIVATE
    await PublicTripService.setTripSharing(trip1.id, user1.id, 'PRIVATE');

    let unauthorizedViewBlocked = false;
    try {
      await TripService.getTripById(trip1.id, user2.id);
    } catch {
      unauthorizedViewBlocked = true;
    }
    assert(unauthorizedViewBlocked, 'User 2 blocked from viewing User 1 private trip (403 Forbidden)');

    let unauthorizedModifyBlocked = false;
    try {
      await TripService.updateTrip(trip1.id, user2.id, { title: 'Hacked Title' });
    } catch {
      unauthorizedModifyBlocked = true;
    }
    assert(unauthorizedModifyBlocked, 'User 2 blocked from modifying User 1 trip (403 Forbidden)');

    // ----------------------------------------------------------------
    // 11. DASHBOARD & AI SERVICE TESTS
    // ----------------------------------------------------------------
    console.log('\n--- Phase 11: Dashboard Statistics & AI Engine ---');
    const dashboardStats = await DashboardService.getDashboardStats(user1.id);
    assert(dashboardStats.totalTripsCount >= 1, 'Dashboard statistics aggregation');

    const aiRecs = await AiService.getPersonalizedRecommendations(user1.id);
    assert(
      aiRecs.recommendedCities.length > 0 && typeof aiRecs.customTip === 'string',
      'AI Recommendation service with structured explainable output'
    );

    console.log('\n======================================================');
    console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    if (failedTests === 0) {
      console.log('✅ ALL BACKEND ARCHITECTURE & BUSINESS LOGIC VERIFIED!');
    } else {
      console.error(`❌ ${failedTests} TESTS FAILED!`);
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('💥 Unhandled exception in test suite:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();

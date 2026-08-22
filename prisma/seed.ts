import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for GlobeTrotter...');

  // 1. Clean existing records
  await prisma.tripActivity.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@globetrotter.com',
      passwordHash,
      name: 'Alex Traveler',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      bio: 'Avid wanderer, photographer & culture enthusiast. 25 countries and counting.',
      homeCity: 'San Francisco',
      currency: 'USD',
      language: 'en',
      role: 'USER',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@globetrotter.com',
      passwordHash,
      name: 'GlobeTrotter Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Platform Administrator and Travel Curator.',
      homeCity: 'New York',
      currency: 'USD',
      language: 'en',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Created demo users: ${demoUser.email}, ${adminUser.email}`);

  // 3. Seed Comprehensive Cities
  const citiesData = [
    {
      name: 'Ahmedabad',
      country: 'India',
      region: 'Asia',
      description: "India's first UNESCO World Heritage City, celebrated for its intricate pols, iconic Sabarmati Ashram, stepwells, and vibrant street food culture.",
      imageUrl: 'https://images.unsplash.com/photo-1609137144827-02ebfbcfda3b?w=800&q=80',
      costIndex: 'BUDGET',
      averageDailyCost: 35.0,
      popularityScore: 4.6,
      latitude: 23.0225,
      longitude: 72.5714,
      activities: [
        {
          title: 'Heritage Walk through Old City & Pols',
          description: 'Explore the carved wooden facades, secret passages, and centuries-old Havelis of old Ahmedabad.',
          category: 'CULTURE',
          estimatedCost: 10.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
          rating: 4.8,
          address: 'Kalupur Swaminarayan Temple, Ahmedabad',
        },
        {
          title: 'Sabarmati Riverfront Evening Stroll & Boating',
          description: 'Scenic promenade offering serene views of the Sabarmati river and evening light shows.',
          category: 'RELAXATION',
          estimatedCost: 5.0,
          durationMinutes: 90,
          imageUrl: 'https://images.unsplash.com/photo-1609137144827-02ebfbcfda3b?w=600&q=80',
          rating: 4.5,
          address: 'Sabarmati Riverfront Promenade, Ahmedabad',
        },
        {
          title: 'Manek Chowk Night Food Market',
          description: 'Indulge in famous Gwalior Dosa, cheese chocolate sandwiches, and authentic Gujarati sweets.',
          category: 'FOOD',
          estimatedCost: 12.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80',
          rating: 4.9,
          address: 'Manek Chowk, Old City, Ahmedabad',
        },
        {
          title: 'Adalaj Stepwell Architectural Tour',
          description: 'Marvel at the 5-story deep 15th-century subterranean water building featuring Solanki architecture.',
          category: 'SIGHTSEEING',
          estimatedCost: 4.0,
          durationMinutes: 90,
          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
          rating: 4.7,
          address: 'Adalaj, Gandhinagar Highway, Ahmedabad',
        },
      ],
    },
    {
      name: 'Mumbai',
      country: 'India',
      region: 'Asia',
      description: 'The bustling City of Dreams, where Bollywood glamour meets colonial Gothic architecture and Arabian Sea sunsets.',
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
      costIndex: 'MODERATE',
      averageDailyCost: 65.0,
      popularityScore: 4.8,
      latitude: 18.922,
      longitude: 72.8347,
      activities: [
        {
          title: 'Gateway of India & Colaba Heritage Walk',
          description: 'Visit the historic monument and stroll through vibrant British colonial heritage architecture.',
          category: 'SIGHTSEEING',
          estimatedCost: 0.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80',
          rating: 4.7,
          address: 'Apollo Bandar, Colaba, Mumbai',
        },
        {
          title: 'Marine Drive Sunset & Street Eats at Chowpatty',
          description: 'Watch the Queen’s Necklace light up at twilight while savoring Pav Bhaji and Pani Puri.',
          category: 'FOOD',
          estimatedCost: 15.0,
          durationMinutes: 150,
          imageUrl: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&q=80',
          rating: 4.9,
          address: 'Girgaon Chowpatty, Marine Drive, Mumbai',
        },
        {
          title: 'Elephanta Caves Ferry & Exploration',
          description: 'Take a boat across Mumbai harbour to explore ancient rock-cut cave temples dedicated to Shiva.',
          category: 'CULTURE',
          estimatedCost: 20.0,
          durationMinutes: 240,
          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
          rating: 4.6,
          address: 'Elephanta Island, Mumbai Harbour',
        },
        {
          title: 'Bandra Nightlife & Live Music Lounges',
          description: 'Experience Mumbai’s coolest craft cocktail bars and indie music venues in Bandra West.',
          category: 'NIGHTLIFE',
          estimatedCost: 45.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
          rating: 4.8,
          address: 'Pali Hill, Bandra West, Mumbai',
        },
      ],
    },
    {
      name: 'Delhi',
      country: 'India',
      region: 'Asia',
      description: 'The historic capital of India, blending centuries of Mughal empires, modern diplomacy, and legendary culinary trails.',
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
      costIndex: 'BUDGET',
      averageDailyCost: 45.0,
      popularityScore: 4.7,
      latitude: 28.6139,
      longitude: 77.209,
      activities: [
        {
          title: 'Red Fort & Chandni Chowk Food Safari',
          description: 'Tour Emperor Shah Jahan’s fortress and feast on authentic parathas, jalebis, and kebabs.',
          category: 'FOOD',
          estimatedCost: 20.0,
          durationMinutes: 210,
          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
          rating: 4.8,
          address: 'Old Delhi, Delhi',
        },
        {
          title: 'Qutub Minar & Mehrauli Archaeological Park',
          description: 'Discover the world’s tallest brick minaret and ancient Tomar ruins surrounded by lush lawns.',
          category: 'SIGHTSEEING',
          estimatedCost: 10.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
          rating: 4.7,
          address: 'Mehrauli, New Delhi',
        },
        {
          title: 'Dilli Haat Handicrafts & Regional Food Stalls',
          description: 'Open-air craft bazaar showcasing artisan textiles, pottery, and dishes from every Indian state.',
          category: 'SHOPPING',
          estimatedCost: 25.0,
          durationMinutes: 150,
          imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
          rating: 4.6,
          address: 'INA, New Delhi',
        },
      ],
    },
    {
      name: 'Jaipur',
      country: 'India',
      region: 'Asia',
      description: 'The Pink City of Rajasthan, famed for majestic hilltop forts, opulent palaces, and rich textile traditions.',
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
      costIndex: 'BUDGET',
      averageDailyCost: 40.0,
      popularityScore: 4.85,
      latitude: 26.9124,
      longitude: 75.7873,
      activities: [
        {
          title: 'Amer Fort & Sheesh Mahal Exploration',
          description: 'Wander through royal courtyards and the spectacular mirror palace perched high above Maota Lake.',
          category: 'SIGHTSEEING',
          estimatedCost: 15.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
          rating: 4.9,
          address: 'Devisinghpura, Amer, Jaipur',
        },
        {
          title: 'Hawa Mahal & City Palace Photo Tour',
          description: 'Admire the 953 intricate honeycomb windows of the Palace of Winds.',
          category: 'CULTURE',
          estimatedCost: 12.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80',
          rating: 4.8,
          address: 'Badi Choupad, J.D.A. Market, Jaipur',
        },
        {
          title: 'Hot Air Balloon Safari Over Forts',
          description: 'Drift serenely above the Aravalli hills, palaces, and traditional villages at sunrise.',
          category: 'ADVENTURE',
          estimatedCost: 140.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&q=80',
          rating: 4.9,
          address: 'Kukas, Jaipur',
        },
      ],
    },
    {
      name: 'Goa',
      country: 'India',
      region: 'Asia',
      description: 'Tropical paradise renowned for golden sandy beaches, Portuguese colonial villas, water sports, and beachside shacks.',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
      costIndex: 'MODERATE',
      averageDailyCost: 55.0,
      popularityScore: 4.9,
      latitude: 15.2993,
      longitude: 74.124,
      activities: [
        {
          title: 'Scuba Diving & Jet Skiing at Grand Island',
          description: 'Experience vibrant marine life, coral reefs, and thrilling water sports with certified instructors.',
          category: 'ADVENTURE',
          estimatedCost: 60.0,
          durationMinutes: 300,
          imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
          rating: 4.8,
          address: 'Grand Island, South Goa',
        },
        {
          title: 'Fontainhas Latin Quarter Walking Tour',
          description: 'Stroll past picturesque pastel-colored Portuguese homes and artisanal bakeries in Panaji.',
          category: 'CULTURE',
          estimatedCost: 8.0,
          durationMinutes: 90,
          imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
          rating: 4.7,
          address: 'Fontainhas, Panaji, Goa',
        },
        {
          title: 'Anjuna Beach Sunset & Psychedelic Shacks',
          description: 'Chill out with fresh seafood, coconut drinks, and live beach music as the sun dips into the ocean.',
          category: 'RELAXATION',
          estimatedCost: 20.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
          rating: 4.85,
          address: 'Anjuna Beach, North Goa',
        },
      ],
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      description: 'Futuristic oasis of luxury shopping, ultramodern architecture, desert adventures, and world-record marvels.',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      costIndex: 'LUXURY',
      averageDailyCost: 180.0,
      popularityScore: 4.92,
      latitude: 25.2048,
      longitude: 55.2708,
      activities: [
        {
          title: 'Burj Khalifa Observation Deck & Fountain Show',
          description: 'Look out from level 148 of the world’s tallest tower followed by the synchronized fountain spectacle.',
          category: 'SIGHTSEEING',
          estimatedCost: 95.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
          rating: 4.9,
          address: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
        },
        {
          title: 'Red Dunes Desert Safari & Dune Bashing',
          description: 'High-octane 4x4 dune bashing, camel riding, sandboarding, and an Arabian barbecue dinner under the stars.',
          category: 'ADVENTURE',
          estimatedCost: 75.0,
          durationMinutes: 360,
          imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&q=80',
          rating: 4.95,
          address: 'Lahbab Desert, Dubai',
        },
        {
          title: 'Dubai Marina Yacht Cruise & Dinner',
          description: 'Glide past towering skyscrapers on a luxury catamaran with an international buffet dinner.',
          category: 'RELAXATION',
          estimatedCost: 65.0,
          durationMinutes: 150,
          imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80',
          rating: 4.8,
          address: 'Dubai Marina Promenade, Dubai',
        },
      ],
    },
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      description: 'The City of Light, synonymous with timeless art, haute cuisine, iconic landmarks, and romantic cobblestone boulevards.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      costIndex: 'LUXURY',
      averageDailyCost: 190.0,
      popularityScore: 4.95,
      latitude: 48.8566,
      longitude: 2.3522,
      activities: [
        {
          title: 'Eiffel Tower Summit Access & Seine River Cruise',
          description: 'Breathtaking panoramic views over Paris paired with an illuminated river cruise.',
          category: 'SIGHTSEEING',
          estimatedCost: 80.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
          rating: 4.9,
          address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
        },
        {
          title: 'Louvre Museum Guided Masterpieces Tour',
          description: 'Skip-the-line guided access to the Mona Lisa, Venus de Milo, and Winged Victory of Samothrace.',
          category: 'CULTURE',
          estimatedCost: 65.0,
          durationMinutes: 150,
          imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
          rating: 4.85,
          address: 'Rue de Rivoli, 75001 Paris',
        },
        {
          title: 'Montmartre Pastry & Wine Tasting Walk',
          description: 'Savor freshly baked croissants, macarons, artisanal cheeses, and boutique French wines.',
          category: 'FOOD',
          estimatedCost: 55.0,
          durationMinutes: 150,
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
          rating: 4.9,
          address: 'Place du Tertre, Montmartre, Paris',
        },
      ],
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      description: 'Ultra-modern metropolis blending neon-lit futuristic skyscrapers, centuries-old shrines, anime culture, and Michelin-starred gastronomy.',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
      costIndex: 'MODERATE',
      averageDailyCost: 130.0,
      popularityScore: 4.96,
      latitude: 35.6762,
      longitude: 139.6503,
      activities: [
        {
          title: 'Shibuya Crossing & Harajuku Pop-Culture Safari',
          description: 'Experience the world’s busiest pedestrian crossing and vibrant fashion boutiques on Takeshita Street.',
          category: 'SHOPPING',
          estimatedCost: 15.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80',
          rating: 4.9,
          address: 'Shibuya, Tokyo',
        },
        {
          title: 'Tsukiji Outer Market Gourmet Sushi Tasting',
          description: 'Taste melt-in-your-mouth bluefin tuna nigiri, tamagoyaki, and fresh sea urchin from artisan vendors.',
          category: 'FOOD',
          estimatedCost: 45.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
          rating: 4.95,
          address: 'Tsukiji, Chuo City, Tokyo',
        },
        {
          title: 'Senso-ji Temple & Asakusa Traditional Rickshaw Ride',
          description: 'Tokyo’s oldest Buddhist temple framed by giant red lanterns and historic Nakamise shopping street.',
          category: 'CULTURE',
          estimatedCost: 35.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
          rating: 4.8,
          address: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
        },
      ],
    },
    {
      name: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      description: 'Cosmopolitan capital steeped in royal heritage, world-class West End theatres, vast royal parks, and iconic landmarks.',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
      costIndex: 'LUXURY',
      averageDailyCost: 175.0,
      popularityScore: 4.9,
      latitude: 51.5074,
      longitude: -0.1278,
      activities: [
        {
          title: 'Tower of London & Crown Jewels Tour',
          description: 'Step into 1,000 years of royal history, meet the Beefeaters, and view the sparkling Crown Jewels.',
          category: 'CULTURE',
          estimatedCost: 42.0,
          durationMinutes: 180,
          imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
          rating: 4.8,
          address: 'Tower of London, London EC3N 4AB',
        },
        {
          title: 'Borough Market Street Food Extravaganza',
          description: 'Sample gourmet artisan cheeses, truffle pasta, oysters, and British sausage rolls.',
          category: 'FOOD',
          estimatedCost: 30.0,
          durationMinutes: 120,
          imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
          rating: 4.9,
          address: '8 Southwark St, London SE1 1TL',
        },
      ],
    },
  ];

  for (const cityItem of citiesData) {
    const { activities, ...cityProps } = cityItem;
    const createdCity = await prisma.city.create({
      data: {
        ...cityProps,
        activities: {
          create: activities,
        },
      },
    });
    console.log(`  + Seeded city: ${createdCity.name} (${createdCity.country}) with ${activities.length} activities`);
  }

  // 4. Create an Initial Rich Demo Trip for Alex Traveler
  const ahmedabad = await prisma.city.findFirst({ where: { name: 'Ahmedabad' } });
  const mumbai = await prisma.city.findFirst({ where: { name: 'Mumbai' } });
  const goa = await prisma.city.findFirst({ where: { name: 'Goa' } });

  if (ahmedabad && mumbai && goa) {
    const trip = await prisma.trip.create({
      data: {
        userId: demoUser.id,
        title: 'Grand Western India Odyssey',
        description: 'A 7-day culinary, heritage, and coastal journey from the pols of Ahmedabad to the beaches of Goa.',
        coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1000&q=80',
        startDate: new Date('2026-10-10T00:00:00.000Z'),
        endDate: new Date('2026-10-17T00:00:00.000Z'),
        totalBudget: 1200.0,
        currency: 'USD',
        status: 'PLANNED',
        visibility: 'PUBLIC',
        shareSlug: 'trip-western-india-odyssey',
      },
    });

    // Stop 1: Ahmedabad (Oct 10 - Oct 12)
    const stop1 = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: ahmedabad.id,
        arrivalDate: new Date('2026-10-10T00:00:00.000Z'),
        departureDate: new Date('2026-10-12T00:00:00.000Z'),
        orderIndex: 0,
        accommodationName: 'House of MG Heritage Hotel',
        accommodationCost: 160.0,
        transportType: 'Flight',
        transportCost: 80.0,
        notes: 'Check-in by 11:00 AM. Try the traditional Gujarati Thali for lunch.',
      },
    });

    const ahmedabadActs = await prisma.activity.findMany({ where: { cityId: ahmedabad.id } });
    if (ahmedabadActs.length > 0) {
      await prisma.tripActivity.create({
        data: {
          tripStopId: stop1.id,
          activityId: ahmedabadActs[0].id,
          customTitle: ahmedabadActs[0].title,
          category: ahmedabadActs[0].category,
          scheduledDate: new Date('2026-10-10T00:00:00.000Z'),
          startTime: '08:30',
          durationMinutes: 180,
          actualCost: ahmedabadActs[0].estimatedCost,
          status: 'PLANNED',
          orderIndex: 0,
        },
      });

      if (ahmedabadActs.length > 2) {
        await prisma.tripActivity.create({
          data: {
            tripStopId: stop1.id,
            activityId: ahmedabadActs[2].id,
            customTitle: 'Evening Food Trail at Manek Chowk',
            category: 'FOOD',
            scheduledDate: new Date('2026-10-11T00:00:00.000Z'),
            startTime: '20:00',
            durationMinutes: 120,
            actualCost: 15.0,
            status: 'PLANNED',
            orderIndex: 1,
          },
        });
      }
    }

    // Stop 2: Mumbai (Oct 12 - Oct 14)
    const stop2 = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: mumbai.id,
        arrivalDate: new Date('2026-10-12T00:00:00.000Z'),
        departureDate: new Date('2026-10-14T00:00:00.000Z'),
        orderIndex: 1,
        accommodationName: 'Taj Mahal Palace (Heritage Wing)',
        accommodationCost: 350.0,
        transportType: 'Vande Bharat Express Train',
        transportCost: 45.0,
        notes: 'High tea overlooking the Gateway of India.',
      },
    });

    const mumbaiActs = await prisma.activity.findMany({ where: { cityId: mumbai.id } });
    if (mumbaiActs.length > 0) {
      await prisma.tripActivity.create({
        data: {
          tripStopId: stop2.id,
          activityId: mumbaiActs[0].id,
          customTitle: mumbaiActs[0].title,
          category: mumbaiActs[0].category,
          scheduledDate: new Date('2026-10-13T00:00:00.000Z'),
          startTime: '10:00',
          durationMinutes: 120,
          actualCost: 0.0,
          status: 'PLANNED',
          orderIndex: 0,
        },
      });
    }

    // Stop 3: Goa (Oct 14 - Oct 17)
    const stop3 = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: goa.id,
        arrivalDate: new Date('2026-10-14T00:00:00.000Z'),
        departureDate: new Date('2026-10-17T00:00:00.000Z'),
        orderIndex: 2,
        accommodationName: 'W Goa Beach Villa',
        accommodationCost: 280.0,
        transportType: 'Short Flight',
        transportCost: 65.0,
        notes: 'Rent a scooter upon arrival at Mopa airport.',
      },
    });

    const goaActs = await prisma.activity.findMany({ where: { cityId: goa.id } });
    if (goaActs.length > 0) {
      await prisma.tripActivity.create({
        data: {
          tripStopId: stop3.id,
          activityId: goaActs[0].id,
          customTitle: goaActs[0].title,
          category: goaActs[0].category,
          scheduledDate: new Date('2026-10-15T00:00:00.000Z'),
          startTime: '09:00',
          durationMinutes: 300,
          actualCost: goaActs[0].estimatedCost,
          status: 'PLANNED',
          orderIndex: 0,
        },
      });
    }

    // Add Expenses
    await prisma.expense.createMany({
      data: [
        {
          tripId: trip.id,
          category: 'MEALS',
          title: 'Fine Dining Dinner at Bombay Canteen',
          amount: 60.0,
          currency: 'USD',
          date: new Date('2026-10-13T00:00:00.000Z'),
          notes: 'Tasting menu for two.',
        },
        {
          tripId: trip.id,
          category: 'MISCELLANEOUS',
          title: 'Handloom Cotton Kurtas & Souvenirs',
          amount: 40.0,
          currency: 'USD',
          date: new Date('2026-10-11T00:00:00.000Z'),
        },
      ],
    });

    // Save Destinations for demo user
    await prisma.savedDestination.createMany({
      data: [
        { userId: demoUser.id, cityId: ahmedabad.id },
        { userId: demoUser.id, cityId: goa.id },
      ],
    });

    console.log(`✅ Seeded complete demo trip: "${trip.title}" with stops, activities, and expenses`);
  }

  console.log('✨ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

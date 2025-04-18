/**
 * Mock data for the Climb Gym Log application
 * Provides realistic data for development and testing
 */

// Helper to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper to get random integer in range (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate random date within last 3 months
const getRandomDate = () => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
  return new Date(threeMonthsAgo.getTime() + Math.random() * (Date.now() - threeMonthsAgo.getTime())).toISOString();
};

// User data
const mockUsers = [
  { id: 1, username: 'alex_honnold', email: 'alex@example.com', created_at: '2024-12-15T12:00:00Z' },
  { id: 2, username: 'adam_ondra', email: 'adam@example.com', created_at: '2024-12-20T14:30:00Z' },
  { id: 3, username: 'lynn_hill', email: 'lynn@example.com', created_at: '2025-01-05T09:15:00Z' },
  { id: 4, username: 'ashima_shiraishi', email: 'ashima@example.com', created_at: '2025-01-10T16:45:00Z' },
  { id: 5, username: 'tommy_caldwell', email: 'tommy@example.com', created_at: '2025-01-15T11:30:00Z' },
  { id: 6, username: 'chris_sharma', email: 'chris@example.com', created_at: '2025-01-20T13:00:00Z' },
  { id: 7, username: 'brooke_raboutou', email: 'brooke@example.com', created_at: '2025-01-25T10:45:00Z' },
  { id: 8, username: 'margo_hayes', email: 'margo@example.com', created_at: '2025-02-01T15:30:00Z' },
  { id: 9, username: 'alex_puccio', email: 'puccio@example.com', created_at: '2025-02-05T09:00:00Z' },
  { id: 10, username: 'sean_mccoll', email: 'sean@example.com', created_at: '2025-02-10T14:15:00Z' },
  { id: 11, username: 'demo', email: 'demo@example.com', created_at: '2025-01-01T00:00:00Z' }
];

// Gym data
const mockGyms = [
  { 
    id: 1, 
    name: 'Boulder Academy', 
    location: 'Seattle, WA',
    created_at: '2024-11-01T00:00:00Z',
    climb_count: 105
  },
  { 
    id: 2, 
    name: 'Vertical World', 
    location: 'Redmond, WA',
    created_at: '2024-11-15T00:00:00Z',
    climb_count: 35
  },
  { 
    id: 3, 
    name: 'Stone Gardens', 
    location: 'Bellevue, WA',
    created_at: '2024-12-01T00:00:00Z',
    climb_count: 42
  }
];

// Climb data generators
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Orange', 'Pink', 'Mixed'];
const routeSections = ['Main Wall', 'Lead Wall', 'Slab Section', 'Vertical Wall', 'Competition Wall', 'Training Area', 'Autobelay Wall'];
const boulderSections = ['Cave', 'Slab', 'Roof', 'Boulder Island', 'Competition Boulders', 'Training Area', 'Circuits'];
const setters = ['Alex', 'Sarah', 'Miguel', 'Jasmine', 'Raj', 'Emma', 'Tyler', 'Jordan', 'Sophia', 'Liam'];

// Grade systems
const boulderGrades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'];
const routeGrades = ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', '5.13a'];

const climbNames = [
  'Crimp Kingdom', 'Dyno Disaster', 'Slab Master', 'Roof Runner', 'Pinch Point', 
  'Campus Crusher', 'Heel Hook Heaven', 'Toe Jam Terror', 'Sloper Slope', 'Jug Haul',
  'Finger Crack Attack', 'Balance Beam', 'Power Problem', 'Endurance Edge', 'Technique Test',
  'Dynamic Move', 'Static Strength', 'Coordination Challenge', 'Flexibility Flex', 'Mental Crux',
  'Volume Voyage', 'Compression Corner', 'Gaston Grind', 'Undercling Uprising', 'Mantle Madness',
  'Traverse Trek', 'Sit Start Struggle', 'Top Out Triumph', 'Flag Fest', 'Match Master',
  'Drop Knee Drive', 'Tension Test', 'Core Crusher', 'Lock Off Legend', 'Deadpoint Dance',
  'Bump Brawl', 'Barn Door Battle', 'Rose Move Riddle', 'Backstep Blessing', 'Rockover Reach',
  'Crimpy Chaos', 'Slapping Sloper', 'Precision Placement', 'Beta Breaker', 'Project Purple',
  'Morpho Move', 'Reachy Route', 'Technical Treat', 'Power Project', 'Subtle Sequence'
];

// Generate boulder and route climbs for a gym
const generateClimbsForGym = (gymId, boulderCount, routeCount) => {
  const climbs = [];
  let climbId = 1;
  
  // Generate boulder problems
  for (let i = 1; i <= boulderCount; i++) {
    const setterGradeIndex = getRandomInt(0, boulderGrades.length - 1);
    const setterGrade = boulderGrades[setterGradeIndex];
    
    // Generate consensus grade that could be different from setter grade
    let consensusGradeIndex = setterGradeIndex;
    if (getRandomInt(0, 100) > 70) { // 30% chance of different consensus
      const shift = Math.random() > 0.5 ? 1 : -1;
      consensusGradeIndex = Math.max(0, Math.min(boulderGrades.length - 1, setterGradeIndex + shift));
    }
    const consensusGrade = boulderGrades[consensusGradeIndex];
    
    const boulder = {
      id: climbId++,
      gym_id: gymId,
      climb_type: 'boulder',
      name: `${getRandomItem(climbNames)} ${i}`,
      setter_grade: setterGrade,
      consensus_grade: consensusGrade,
      color: getRandomItem(colors),
      section: getRandomItem(boulderSections),
      setter: getRandomItem(setters),
      description: `A ${getRandomItem(['fun', 'challenging', 'technical', 'powerful', 'balancy', 'crimpy', 'slopey'])} problem with ${getRandomItem(['interesting', 'unique', 'classic', 'puzzling', 'straightforward', 'tricky'])} sequences.`,
      created_at: getRandomDate(),
      updated_at: getRandomDate(),
      rating: (getRandomInt(10, 50) / 10).toFixed(1), // 1.0 to 5.0 with one decimal
      ascent_count: getRandomInt(0, 50),
      is_active: true
    };
    
    climbs.push(boulder);
  }
  
  // Generate routes
  for (let i = 1; i <= routeCount; i++) {
    const setterGradeIndex = getRandomInt(0, routeGrades.length - 1);
    const setterGrade = routeGrades[setterGradeIndex];
    
    // Generate consensus grade that could be different from setter grade
    let consensusGradeIndex = setterGradeIndex;
    if (getRandomInt(0, 100) > 70) { // 30% chance of different consensus
      const shift = Math.random() > 0.5 ? 1 : -1;
      consensusGradeIndex = Math.max(0, Math.min(routeGrades.length - 1, setterGradeIndex + shift));
    }
    const consensusGrade = routeGrades[consensusGradeIndex];
    
    const route = {
      id: climbId++,
      gym_id: gymId,
      climb_type: 'route',
      name: `${getRandomItem(climbNames)} ${i}`,
      setter_grade: setterGrade,
      consensus_grade: consensusGrade,
      color: getRandomItem(colors),
      section: getRandomItem(routeSections),
      setter: getRandomItem(setters),
      description: `A ${getRandomItem(['sustained', 'technical', 'powerful', 'pumpy', 'endurance', 'crimpy', 'slopey'])} route with ${getRandomItem(['interesting', 'unique', 'classic', 'puzzling', 'straightforward', 'tricky'])} sequences.`,
      created_at: getRandomDate(),
      updated_at: getRandomDate(),
      rating: (getRandomInt(10, 50) / 10).toFixed(1), // 1.0 to 5.0 with one decimal
      ascent_count: getRandomInt(0, 50),
      is_active: true
    };
    
    climbs.push(route);
  }
  
  return climbs;
};

// Generate reviews for climbs
const generateReviewsForClimb = (climbId, count) => {
  const reviews = [];
  
  for (let i = 1; i <= count; i++) {
    const userId = getRandomInt(1, mockUsers.length - 1); // -1 to exclude demo user
    
    const review = {
      id: (climbId * 100) + i,
      climb_id: climbId,
      user_id: userId,
      username: mockUsers.find(u => u.id === userId).username,
      rating: getRandomInt(1, 5),
      comment: getRandomItem([
        'Loved this climb!',
        'The beta is tricky but rewarding.',
        'Harder than it looks.',
        'Great sequence of moves.',
        'Not my style but well set.',
        'The crux move is really interesting.',
        'Fun problem!',
        'Challenging but fair.',
        'The start is awkward.',
        'The finish is satisfying.',
        'Good warm-up climb.',
        'Project material for sure.',
        'The holds are painful on this one.',
        'Really creative setting.',
        'Grade feels spot on.',
        'Might be a touch sandbagged.',
        'Feels easier than the grade.',
        'The movement is super flowy.',
        'Technical and balancy.',
        'Power endurance test for sure.',
        'The heel hook is key.',
        'Watch out for the dyno in the middle.',
        'Good crimp training.',
        'Those slopers are polished!'
      ]),
      created_at: getRandomDate()
    };
    
    reviews.push(review);
  }
  
  return reviews;
};

// Generate climbs for the first gym (70 boulders, 65 routes)
const mockClimbs = generateClimbsForGym(1, 70, 65);

// Separate boulders and routes for easy access
const mockBoulders = mockClimbs.filter(climb => climb.climb_type === 'boulder');
const mockRoutes = mockClimbs.filter(climb => climb.climb_type === 'route');

// Generate reviews for each climb (15-30 reviews per climb)
const mockReviews = mockClimbs.reduce((allReviews, climb) => {
  const reviewCount = getRandomInt(15, 30);
  return [...allReviews, ...generateReviewsForClimb(climb.id, reviewCount)];
}, []);

// Generate ascents data
const generateAscentsForClimb = (climbId, count) => {
  const ascents = [];
  
  for (let i = 1; i <= count; i++) {
    const userId = getRandomInt(1, mockUsers.length - 1);
    const send = Math.random() > 0.3; // 70% success rate
    
    const ascent = {
      id: (climbId * 1000) + i,
      climb_id: climbId,
      user_id: userId,
      username: mockUsers.find(u => u.id === userId).username,
      send: send,
      attempts: send ? getRandomInt(1, 5) : getRandomInt(1, 3),
      grade: `V${getRandomInt(0, 12)}`,
      notes: getRandomItem([
        'Felt good on this one!',
        'Struggled with the middle section.',
        'The beta clicked on my third attempt.',
        'Need to work on my finger strength for this.',
        'Almost had it!',
        'Will come back to this one.',
        'Got it first try, felt easier than the grade.',
        'The crux took me a while to figure out.',
        'My project for the month!',
        '',
        'Finally sent after many sessions!',
        'My nemesis climb.',
        'Good training problem.',
        'The feet are really small on this one.',
        ''
      ]),
      created_at: getRandomDate()
    };
    
    ascents.push(ascent);
  }
  
  return ascents;
};

// Generate ascents for each climb (5-20 ascents per climb)
const mockAscents = mockClimbs.reduce((allAscents, climb) => {
  const ascentCount = getRandomInt(5, 20);
  return [...allAscents, ...generateAscentsForClimb(climb.id, ascentCount)];
}, []);

export { 
  mockUsers,
  mockGyms,
  mockClimbs,
  mockBoulders,
  mockRoutes,
  mockReviews,
  mockAscents,
  boulderGrades,
  routeGrades
};

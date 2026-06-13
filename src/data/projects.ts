export type MissionStep = {
  id: number;
  title: string;
  question: string;
  answer: number;
  unit: string;
  hint: string;
  formula: string;
  buildText: string;
};

export type Project = {
  id: string;
  worldId: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'active' | 'coming-soon';
  age: string;
  description: string;
  maths: string[];
  tools: string[];
  steps: MissionStep[];
};

export type World = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  activeProjectId: string;
};

export const worlds: World[] = [
  { id: 'bridge-builder', name: 'Bridge Builder', tagline: 'Use length, load and geometry to connect communities.', icon: '🌉', color: 'blue', activeProjectId: 'footbridge-stream' },
  { id: 'smart-city', name: 'Smart City Designer', tagline: 'Plan safe spaces, roads and playgrounds with measurement.', icon: '🏙️', color: 'purple', activeProjectId: 'school-playground-layout' },
  { id: 'ship-engineering', name: 'Ship Engineering Bay', tagline: 'Design river transport using capacity, time and distance.', icon: '⛴️', color: 'cyan', activeProjectId: 'ferry-river-crossing' },
  { id: 'robotics-arena', name: 'Flood-Safe Road Engineering Lab', tagline: 'Use civil engineering maths to raise roads and upgrade gutters to stop flooding.', icon: '🌧️', color: 'green', activeProjectId: 'flood-safe-road-drainage-upgrade' },
  { id: 'farm-market', name: 'Farm & Market Maths', tagline: 'Use water, quantity and business maths to solve farm problems.', icon: '🌱', color: 'gold', activeProjectId: 'smart-irrigation-system' },
  { id: 'space-lab', name: 'Smart Parking System Lab', tagline: 'Build automated car parks using area, sensors, counting and display logic.', icon: '🅿️', color: 'pink', activeProjectId: 'smart-car-parking-system' }
];

export const projects: Project[] = [
  {
    id: 'footbridge-stream',
    worldId: 'bridge-builder',
    title: 'Build a Footbridge Over a Stream',
    level: 'Beginner',
    status: 'active',
    age: 'Ages 9–13',
    description: 'Students calculate length, planks, width, support posts and safety load to build a footbridge.',
    maths: ['Measurement', 'Addition', 'Multiplication', 'Load capacity'],
    tools: ['Tape measure', 'Planks', 'Support posts', 'Safety board'],
    steps: [
      { id: 1, title: 'Measure the Stream', question: 'The stream is 4 metres wide. What is the minimum bridge length needed to cross it?', answer: 4, unit: 'm', hint: 'The bridge must be at least as long as the stream is wide.', formula: 'Bridge length = stream width', buildText: 'The first bridge span appears across the water.' },
      { id: 2, title: 'Add Safety Extensions', question: 'Add 1 metre on each side of the stream. What is the total bridge length?', answer: 6, unit: 'm', hint: 'Add 1m + 4m + 1m.', formula: 'Total length = 1 + 4 + 1', buildText: 'The bridge now rests safely on both banks.' },
      { id: 3, title: 'Count the Planks', question: 'Each plank is 1 metre long. How many planks are needed along a 6 metre bridge?', answer: 6, unit: 'planks', hint: 'Divide total length by plank length.', formula: 'Planks = 6 ÷ 1', buildText: 'Six strong planks lock into place.' },
      { id: 4, title: 'Make It Wide Enough', question: 'Each walking board is 0.5 metres wide. How many boards are needed to make a 1 metre wide bridge?', answer: 2, unit: 'boards', hint: 'Two halves make one whole metre.', formula: 'Boards = 1 ÷ 0.5', buildText: 'The walkway becomes wide enough for safe crossing.' },
      { id: 5, title: 'Place Support Posts', question: 'Support posts go at 0m, 2m, 4m and 6m. How many support positions are needed?', answer: 4, unit: 'positions', hint: 'Count the listed positions.', formula: 'Positions = 0, 2, 4, 6', buildText: 'Support posts rise and hold the bridge firmly.' },
      { id: 6, title: 'Check Safety Load', question: 'Each support position carries 50kg. Four positions carry how many kilograms in total?', answer: 200, unit: 'kg', hint: 'Multiply 4 positions by 50kg.', formula: 'Capacity = 4 × 50', buildText: 'The bridge passes the safety test and opens for the community.' }
    ]
  },
  {
    id: 'school-playground-layout',
    worldId: 'smart-city',
    title: 'Build a Safe School Playground',
    level: 'Beginner',
    status: 'active',
    age: 'Ages 9–13',
    description: 'Students use area, spacing, division and perimeter to turn an empty school field into a safe playground with mats, swings, a slide and fencing.',
    maths: ['Area', 'Perimeter', 'Division', 'Multiplication', 'Safety planning'],
    tools: ['Measuring tape', 'Boundary pegs', 'Safety mats', 'Swing set', 'Slide ladder', 'Fence and gate'],
    steps: [
      { id: 1, title: 'Measure the Playground Land', question: 'The school playground space is 12 metres long and 8 metres wide. What is the area of the playground?', answer: 96, unit: 'm²', hint: 'Area = length × width. So calculate 12 × 8.', formula: 'Area = length × width', buildText: 'The playground land has been measured and marked with pegs and ropes.' },
      { id: 2, title: 'Mark a Safe Play Zone', question: 'For safety, the playground must leave 2 metres of free space on the left side and 2 metres on the right side. If the full width is 8 metres, what width remains for the main play zone?', answer: 4, unit: 'm', hint: 'Subtract the two safety spaces: 8 − 2 − 2.', formula: 'Safe width = 8 − 2 − 2', buildText: 'The safe play zone has been marked inside the playground.' },
      { id: 3, title: 'Lay Soft Safety Mats', question: 'The safe play zone covers 32 square metres. Each safety mat covers 4 square metres. How many safety mats are needed?', answer: 8, unit: 'mats', hint: 'Divide the total area by the area covered by one mat: 32 ÷ 4.', formula: 'Mats = 32 ÷ 4', buildText: 'Colourful rubber safety mats have been laid to protect pupils.' },
      { id: 4, title: 'Install the Swing Set', question: 'The playground will have 3 swings. Each swing needs 2 chains. How many chains are needed altogether?', answer: 6, unit: 'chains', hint: 'Multiply the number of swings by the chains for each swing: 3 × 2.', formula: 'Chains = 3 × 2', buildText: 'A strong swing set with three seats has been installed.' },
      { id: 5, title: 'Build the Slide Ladder', question: 'The slide platform is 150 cm high. The ladder has one step every 30 cm. How many ladder steps are needed?', answer: 5, unit: 'steps', hint: 'Divide the height by the space between steps: 150 ÷ 30.', formula: 'Steps = 150 ÷ 30', buildText: 'The slide and five-step ladder have been built.' },
      { id: 6, title: 'Fence the Playground', question: 'The playground is 12 metres long and 8 metres wide. The total perimeter is 40 metres. If the gate space is 4 metres wide, how many metres of fencing are needed?', answer: 36, unit: 'm', hint: 'Subtract the gate space from the total perimeter: 40 − 4.', formula: 'Fence length = 40 − 4', buildText: 'The fence, gate and safety signs have been added. The playground is ready for testing.' }
    ]
  },
  {
    id: 'ferry-river-crossing',
    worldId: 'ship-engineering',
    title: 'Build a Ferry for River Crossing',
    level: 'Beginner',
    status: 'active',
    age: 'Ages 10–14',
    description: 'Students use measurement, area, multiplication, division and load capacity to build a safe ferry that carries people across a river.',
    maths: ['Measurement', 'Area', 'Multiplication', 'Division', 'Load capacity'],
    tools: ['Measuring tape', 'Landing docks', 'Floating platform', 'Passenger seats', 'Safety rails', 'Load limit sign'],
    steps: [
      { id: 1, title: 'Measure the River Width', question: 'The river is 18 metres wide. The ferry rope must extend 2 metres beyond the river on each bank for tying. What total length of rope is needed?', answer: 22, unit: 'm', hint: 'Add the river width and the two extra tying lengths: 18 + 2 + 2.', formula: 'Rope length = 18 + 2 + 2', buildText: 'The river crossing line has been measured and marked from one bank to the other.' },
      { id: 2, title: 'Build the Landing Docks', question: 'Each landing dock needs 6 wooden planks. If there is one dock on the left bank and one dock on the right bank, how many planks are needed altogether?', answer: 12, unit: 'planks', hint: 'There are 2 docks, and each dock needs 6 planks. Calculate 2 × 6.', formula: 'Dock planks = 2 × 6', buildText: 'Wooden landing docks have been built on both river banks.' },
      { id: 3, title: 'Build the Ferry Platform', question: 'The ferry platform is 4 metres long and 3 metres wide. What is the area of the platform?', answer: 12, unit: 'm²', hint: 'Area = length × width. So calculate 4 × 3.', formula: 'Platform area = 4 × 3', buildText: 'The floating ferry platform has been built on the river.' },
      { id: 4, title: 'Add Passenger Seats', question: 'The ferry will have 3 rows of seats. Each row can take 2 passengers. How many passengers can sit on the ferry?', answer: 6, unit: 'passengers', hint: 'Multiply the number of rows by the passengers per row: 3 × 2.', formula: 'Seats = 3 × 2', buildText: 'Passenger seats have been installed on the ferry platform.' },
      { id: 5, title: 'Add Safety Rails', question: 'The ferry needs rails on 4 sides. Each side needs 2 rail posts. How many rail posts are needed in total?', answer: 8, unit: 'posts', hint: 'Multiply the 4 sides by 2 posts for each side: 4 × 2.', formula: 'Rail posts = 4 × 2', buildText: 'Safety rails have been added around the ferry.' },
      { id: 6, title: 'Check Safe Load', question: 'The ferry can carry a maximum of 480 kg. If each passenger is counted as 60 kg, what is the maximum number of passengers the ferry can safely carry?', answer: 8, unit: 'passengers', hint: 'Divide the total safe load by the weight per passenger: 480 ÷ 60.', formula: 'Passenger limit = 480 ÷ 60', buildText: 'The load limit sign, life jackets and safety flag have been added. The ferry is ready for a safe crossing test.' }
    ]
  },
  {
    id: 'flood-safe-road-drainage-upgrade',
    worldId: 'robotics-arena',
    title: 'Raise the Road and Upgrade the Gutters',
    level: 'Beginner',
    status: 'active',
    age: 'Ages 10–14',
    description: 'Students use measurement, subtraction, area, multiplication and addition to raise a community road and rebuild wider, deeper side gutters so rainwater flows safely away from homes and properties.',
    maths: ['Measurement', 'Subtraction', 'Area', 'Multiplication', 'Addition', 'Civil engineering'],
    tools: ['Measuring tape', 'Depth markers', 'Excavator', 'Road filling material', 'Concrete gutter walls', 'Drain covers'],
    steps: [
      { id: 1, title: 'Measure the Old Gutter Depth', question: 'The old gutter is 40 cm deep. Engineers want the new gutter to be 90 cm deep. How many centimetres deeper must the new gutter be?', answer: 50, unit: 'cm', hint: 'Subtract the old depth from the new depth: 90 − 40.', formula: 'Extra depth = 90 − 40', buildText: 'The engineers have measured the old gutter and marked the new depth.' },
      { id: 2, title: 'Increase the Gutter Width', question: 'The old gutter is 50 cm wide. The new gutter will be 100 cm wide. How many centimetres wider will the new gutter be?', answer: 50, unit: 'cm', hint: 'Subtract the old width from the new width: 100 − 50.', formula: 'Extra width = 100 − 50', buildText: 'The wider gutter space has been marked on both sides of the road.' },
      { id: 3, title: 'Calculate the New Gutter Capacity', question: 'The new gutter is 100 cm wide and 90 cm deep. What is the cross-section area of the gutter?', answer: 9000, unit: 'cm²', hint: 'Area = width × depth. Calculate 100 × 90.', formula: 'Gutter area = 100 × 90', buildText: 'The deeper gutter trenches have been excavated.' },
      { id: 4, title: 'Raise the Road Level', question: 'The road surface must be raised by 30 cm. If the old road level is 0 cm, what will the new road level be?', answer: 30, unit: 'cm', hint: 'Add the raised height to the old road level: 0 + 30.', formula: 'New road level = 0 + 30', buildText: 'The road level has been raised above the rainwater path.' },
      { id: 5, title: 'Build Gutters on Both Sides', question: 'One side of the road needs 20 metres of gutter. Since gutters are needed on both sides, how many metres of gutter must be built altogether?', answer: 40, unit: 'm', hint: 'There are 2 sides. Calculate 20 × 2.', formula: 'Total gutter length = 20 × 2', buildText: 'Concrete gutter walls have been built along both sides of the road.' },
      { id: 6, title: 'Test Rainwater Flow', question: 'During heavy rain, the left gutter carries 40 buckets of water and the right gutter carries 40 buckets. How many buckets are carried away altogether?', answer: 80, unit: 'buckets', hint: 'Add the water carried by both gutters: 40 + 40.', formula: 'Total water carried = 40 + 40', buildText: 'The water flow channels and drain covers are complete. The road is ready for the heavy rain test.' }
    ]
  },
  {
    id: 'smart-irrigation-system',
    worldId: 'farm-market',
    title: 'Build a Smart Irrigation System',
    level: 'Beginner',
    status: 'active',
    age: 'Ages 9–14',
    description: 'Students use area, percentages, multiplication, addition and division to build an automatic watering system for a school garden.',
    maths: ['Area', 'Moisture percentage', 'Multiplication', 'Addition', 'Division', 'Water planning'],
    tools: ['Measuring tape', 'Soil moisture sensor', 'Water tank', 'Main pipe', 'Sprinklers', 'Smart controller'],
    steps: [
      { id: 1, title: 'Measure the Garden Bed', question: 'The school garden bed is 10 metres long and 4 metres wide. What is the area of the garden bed?', answer: 40, unit: 'm²', hint: 'Area = length × width. So calculate 10 × 4.', formula: 'Area = 10 × 4', buildText: 'The garden bed has been marked and prepared for irrigation.' },
      { id: 2, title: 'Check Soil Moisture', question: 'The soil moisture sensor reads 25%. The garden should be watered when moisture is below 40%. How many percentage points below 40% is the reading?', answer: 15, unit: 'percentage points', hint: 'Subtract the sensor reading from the watering level: 40 − 25.', formula: 'Dryness gap = 40 − 25', buildText: 'The soil moisture sensor has been installed and can detect dry soil.' },
      { id: 3, title: 'Calculate Water Needed', question: 'Each square metre of the garden needs 2 litres of water. If the garden area is 40 square metres, how many litres of water are needed?', answer: 80, unit: 'litres', hint: 'Multiply the garden area by the water needed per square metre: 40 × 2.', formula: 'Water needed = 40 × 2', buildText: 'The water tank has been sized correctly for the garden.' },
      { id: 4, title: 'Lay the Water Pipes', question: 'The main pipe is 10 metres long. Three smaller pipes are each 4 metres long. What is the total length of pipe needed?', answer: 22, unit: 'm', hint: 'Add the main pipe and the three smaller pipes: 10 + 4 + 4 + 4.', formula: 'Pipe length = 10 + 4 + 4 + 4', buildText: 'The water pipes have been laid across the garden rows.' },
      { id: 5, title: 'Install Sprinklers', question: 'Each garden row needs 2 sprinklers. If there are 4 rows, how many sprinklers are needed?', answer: 8, unit: 'sprinklers', hint: 'Multiply the number of rows by sprinklers per row: 4 × 2.', formula: 'Sprinklers = 4 × 2', buildText: 'Sprinklers have been installed to water all the plants evenly.' },
      { id: 6, title: 'Set the Watering Time', question: 'The system releases 10 litres of water every minute. If the garden needs 80 litres, how many minutes should the system water the garden?', answer: 8, unit: 'minutes', hint: 'Divide the total water needed by the water released each minute: 80 ÷ 10.', formula: 'Watering time = 80 ÷ 10', buildText: 'The smart controller, solar panel and automatic valve are connected. The system is ready for testing.' }
    ]
  },
  {
    id: 'tomato-sales-market', worldId: 'farm-market', title: 'Calculate Tomato Sales at Market', level: 'Beginner', status: 'active', age: 'Ages 9–13', description: 'Run a tomato stall using cost, revenue, profit and quantities.', maths: ['Money', 'Profit', 'Multiplication', 'Subtraction'], tools: ['Market stall', 'Tomato baskets', 'Cash book'],
    steps: [
      { id: 1, title: 'Count Baskets', question: 'There are 8 baskets with 10 tomatoes each. How many tomatoes are there?', answer: 80, unit: 'tomatoes', hint: 'Multiply baskets by tomatoes per basket.', formula: '8 × 10', buildText: 'Tomato baskets appear on the market table.' },
      { id: 2, title: 'Selling Price', question: 'Each tomato sells for 2 cedis. How much for 80 tomatoes?', answer: 160, unit: 'cedis', hint: 'Multiply 80 by 2.', formula: '80 × 2', buildText: 'The sales board updates.' },
      { id: 3, title: 'Cost Price', question: 'The tomatoes cost 100 cedis to buy. If sales are 160 cedis, what is the profit?', answer: 60, unit: 'cedis', hint: 'Profit = sales - cost.', formula: '160 - 100', buildText: 'The cash book shows profit.' },
      { id: 4, title: 'Share With Helpers', question: 'Two helpers share 20 cedis equally. How much does each get?', answer: 10, unit: 'cedis', hint: 'Divide 20 by 2.', formula: '20 ÷ 2', buildText: 'The helpers receive payment.' },
      { id: 5, title: 'Unsold Tomatoes', question: 'If 80 tomatoes were available and 65 were sold, how many were left?', answer: 15, unit: 'tomatoes', hint: 'Subtract sold from available.', formula: '80 - 65', buildText: 'Remaining tomatoes are packed.' },
      { id: 6, title: 'Market Day Score', question: 'The stall earns 25 points for each of 4 good decisions. What is the total score?', answer: 100, unit: 'points', hint: 'Multiply 25 by 4.', formula: '25 × 4', buildText: 'The tomato market mission is complete.' }
    ]
  },
  {
    id: 'smart-car-parking-system',
    worldId: 'space-lab',
    title: 'Build a Smart Car Parking System',
    level: 'Beginner',
    status: 'active',
    age: 'Ages 9–14',
    description: 'Students use area, division, multiplication, sensors, subtraction and display logic to build a realistic smart parking system with barriers and available-space counting.',
    maths: ['Area', 'Division', 'Multiplication', 'Counting', 'Subtraction', 'Automation logic'],
    tools: ['Measuring tape', 'Parking slot lines', 'Slot sensors', 'Smart counter', 'Display board', 'Entry barrier'],
    steps: [
      { id: 1, title: 'Measure the Parking Area', question: 'The parking area is 20 metres long and 10 metres wide. What is the area of the parking space?', answer: 200, unit: 'm²', hint: 'Area = length × width. So calculate 20 × 10.', formula: 'Area = 20 × 10', buildText: 'The parking area has been marked for construction.' },
      { id: 2, title: 'Mark Parking Slots', question: 'Each parking slot is 5 metres long. If the parking area is 20 metres long, how many parking slots can fit in one row?', answer: 4, unit: 'slots', hint: 'Divide the total length by the length of one slot: 20 ÷ 5.', formula: 'Slots in one row = 20 ÷ 5', buildText: 'Four parking spaces have been marked clearly in the first row.' },
      { id: 3, title: 'Count Total Parking Spaces', question: 'The car park has 2 rows. Each row has 4 parking slots. How many parking slots are there altogether?', answer: 8, unit: 'spaces', hint: 'Multiply the number of rows by the slots in each row: 2 × 4.', formula: 'Total spaces = 2 × 4', buildText: 'The full car park layout is complete with 8 spaces.' },
      { id: 4, title: 'Install Slot Sensors', question: 'Each parking slot needs 1 sensor. If there are 8 parking slots, how many sensors are needed?', answer: 8, unit: 'sensors', hint: 'One sensor goes into each parking slot, so 8 spaces need 8 sensors.', formula: 'Sensors = 8 × 1', buildText: 'Sensors have been installed in all parking spaces.' },
      { id: 5, title: 'Calculate Available Spaces', question: 'The car park has 8 spaces. If 5 cars are already parked, how many spaces are still available?', answer: 3, unit: 'spaces', hint: 'Subtract the parked cars from the total spaces: 8 − 5.', formula: 'Available spaces = 8 − 5', buildText: 'The system can now calculate available parking spaces.' },
      { id: 6, title: 'Display Available Spaces', question: 'The display board must show the number of empty spaces. If there are 8 spaces and 6 cars are parked, what number should the board display?', answer: 2, unit: 'spaces', hint: 'Empty spaces = total spaces − parked cars. Calculate 8 − 6.', formula: 'Display number = 8 − 6', buildText: 'The display board, entry barrier and traffic light are connected. The parking system is ready for testing.' }
    ]
  }
];

export const comingSoonProjects = ['Railway Track Planner', 'Solar House Builder', 'Market Stall Profit Planner', 'Drone Delivery Route', 'Stadium Seating Planner', 'Water Tower Engineer'];

export function findProject(projectId: string | undefined) {
  return projects.find((project) => project.id === projectId);
}

export function getActiveProjectForWorld(worldId: string) {
  const world = worlds.find((item) => item.id === worldId);
  return projects.find((project) => project.id === world?.activeProjectId);
}

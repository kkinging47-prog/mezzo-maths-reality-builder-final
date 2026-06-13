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
  { id: 'robotics-arena', name: 'Robotics Arena', tagline: 'Program robots with coordinates, steps and logic.', icon: '🤖', color: 'green', activeProjectId: 'simple-cleaning-robot' },
  { id: 'farm-market', name: 'Farm & Market Maths', tagline: 'Solve profit, quantity and daily business decisions.', icon: '🍅', color: 'gold', activeProjectId: 'tomato-sales-market' },
  { id: 'space-lab', name: 'Space Mission Lab', tagline: 'Launch missions with data, height, mass and timing.', icon: '🚀', color: 'pink', activeProjectId: 'weather-balloon-launch' }
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
    id: 'school-playground-layout', worldId: 'smart-city', title: 'Plan a School Playground Layout', level: 'Beginner', status: 'active', age: 'Ages 9–13', description: 'Design a playground using area, perimeter and spacing.', maths: ['Area', 'Perimeter', 'Multiplication', 'Planning'], tools: ['Measuring tape', 'Grid paper', 'Safety cones'],
    steps: [
      { id: 1, title: 'Measure the Field', question: 'A playground is 20m long and 10m wide. What is its area?', answer: 200, unit: 'm²', hint: 'Area = length × width.', formula: '20 × 10', buildText: 'The playground ground appears.' },
      { id: 2, title: 'Fence the Space', question: 'What is the perimeter of a 20m by 10m playground?', answer: 60, unit: 'm', hint: 'Add all four sides.', formula: '20 + 10 + 20 + 10', buildText: 'A safety fence surrounds the playground.' },
      { id: 3, title: 'Divide Into Zones', question: 'Half of 200m² is used for football. How many square metres is that?', answer: 100, unit: 'm²', hint: 'Half means divide by 2.', formula: '200 ÷ 2', buildText: 'The football zone is marked.' },
      { id: 4, title: 'Set Bench Spaces', question: 'If each bench needs 5m² and you have 20m², how many benches fit?', answer: 4, unit: 'benches', hint: 'Divide 20 by 5.', formula: '20 ÷ 5', buildText: 'Four benches appear for pupils.' },
      { id: 5, title: 'Plant Shade Trees', question: 'You plant trees every 5m along a 20m side, including both ends. How many tree positions?', answer: 5, unit: 'trees', hint: 'Positions are 0, 5, 10, 15 and 20.', formula: 'Count positions', buildText: 'Shade trees grow around the field.' },
      { id: 6, title: 'Final Layout Score', question: 'The playground has 4 zones with 25 points each. What is the total design score?', answer: 100, unit: 'points', hint: 'Multiply 4 by 25.', formula: '4 × 25', buildText: 'The school playground plan is approved.' }
    ]
  },
  {
    id: 'ferry-river-crossing', worldId: 'ship-engineering', title: 'Design a Ferry for River Crossing', level: 'Beginner', status: 'active', age: 'Ages 10–14', description: 'Build a ferry plan using capacity, trips, cost and crossing time.', maths: ['Division', 'Multiplication', 'Time', 'Capacity'], tools: ['Ferry deck', 'Life jackets', 'Route clock'],
    steps: [
      { id: 1, title: 'Passenger Capacity', question: 'A ferry carries 12 passengers per trip. How many passengers can it carry in 3 trips?', answer: 36, unit: 'passengers', hint: 'Multiply passengers per trip by trips.', formula: '12 × 3', buildText: 'The passenger deck expands.' },
      { id: 2, title: 'Number of Trips', question: '48 students need to cross. If the ferry carries 12 per trip, how many trips are needed?', answer: 4, unit: 'trips', hint: 'Divide 48 by 12.', formula: '48 ÷ 12', buildText: 'The ferry route schedule appears.' },
      { id: 3, title: 'Crossing Time', question: 'Each trip takes 15 minutes. How long will 4 trips take?', answer: 60, unit: 'minutes', hint: 'Multiply 4 by 15.', formula: '4 × 15', buildText: 'The route clock completes one hour.' },
      { id: 4, title: 'Fuel Estimate', question: 'The ferry uses 5 litres of fuel per trip. How many litres for 4 trips?', answer: 20, unit: 'litres', hint: 'Multiply 5 by 4.', formula: '5 × 4', buildText: 'The fuel tank is filled.' },
      { id: 5, title: 'Ticket Income', question: 'Each passenger pays 2 cedis. How much for 36 passengers?', answer: 72, unit: 'cedis', hint: 'Multiply 36 by 2.', formula: '36 × 2', buildText: 'The ticket counter records the income.' },
      { id: 6, title: 'Safety Jackets', question: 'There must be 1 life jacket per passenger. For 12 passengers, how many jackets are needed?', answer: 12, unit: 'jackets', hint: 'One passenger needs one jacket.', formula: '12 × 1', buildText: 'Life jackets appear and the ferry is ready.' }
    ]
  },
  {
    id: 'simple-cleaning-robot', worldId: 'robotics-arena', title: 'Program a Simple Cleaning Robot', level: 'Beginner', status: 'active', age: 'Ages 9–14', description: 'Control a robot with distance, turns, repeated steps and grid logic.', maths: ['Coordinates', 'Multiplication', 'Sequences', 'Logic'], tools: ['Robot', 'Grid map', 'Command blocks'],
    steps: [
      { id: 1, title: 'Move Forward', question: 'The robot moves 2 squares each command. After 3 commands, how many squares has it moved?', answer: 6, unit: 'squares', hint: 'Multiply 2 by 3.', formula: '2 × 3', buildText: 'The robot drives across the first tiles.' },
      { id: 2, title: 'Clean Tiles', question: 'The robot cleans 4 tiles in one row. How many tiles in 5 rows?', answer: 20, unit: 'tiles', hint: 'Rows times tiles per row.', formula: '4 × 5', buildText: 'The floor grid lights up clean.' },
      { id: 3, title: 'Battery Use', question: 'Each row uses 3% battery. How much battery for 5 rows?', answer: 15, unit: '%', hint: 'Multiply 3 by 5.', formula: '3 × 5', buildText: 'The robot battery monitor updates.' },
      { id: 4, title: 'Obstacle Route', question: 'The robot turns 90 degrees twice. What is the total angle turned?', answer: 180, unit: 'degrees', hint: 'Add 90 + 90.', formula: '90 + 90', buildText: 'The robot avoids the obstacle.' },
      { id: 5, title: 'Return Home', question: 'The robot is 8 squares away and moves 2 squares per second. How many seconds to return?', answer: 4, unit: 'seconds', hint: 'Divide 8 by 2.', formula: '8 ÷ 2', buildText: 'The robot returns to its charging base.' },
      { id: 6, title: 'Full Cleaning Score', question: 'The robot earns 10 points per clean row. What is the score for 5 rows?', answer: 50, unit: 'points', hint: 'Multiply 10 by 5.', formula: '10 × 5', buildText: 'Mission complete. The cleaning robot is programmed.' }
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
    id: 'weather-balloon-launch', worldId: 'space-lab', title: 'Launch a Weather Balloon', level: 'Beginner', status: 'active', age: 'Ages 10–15', description: 'Prepare a weather balloon mission using mass, height, speed and time.', maths: ['Time', 'Speed', 'Data', 'Multiplication'], tools: ['Balloon', 'Sensor box', 'Launch timer'],
    steps: [
      { id: 1, title: 'Sensor Mass', question: 'A sensor weighs 2kg. Three sensors weigh how many kilograms?', answer: 6, unit: 'kg', hint: 'Multiply 2 by 3.', formula: '2 × 3', buildText: 'Sensors attach to the balloon payload.' },
      { id: 2, title: 'Launch Rope', question: 'The rope is 5m long. Four ropes tied together give what length?', answer: 20, unit: 'm', hint: 'Multiply 5 by 4.', formula: '5 × 4', buildText: 'The launch rope extends.' },
      { id: 3, title: 'Rise Speed', question: 'The balloon rises 3m every second. How high after 10 seconds?', answer: 30, unit: 'm', hint: 'Speed times time.', formula: '3 × 10', buildText: 'The balloon begins to rise.' },
      { id: 4, title: 'Weather Readings', question: 'The sensor takes 6 readings per minute. How many readings in 5 minutes?', answer: 30, unit: 'readings', hint: 'Multiply 6 by 5.', formula: '6 × 5', buildText: 'Weather data fills the mission screen.' },
      { id: 5, title: 'Signal Check', question: 'A signal covers 25m. Two signal boosters cover how many metres?', answer: 50, unit: 'm', hint: 'Multiply 25 by 2.', formula: '25 × 2', buildText: 'Signal boosters activate.' },
      { id: 6, title: 'Mission Score', question: 'The mission has 5 tasks worth 20 points each. What is the total score?', answer: 100, unit: 'points', hint: 'Multiply 5 by 20.', formula: '5 × 20', buildText: 'The weather balloon mission launches successfully.' }
    ]
  }
];

export const comingSoonProjects = ['Railway Track Planner', 'Solar House Builder', 'Irrigation System Designer', 'Drone Delivery Route', 'Stadium Seating Planner', 'Water Tower Engineer'];

export function findProject(projectId: string | undefined) {
  return projects.find((project) => project.id === projectId);
}

export function getActiveProjectForWorld(worldId: string) {
  const world = worlds.find((item) => item.id === worldId);
  return projects.find((project) => project.id === world?.activeProjectId);
}

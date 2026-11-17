// "What can happen where I live" guides. Like the quick help cards, these
// ship inside the app and assume no power, no phone service and no outside
// help: what to set up beforehand, what to do while it's happening, and how
// to get through the days after.
//
// Writing rules: short sentences, everyday words, one action per line.
// Based on Ready.gov / FEMA, the American Red Cross, NOAA and the CDC.

import type { Climate, HazardId } from './place';
import type { Hue } from './theme';

export type Hazard = {
  id: HazardId;
  title: string;
  icon: string; // MaterialCommunityIcons name
  hue: Hue;
  /** One line: what this is and why it matters. */
  blurb: string;
  /** Do these on a calm day. */
  before: string[];
  /** It's happening now. */
  during: string[];
  /** The hours and days after, on your own. */
  after: string[];
  dont: string[];
  /** Words to try in Search for deeper guides. */
  search: string;
};

export const HAZARDS: Hazard[] = [
  {
    id: 'hurricane',
    title: 'Hurricane',
    icon: 'weather-hurricane',
    hue: 'blue',
    blurb: 'Days of warning, then wind, flooding and weeks without power.',
    before: [
      'Decide now: if you live near the coast or in a mobile home, your plan is to leave early.',
      'Know two ways out by road, and where you would stay inland.',
      'Store 2 weeks of water and food. Shops empty days before the storm.',
      'Fill the car and spare fuel cans when a storm is named. Pumps need power.',
      'Cut plywood to fit your windows, or fit storm shutters.',
      'Keep cash, medicine and papers in one waterproof bag you can grab.',
    ],
    during: [
      'Stay inside, away from windows. An inside room or hallway is best.',
      'Fill bathtubs, pots and bottles with water before it hits.',
      'Turn the fridge and freezer to coldest and keep them shut.',
      'If water is rising inside, go up. Take an axe or tool to the attic so you can break out through the roof.',
      'The calm in the middle is the eye. The wind comes back from the other side. Stay in.',
    ],
    after: [
      'Stay out of floodwater. It hides holes, live wires, sewage and snakes.',
      'Treat all tap water as unsafe. Boil it for 1 minute or use bleach.',
      'Eat the fridge food first, then the freezer, then your cans.',
      'Run generators and grills outside only, far from windows.',
      'Dry the house fast. Open it up and pull out wet carpet to stop mold.',
      'Wear boots and gloves for cleanup. Small cuts get infected fast in floodwater.',
    ],
    dont: [
      'Don’t wait for the last moment to leave. Roads jam and flood.',
      'Don’t drive or walk through moving water.',
      'Don’t use candles if you can smell gas.',
    ],
    search: 'hurricane',
  },
  {
    id: 'tornado',
    title: 'Tornado',
    icon: 'weather-tornado',
    hue: 'violet',
    blurb: 'Minutes of warning. Knowing where to go is everything.',
    before: [
      'Pick your safe spot today: a basement, or a small inside room on the lowest floor with no windows.',
      'Practice getting everyone there in under a minute.',
      'Keep shoes, a flashlight, a whistle and a helmet for each person in that spot.',
      'Get a battery or hand-crank weather radio. Sirens and phones can fail.',
      'Mobile homes are not safe. Find a sturdy building nearby you can run to.',
    ],
    during: [
      'Go to your safe spot now. Don’t stop to look or open windows.',
      'Get low, under something sturdy like a heavy table or stairs.',
      'Cover your head and neck with your arms, a mattress, or thick blankets.',
      'Caught outside or in a car with no shelter: lie flat in a ditch or low spot and cover your head.',
      'Signs one is close: a loud roar like a train, a dark green sky, large hail, sudden calm.',
    ],
    after: [
      'Wait for the roar to pass fully. Another can follow.',
      'Put on sturdy shoes before you move. There will be glass and nails.',
      'Smell gas? Get out and shut it off at the meter if you can.',
      'Stay away from fallen wires. Treat every one as live.',
      'Check neighbors. Tap and call out to find trapped people.',
      'Trapped yourself? Tap on a pipe or blow a whistle. Shouting wears you out.',
    ],
    dont: [
      'Don’t shelter under a highway bridge. Wind is stronger there.',
      'Don’t try to outrun it in a car through traffic.',
      'Don’t stay in a mobile home.',
    ],
    search: 'tornado',
  },
  {
    id: 'earthquake',
    title: 'Earthquake',
    icon: 'home-alert',
    hue: 'brown',
    blurb: 'No warning at all. What you set up beforehand is what saves you.',
    before: [
      'Strap tall furniture and the water heater to the wall.',
      'Keep heavy things on low shelves, and nothing heavy over beds.',
      'Learn where your gas, water and power shut-offs are. Keep a wrench by the gas meter.',
      'Keep shoes and a flashlight under every bed.',
      'Store 2 weeks of water. Pipes often break and taps stop.',
      'Near the sea? Know the fastest way to high ground on foot.',
    ],
    during: [
      'Drop to your hands and knees.',
      'Cover your head and neck. Get under a sturdy table if one is close.',
      'Hold on until the shaking stops.',
      'In bed: stay there and cover your head with a pillow.',
      'Outside: move into the open, away from buildings, wires and trees.',
      'Driving: pull over, away from bridges and wires, and stay in the car.',
    ],
    after: [
      'Near the coast and the shaking was strong or long? Walk to high ground right away. Don’t wait for a warning.',
      'Expect aftershocks. Drop and cover again each time.',
      'Smell gas or hear hissing? Shut it off and get out.',
      'Put on shoes. Check everyone for injuries.',
      'Leave buildings with big cracks or leaning walls.',
      'Save the water in your water heater and toilet tank (not the bowl). It’s clean.',
    ],
    dont: [
      'Don’t run outside during the shaking. Falling glass and bricks hurt most people.',
      'Don’t stand in a doorway. It’s no safer.',
      'Don’t light matches until you’re sure there is no gas leak.',
    ],
    search: 'earthquake',
  },
  {
    id: 'wildfire',
    title: 'Wildfire',
    icon: 'fire',
    hue: 'coral',
    blurb: 'Moves faster than you can run. Leaving early is the plan.',
    before: [
      'Clear dry leaves, brush and firewood 5 feet back from the house. That gap matters most.',
      'Clean gutters and the roof of dry leaves and needles.',
      'Know two ways out by car, and one on foot.',
      'Keep a go bag by the door: water, masks, medicine, papers, sturdy shoes.',
      'Keep the car facing out, with at least half a tank.',
      'Agree on a meeting place outside the area.',
    ],
    during: [
      'Leave as soon as you see or smell it close. Don’t wait to be told.',
      'Wear long cotton or wool clothes, sturdy shoes, and a mask or dry cloth over your nose.',
      'Before you go: shut all windows and doors, and turn off the gas.',
      'Drive with headlights on and windows up. Go slow in smoke.',
      'Trapped in a car: park in a clear area away from brush, close vents, lie on the floor under a wool blanket or coat.',
      'Trapped on foot: find a spot with nothing to burn (road, rocks, plowed field, water). Lie face down and cover up.',
    ],
    after: [
      'Stay away until it’s fully burned out. Fires flare up again in wind.',
      'Watch for hot spots: smoking stumps and ash pits burn feet badly.',
      'Wet down ash before sweeping so you don’t breathe it.',
      'Don’t drink tap water until you know it’s clean. Fire can poison pipes.',
      'Smoke hurts for days after. Stay in, and rest if your chest is tight.',
    ],
    dont: [
      'Don’t stay to defend the house.',
      'Don’t run uphill from a fire. Fire climbs fast.',
      'Don’t wear synthetic clothes. They melt.',
    ],
    search: 'wildfire',
  },
  {
    id: 'flood',
    title: 'Flood',
    icon: 'home-flood',
    hue: 'teal',
    blurb: 'The most common disaster anywhere. Most deaths are in cars.',
    before: [
      'Find out if your home is in a low spot or near a creek, river or storm drain.',
      'Know your way to higher ground on foot.',
      'Keep papers, medicine and chargers up high in a waterproof bag.',
      'Move valuables and fuel off the floor when heavy rain is coming.',
      'Store clean water. Floods make tap and well water unsafe.',
    ],
    during: [
      'Go to higher ground now. Don’t wait to see how high it gets.',
      'Never walk or drive into moving water. 6 inches can knock you over. 1 foot floats a car.',
      'If water is coming into the house, turn off power at the main switch, but only if you can reach it dry.',
      'Trapped inside: go to the top floor or roof. Avoid a closed attic unless you can break out.',
      'Car stalls in water: get out and move to higher ground.',
    ],
    after: [
      'Floodwater is sewage. Wash hands with soap and clean water after any contact.',
      'Boil or bleach all water until you know the supply is clean. Disinfect your well.',
      'Throw out any food that touched floodwater, even sealed in cardboard or screw-top jars.',
      'Don’t switch power back on if wiring got wet.',
      'Dry everything within 2 days to stop mold. Open up, pull out carpet and wet drywall.',
      'Watch for snakes and animals sheltering indoors.',
    ],
    dont: [
      'Don’t drive around road barriers.',
      'Don’t touch anything electrical while standing in water.',
      'Don’t let children play in floodwater.',
    ],
    search: 'flood',
  },
  {
    id: 'winter',
    title: 'Winter storm and deep cold',
    icon: 'snowflake-alert',
    hue: 'blue',
    blurb: 'Days with no heat or power. Cold kills quietly, indoors.',
    before: [
      'Have a way to heat one room without electricity, and a battery carbon monoxide alarm.',
      'Stock enough fuel or dry firewood for at least 2 weeks.',
      'Have a sleeping bag or 3 blankets per person, plus hats and wool socks.',
      'Store water. Pipes freeze and burst.',
      'Keep rock salt or sand, and a snow shovel.',
      'In the car: blankets, food, water, a candle and lighter, and a shovel.',
    ],
    during: [
      'Pick one small room and live in it. Close the doors. Hang blankets over windows and doorways.',
      'Put a tent or blanket fort inside that room and sleep in it together. Body heat adds up.',
      'Wear layers and a hat, even in bed. Stay dry. Change out of damp clothes.',
      'Eat and drink regularly. Food is fuel for body heat.',
      'Let taps drip and open cabinet doors under sinks to stop pipes freezing.',
      'Stuck in a car: stay with it. Run the engine 10 minutes each hour, with a window cracked and the tailpipe clear of snow.',
    ],
    after: [
      'Check on elderly neighbors. They get cold without noticing.',
      'Shovel in short stints. Heavy snow shoveling causes heart attacks.',
      'Clear snow from vents, the furnace exhaust and the roof if it’s deep.',
      'If a pipe burst, shut off the main water valve.',
      'Watch for numb white skin (frostbite) and shivering with confusion (hypothermia). See the Too cold card under Emergency.',
    ],
    dont: [
      'Don’t use a grill, camp stove, oven or generator indoors for heat. The fumes kill without warning.',
      'Don’t drink alcohol to warm up. It cools you faster.',
      'Don’t eat snow for water. Melt it first.',
    ],
    search: 'cold weather',
  },
  {
    id: 'heat',
    title: 'Extreme heat',
    icon: 'thermometer-alert',
    hue: 'sun',
    blurb: 'With no power there is no air conditioning. Heat kills more people than storms.',
    before: [
      'Store extra water: at least 1.5 gallons per person per day.',
      'Find the coolest place in your home. Usually the lowest floor, on the shady side.',
      'Get battery fans, spray bottles and light-colored cotton clothes.',
      'Put up outside shade on sunny windows: awnings, shutters, even cardboard and foil.',
      'Know a cool place nearby: a basement, a shaded creek, a big stone building.',
    ],
    during: [
      'Drink before you’re thirsty. A cup every 20 minutes when working. Pale pee means you’re doing well.',
      'Stay in the coolest room. Close windows and curtains by day, open everything at night.',
      'Wet your skin and clothes and sit in moving air. Soak feet in cool water.',
      'Do hard work only at dawn and dusk.',
      'Add a pinch of salt and a little sugar to water if you’re sweating for hours.',
      'Check on babies, older people and pets often. They overheat first.',
    ],
    after: [
      'Keep drinking for a day or two. Catching up takes time.',
      'Food spoils fast in heat with no fridge. When in doubt, throw it out.',
      'Headache, cramps, dizziness or feeling sick mean stop, cool down and drink. See the Overheating card under Emergency.',
    ],
    dont: [
      'Don’t leave anyone in a parked car, even for a minute.',
      'Don’t rely on a fan alone above about 95°F. Wet your skin too.',
      'Don’t wait for thirst. In dry heat you don’t notice the sweat.',
    ],
    search: 'heat',
  },
];

export const findHazard = (id: string) => HAZARDS.find((h) => h.id === id);

/** The single most useful sentence for each kind of climate. */
export const CLIMATE_TIPS: Record<Climate, string[]> = {
  cold: [
    'Heat is your first job. A way to warm one room without power matters more than anything else you own.',
    'Your growing season is short. Store more food, and learn to keep it through winter: root cellar, canning, drying.',
    'Snow is a water source, but always melt it first.',
  ],
  mixed: [
    'Plan for both ends: heat for winter with no power, and shade and water for summer.',
    'You can grow a lot from spring to fall. Preserving the harvest is how you eat in winter.',
    'Rain catchment works well most of the year where you are.',
  ],
  humid: [
    'Heat and bad water are your biggest risks. Store extra water and know how to cool down without power.',
    'Food spoils and mold grows fast here. Keep stores sealed, dry and off the floor.',
    'You can grow food nearly all year, and rain catchment works well.',
  ],
  dry: [
    'Water is everything here. Store far more than you think you need, and know your nearest source.',
    'Do outdoor work at dawn and dusk. Shade is shelter.',
    'Gardens need water you may not have. Store more food, and grow in shade with mulch.',
  ],
  mild: [
    'Staying dry is your main job. Wet and cool together chill you fast, even well above freezing.',
    'Rain catchment can cover most of your water. Store for the dry season.',
    'You can grow cool-weather crops most of the year.',
  ],
};

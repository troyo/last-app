// "What's happening?" People in trouble think in situations, not topics. Each situation is a
// short plan: the cards, disaster guides and checklist that matter for it, in the order to
// open them. Everything it points at is built into the app, so it works with no download.
import type { Hue } from './theme';

export type Link =
  | { kind: 'help'; id: string }
  | { kind: 'hazard'; id: string }
  | { kind: 'checklist'; id: string };

export type Situation = {
  id: string;
  icon: string; // MaterialCommunityIcons name
  hue: Hue;
  title: string;
  /** One line under the title. */
  blurb: string;
  /** A few things to do first, before opening any card. */
  first?: string[];
  links: Link[];
  /** Ask a few yes/no questions first (used for "Someone's hurt"). */
  triage?: boolean;
};

const help = (...ids: string[]): Link[] => ids.map((id) => ({ kind: 'help', id }));
const hazard = (...ids: string[]): Link[] => ids.map((id) => ({ kind: 'hazard', id }));

export const SITUATIONS: Situation[] = [
  {
    id: 'hurt',
    icon: 'medical-bag',
    hue: 'red',
    title: 'Someone’s hurt',
    blurb: 'Three quick questions to find the right steps.',
    triage: true,
    links: help('choking', 'burn', 'broken-bone', 'heat', 'cold', 'snake-bite'),
  },
  {
    id: 'power',
    icon: 'flashlight',
    hue: 'violet',
    title: 'Power’s out',
    blurb: 'Light, food, heat and your phone, with what’s in the house.',
    links: [
      ...help('power', 'light', 'food-cold', 'cook', 'phone', 'warm', 'cool', 'store-water'),
      { kind: 'checklist', id: '3-days' },
    ],
  },
  {
    id: 'water',
    icon: 'water-off',
    hue: 'blue',
    title: 'No water',
    blurb: 'The taps are dry, or the water isn’t safe.',
    links: help('store-water', 'water', 'find-water', 'toilet'),
  },
  {
    id: 'storm',
    icon: 'weather-lightning-rainy',
    hue: 'teal',
    title: 'Storm coming',
    blurb: 'You have hours or days. Use them.',
    first: [
      'Fill water containers and the bathtub now.',
      'Charge every phone, power bank and flashlight.',
      'Fill the car with fuel and park it facing out.',
      'Bring in or tie down anything loose outside.',
      'Put medicine, papers, cash and chargers in one bag by the door.',
    ],
    links: [
      ...hazard('hurricane', 'tornado', 'flood', 'winter'),
      ...help('store-water', 'phone'),
      { kind: 'checklist', id: '3-days' },
    ],
  },
  {
    id: 'temp',
    icon: 'thermometer-alert',
    hue: 'sun',
    title: 'Too hot or too cold',
    blurb: 'For a person in trouble, or a house with no heat or AC.',
    links: [...help('heat', 'cold', 'cool', 'warm'), ...hazard('heat', 'winter')],
  },
  {
    id: 'leave',
    icon: 'exit-run',
    hue: 'coral',
    title: 'Need to leave',
    blurb: 'Fire, flood or an order to go. Leave early, not late.',
    first: [
      'Go now if you are told to, or if you see flames, rising water or smell gas. Things can be replaced.',
      'Grab: water, medicine, phone and charger, papers and cash, warm clothes, sturdy shoes.',
      'Take pets. Bring their food and a leash or carrier.',
      'If there is time and you know how: turn off the gas, water and power.',
      'Leave a note on the door saying where you went and when.',
      'Take roads you know. Never drive or walk through moving water.',
    ],
    links: [...hazard('wildfire', 'flood', 'hurricane'), ...help('signal', 'shelter', 'lost')],
  },
];

export const findSituation = (id: string) => SITUATIONS.find((s) => s.id === id);

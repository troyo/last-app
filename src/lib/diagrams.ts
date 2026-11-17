// Simple pictures for the moments words alone are hard to follow. They ship
// inside the app, so they show with no internet.
export const DIAGRAMS = {
  cpr: {
    image: require('../../assets/diagrams/cpr.png'),
    alt: 'A person lying on their back. Two hands, one on top of the other, press on the center of the chest.',
  },
  tourniquet: {
    image: require('../../assets/diagrams/tourniquet.png'),
    alt: 'A leg with a band tied 2 to 3 inches above the wound, on the side nearer the body, with a stick twisted through it.',
  },
  recovery: {
    image: require('../../assets/diagrams/recovery.png'),
    alt: 'A person lying on their side with the head tilted back, a hand under the cheek and the top knee bent forward.',
  },
} as const;

export type DiagramId = keyof typeof DIAGRAMS;

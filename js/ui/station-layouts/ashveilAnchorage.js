// Ashveil Anchorage — simple layout with reactor overhaul

export const LAYOUT = {
  type:  'simple',
  theme: 'neutral',
  zones: [
    {
      id:          'repair-bay',
      label:       'Repair Bay',
      description: 'Structural and armor work. Engine overhauls available.',
      services:    ['repair', 'reactor'],
      flavor: [
        'ASHVEIL ANCHORAGE — OPEN PORT',
        '',
        'Eastern terminus of the Gravewake trade lanes.',
        'Built from the hull of a decommissioned colony ship.',
        'Repairs are expensive. Being stranded is worse.',
        '',
        '[ REPAIR BAY ]',
        'Structural and armor work only.',
        'Engine overhauls require advance booking.',
      ],
      requiredStanding: null,
    },
    {
      id:          'trade-post',
      label:       'Trade Post',
      description: 'Outbound cargo accepted. Inbound prices reflect the run.',
      services:    ['trade'],
      flavor: [
        '[ TRADE POST ]',
        '',
        'Outbound cargo accepted. Inbound prices',
        'reflect the difficulty of the run.',
      ],
      requiredStanding: null,
    },
    {
      id:          'bounties',
      label:       'Bounty Board',
      description: 'Posted contracts from Anchorage operators.',
      services:    ['bounties'],
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'intel',
      label:       'Intel',
      description: 'Station intelligence and local knowledge.',
      services:    ['intel'],
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'relations',
      label:       'Relations',
      description: 'Faction standings.',
      services:    ['relations'],
      flavor: [],
      requiredStanding: null,
    },
  ],
};

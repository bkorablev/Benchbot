export const POLYMERASES = {
  Q5: {
    id: 'Q5',
    name: 'Q5 High-Fidelity (NEB)',
    extensionRate: 30,       // s/kb
    annealingOffset: -1,     // °C below lowest primer Tm
    denaturation: { temp: 98, time: 10 },
    initialDenaturation: { temp: 98, time: 30 },
    finalExtension: { temp: 72, time: 120 },
    extensionTemp: 72,
    baseVolume: 25,
    recipe: [
      { component: 'Q5 2× Master Mix',        volume: 12.5,   mastermix: true  },
      { component: 'Forward Primer (10 μM)',   volume:  1.25,  mastermix: true  },
      { component: 'Reverse Primer (10 μM)',   volume:  1.25,  mastermix: true  },
      { component: 'Template DNA',             volume:  1.0,   mastermix: false },
      { component: 'Nuclease-free water',      volume:  9.0,   mastermix: true  },
    ],
    note: 'Use NEB Tm Calculator for best results. GC enhancer may be needed for difficult templates.',
  },
  Phusion: {
    id: 'Phusion',
    name: 'Phusion High-Fidelity (NEB)',
    extensionRate: 30,
    annealingOffset: -1,
    denaturation: { temp: 98, time: 10 },
    initialDenaturation: { temp: 98, time: 30 },
    finalExtension: { temp: 72, time: 300 },
    extensionTemp: 72,
    baseVolume: 25,
    recipe: [
      { component: '5× Phusion HF Buffer',    volume:  5.0,   mastermix: true  },
      { component: '10 mM dNTPs',             volume:  0.5,   mastermix: true  },
      { component: 'Forward Primer (10 μM)',   volume:  1.25,  mastermix: true  },
      { component: 'Reverse Primer (10 μM)',   volume:  1.25,  mastermix: true  },
      { component: 'Phusion Polymerase',       volume:  0.25,  mastermix: true  },
      { component: 'Template DNA',             volume:  1.0,   mastermix: false },
      { component: 'Nuclease-free water',      volume: 15.75,  mastermix: true  },
    ],
    note: 'Phusion is sensitive to over-extension. Do not exceed recommended extension times.',
  },
  Taq: {
    id: 'Taq',
    name: 'Taq Polymerase',
    extensionRate: 60,
    annealingOffset: -5,
    denaturation: { temp: 95, time: 30 },
    initialDenaturation: { temp: 95, time: 180 },
    finalExtension: { temp: 72, time: 300 },
    extensionTemp: 72,
    baseVolume: 25,
    recipe: [
      { component: '10× Taq Buffer',          volume:  2.5,   mastermix: true  },
      { component: '10 mM dNTPs',             volume:  0.5,   mastermix: true  },
      { component: 'Forward Primer (10 μM)',   volume:  1.25,  mastermix: true  },
      { component: 'Reverse Primer (10 μM)',   volume:  1.25,  mastermix: true  },
      { component: 'Taq Polymerase',           volume:  0.125, mastermix: true  },
      { component: 'Template DNA',             volume:  1.0,   mastermix: false },
      { component: 'Nuclease-free water',      volume: 18.375, mastermix: true  },
    ],
    note: null,
  },
};

export const POLYMERASE_OPTIONS = Object.values(POLYMERASES).map((p) => ({
  value: p.id,
  label: p.name,
}));

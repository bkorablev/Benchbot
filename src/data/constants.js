export const CELL_LINES = ['K562', 'HEK293T', 'Jurkat', 'HeLa', 'Other'];

export const ELECTROPORATION_SYSTEMS = [
  'Lonza 4D-Nucleofector',
  'Neon',
  'SE Cell Line 4D-Nucleofector',
  'Other',
];

export const PLATE_FORMATS = [
  { label: '96-well', wells: 96, rows: 8, cols: 12 },
  { label: '48-well', wells: 48, rows: 6, cols: 8 },
  { label: '24-well', wells: 24, rows: 4, cols: 6 },
];

export const MOLAR_RATIOS = [
  { label: '1:1.2 (standard)', value: 1.2 },
  { label: '1:1', value: 1.0 },
  { label: '1:1.5', value: 1.5 },
  { label: '1:2', value: 2.0 },
];

export const GUIDE_COLORS = [
  '#0d9488', // teal-600
  '#7c3aed', // violet-600
  '#ea580c', // orange-600
  '#0284c7', // sky-600
  '#16a34a', // green-600
  '#db2777', // pink-600
  '#ca8a04', // yellow-600
  '#9333ea', // purple-600
];

// Electroporation settings per cell line + system
export const ELECTROPORATION_SETTINGS = {
  'K562': {
    'Lonza 4D-Nucleofector': {
      buffer: 'SF Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'FF-120',
      tip: 'Use program FF-120. Cells recover quickly after electroporation.',
      cellCount: '2 × 10⁵',
    },
    'SE Cell Line 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'FF-120',
      tip: 'SE solution is optimized for suspension cells. Use FF-120 program.',
      cellCount: '2 × 10⁵',
    },
    'Neon': {
      buffer: 'Neon Buffer T',
      tipCuvette: '10 μL Neon Tip',
      program: '1450 V / 35 ms / 2 pulses',
      tip: 'Pre-warm media before electroporation for best viability.',
      cellCount: '2 × 10⁵',
    },
    'Other': {
      buffer: 'Manufacturer recommended buffer',
      tipCuvette: 'Per manufacturer specification',
      program: 'Optimize per protocol',
      tip: 'Consult manufacturer guidelines for optimal conditions.',
      cellCount: '2 × 10⁵',
    },
  },
  'HEK293T': {
    'Lonza 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'CM-130',
      tip: 'Use program CM-130. Plate cells immediately after electroporation.',
      cellCount: '2 × 10⁵',
    },
    'SE Cell Line 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'CM-130',
      tip: 'Adherent cell line — pipette gently post-electroporation.',
      cellCount: '2 × 10⁵',
    },
    'Neon': {
      buffer: 'Neon Buffer R',
      tipCuvette: '10 μL Neon Tip',
      program: '1005 V / 35 ms / 2 pulses',
      tip: 'HEK293T cells are fragile — avoid extended time outside incubator.',
      cellCount: '2 × 10⁵',
    },
    'Other': {
      buffer: 'Manufacturer recommended buffer',
      tipCuvette: 'Per manufacturer specification',
      program: 'Optimize per protocol',
      tip: 'Consult manufacturer guidelines for optimal conditions.',
      cellCount: '2 × 10⁵',
    },
  },
  'Jurkat': {
    'Lonza 4D-Nucleofector': {
      buffer: 'SF Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'CL-120',
      tip: 'Use program CL-120 for Jurkat cells. Suspension culture — do not centrifuge too hard.',
      cellCount: '2 × 10⁵',
    },
    'SE Cell Line 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'CL-120',
      tip: 'Jurkat T cells respond well to CL-120 program.',
      cellCount: '2 × 10⁵',
    },
    'Neon': {
      buffer: 'Neon Buffer T',
      tipCuvette: '10 μL Neon Tip',
      program: '1600 V / 10 ms / 3 pulses',
      tip: 'Higher voltage required for Jurkat T cells. Monitor viability closely.',
      cellCount: '2 × 10⁵',
    },
    'Other': {
      buffer: 'Manufacturer recommended buffer',
      tipCuvette: 'Per manufacturer specification',
      program: 'Optimize per protocol',
      tip: 'Consult manufacturer guidelines for optimal conditions.',
      cellCount: '2 × 10⁵',
    },
  },
  'HeLa': {
    'Lonza 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'CN-114',
      tip: 'Use program CN-114 for HeLa cells. Trypsinize thoroughly before electroporation.',
      cellCount: '2 × 10⁵',
    },
    'SE Cell Line 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'CN-114',
      tip: 'Ensure cells are fully dissociated for optimal electroporation.',
      cellCount: '2 × 10⁵',
    },
    'Neon': {
      buffer: 'Neon Buffer R',
      tipCuvette: '10 μL Neon Tip',
      program: '1005 V / 35 ms / 2 pulses',
      tip: 'HeLa cells tolerate standard Neon conditions well.',
      cellCount: '2 × 10⁵',
    },
    'Other': {
      buffer: 'Manufacturer recommended buffer',
      tipCuvette: 'Per manufacturer specification',
      program: 'Optimize per protocol',
      tip: 'Consult manufacturer guidelines for optimal conditions.',
      cellCount: '2 × 10⁵',
    },
  },
  'Other': {
    'Lonza 4D-Nucleofector': {
      buffer: 'SF or SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'Optimize per cell line',
      tip: 'Consult Lonza cell line optimization database for recommended program.',
      cellCount: '2 × 10⁵',
    },
    'SE Cell Line 4D-Nucleofector': {
      buffer: 'SE Cell Line Solution',
      tipCuvette: '100 μL Nucleocuvette Strip',
      program: 'Optimize per cell line',
      tip: 'Refer to Lonza optimization tool for cell-line-specific programs.',
      cellCount: '2 × 10⁵',
    },
    'Neon': {
      buffer: 'Neon Buffer R or T',
      tipCuvette: '10 μL Neon Tip',
      program: 'Optimize per cell line',
      tip: 'Use Neon optimization protocol to determine voltage and pulse settings.',
      cellCount: '2 × 10⁵',
    },
    'Other': {
      buffer: 'Manufacturer recommended buffer',
      tipCuvette: 'Per manufacturer specification',
      program: 'Optimize per protocol',
      tip: 'Consult manufacturer guidelines for optimal conditions.',
      cellCount: '2 × 10⁵',
    },
  },
};

export function getElectroporationSettings(cellLine, system) {
  return (
    ELECTROPORATION_SETTINGS[cellLine]?.[system] ||
    ELECTROPORATION_SETTINGS['Other']['Other']
  );
}

export const BUFFER_PRESETS = [
  {
    id: 'pbs_1x',
    name: '1x PBS',
    components: [
      { name: 'NaCl',     stockConc: 5,   stockUnit: 'M',  targetConc: 137, targetUnit: 'mM' },
      { name: 'KCl',      stockConc: 1,   stockUnit: 'M',  targetConc: 2.7, targetUnit: 'mM' },
      { name: 'Na₂HPO₄', stockConc: 1,   stockUnit: 'M',  targetConc: 10,  targetUnit: 'mM' },
      { name: 'KH₂PO₄',  stockConc: 1,   stockUnit: 'M',  targetConc: 1.8, targetUnit: 'mM' },
    ],
  },
  {
    id: 'tae_1x',
    name: '1x TAE',
    components: [
      { name: 'Tris base',      stockConc: 1,    stockUnit: 'M',  targetConc: 40, targetUnit: 'mM' },
      { name: 'Acetic acid',    stockConc: 17.4, stockUnit: 'M',  targetConc: 20, targetUnit: 'mM' },
      { name: 'EDTA (pH 8.0)', stockConc: 500,  stockUnit: 'mM', targetConc: 1,  targetUnit: 'mM' },
    ],
  },
  {
    id: 'tbe_1x',
    name: '1x TBE',
    components: [
      { name: 'Tris base',      stockConc: 1,   stockUnit: 'M',  targetConc: 89, targetUnit: 'mM' },
      { name: 'Boric acid',     stockConc: 1,   stockUnit: 'M',  targetConc: 89, targetUnit: 'mM' },
      { name: 'EDTA (pH 8.0)', stockConc: 500, stockUnit: 'mM', targetConc: 2,  targetUnit: 'mM' },
    ],
  },
  {
    id: 'ripa_10x',
    name: '10x RIPA Lysis Buffer',
    components: [
      { name: 'Tris-HCl pH 8.0',    stockConc: 1,   stockUnit: 'M',       targetConc: 50,  targetUnit: 'mM'      },
      { name: 'NaCl',                stockConc: 5,   stockUnit: 'M',       targetConc: 150, targetUnit: 'mM'      },
      { name: 'NP-40',               stockConc: 100, stockUnit: '% (v/v)', targetConc: 1,   targetUnit: '% (v/v)' },
      { name: 'Sodium deoxycholate', stockConc: 100, stockUnit: '% (w/v)', targetConc: 0.5, targetUnit: '% (w/v)' },
      { name: 'SDS',                 stockConc: 10,  stockUnit: '% (w/v)', targetConc: 0.1, targetUnit: '% (w/v)' },
    ],
  },
  {
    id: 'laemmli_2x',
    name: '2x Laemmli Sample Buffer',
    components: [
      { name: 'Tris-HCl pH 6.8',  stockConc: 1,   stockUnit: 'M',       targetConc: 62.5, targetUnit: 'mM'      },
      { name: 'SDS',              stockConc: 10,  stockUnit: '% (w/v)', targetConc: 2,    targetUnit: '% (w/v)' },
      { name: 'Glycerol',         stockConc: 100, stockUnit: '% (v/v)', targetConc: 10,   targetUnit: '% (v/v)' },
      { name: 'Bromophenol blue', stockConc: 1,   stockUnit: '% (w/v)', targetConc: 0.01, targetUnit: '% (w/v)' },
    ],
  },
];

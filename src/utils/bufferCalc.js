export const CONC_UNITS = ['M', 'mM', 'μM', '% (w/v)', '% (v/v)', 'mg/mL', 'g/L', 'x'];
export const VOL_UNITS  = ['μL', 'mL', 'L'];

// Compatibility groups — same group = compatible unit pair
const UNIT_GROUP = {
  'M': 'molar', 'mM': 'molar', 'μM': 'molar',
  '% (w/v)': 'percent', '% (v/v)': 'percent',
  'mg/mL': 'mass_vol', 'g/L': 'mass_vol',
  'x': 'fold',
};

// Multiplier to convert to the group's base unit
const CONC_FACTOR = {
  'M': 1, 'mM': 1e-3, 'μM': 1e-6,
  '% (w/v)': 1, '% (v/v)': 1,
  'mg/mL': 1, 'g/L': 1,
  'x': 1,
};

const VOL_TO_L = { 'μL': 1e-6, 'mL': 1e-3, 'L': 1 };

/**
 * C1V1 = C2V2  →  V1 = (C2 × V2) / C1
 *
 * Returns:
 *   null                 — insufficient inputs (null/NaN/zero finalVolume)
 *   { error: string }    — calculation not possible
 *   { volume: number }   — V1 in finalUnit
 */
export function calcVolume(stockConc, stockUnit, targetConc, targetUnit, finalVolume, finalUnit) {
  if (stockConc == null || targetConc == null || finalVolume == null) return null;

  const sc = Number(stockConc);
  const tc = Number(targetConc);
  const fv = Number(finalVolume);

  if (isNaN(sc) || isNaN(tc) || isNaN(fv) || fv <= 0) return null;

  // targetConc = 0 → add nothing
  if (tc === 0) return { volume: 0 };

  if (sc === 0) return { error: 'Stock concentration cannot be zero' };

  const sg = UNIT_GROUP[stockUnit];
  const tg = UNIT_GROUP[targetUnit];
  if (!sg || !tg || sg !== tg) return { error: 'Incompatible units' };

  const c1 = sc * CONC_FACTOR[stockUnit];
  const c2 = tc * CONC_FACTOR[targetUnit];

  const v2L = fv * VOL_TO_L[finalUnit];
  const v1L = (c2 * v2L) / c1;
  const v1  = v1L / VOL_TO_L[finalUnit];

  return { volume: v1 };
}

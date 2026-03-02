// Cas9 molecular weight: ~158 kDa
const CAS9_MW_KDA = 158;

/**
 * Calculate RNP volumes per reaction
 * Standard: 30 pmol Cas9 in 5 μL total volume
 *
 * @param {number} cas9StockUM - Cas9 stock concentration in μM
 * @param {number} sgrnaStockUM - sgRNA stock concentration in μM
 * @param {number} ratio - Cas9:sgRNA molar ratio (e.g. 1.2 means 1:1.2)
 * @returns {object} calculated volumes and amounts
 */
export function calculateRNP(cas9StockUM, sgrnaStockUM, ratio) {
  const totalVolume = 5; // μL, always 5
  const cas9Pmol = 30; // pmol Cas9 per reaction (standard)

  const sgrnaPmol = cas9Pmol * ratio;

  // Volumes
  const cas9VolUL = cas9Pmol / (cas9StockUM * 1000); // cas9StockUM is μM = pmol/μL * 1000... wait
  // cas9StockUM [μM] = [pmol/μL] * 1000? No.
  // 1 μM = 1 μmol/L = 1 nmol/mL = 1 pmol/μL
  // So cas9Stock [μM] = cas9Stock [pmol/μL]
  const cas9Vol = cas9Pmol / cas9StockUM; // μL
  const sgrnaVol = sgrnaPmol / sgrnaStockUM; // μL

  const bufferTopUp = Math.max(0, totalVolume - cas9Vol - sgrnaVol);

  // Mass
  const cas9Ug = (cas9Pmol * CAS9_MW_KDA) / 1000; // pmol * kDa / 1000 = μg
  // sgRNA ~100 nt: MW ≈ 33 kDa
  const sgrnaUg = (sgrnaPmol * 33) / 1000;

  return {
    cas9Pmol,
    sgrnaPmol,
    cas9Ug: +cas9Ug.toFixed(2),
    sgrnaUg: +sgrnaUg.toFixed(2),
    cas9Vol: +cas9Vol.toFixed(2),
    sgrnaVol: +sgrnaVol.toFixed(2),
    bufferTopUp: +bufferTopUp.toFixed(2),
    totalVolume,
    ratio,
    valid: cas9Vol + sgrnaVol <= totalVolume,
  };
}

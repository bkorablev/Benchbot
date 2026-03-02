/**
 * SantaLucia 1998 nearest-neighbor thermodynamic parameters.
 * Keys cover all 16 ACGT dinucleotides mapped to 10 unique parameter sets.
 * dH: kcal/mol  |  dS: cal/mol·K
 */
const NN = {
  AA: { dH: -7.9,  dS: -22.2 }, TT: { dH: -7.9,  dS: -22.2 },
  AT: { dH: -7.2,  dS: -20.4 },
  TA: { dH: -7.2,  dS: -21.3 },
  CA: { dH: -8.5,  dS: -22.7 }, TG: { dH: -8.5,  dS: -22.7 },
  GT: { dH: -8.4,  dS: -22.4 }, AC: { dH: -8.4,  dS: -22.4 },
  CT: { dH: -7.8,  dS: -21.0 }, AG: { dH: -7.8,  dS: -21.0 },
  GA: { dH: -8.2,  dS: -22.2 }, TC: { dH: -8.2,  dS: -22.2 },
  CG: { dH: -10.6, dS: -27.2 },
  GC: { dH: -9.8,  dS: -24.4 },
  GG: { dH: -8.0,  dS: -19.9 }, CC: { dH: -8.0,  dS: -19.9 },
};

const INIT_DH = 0.2;   // kcal/mol
const INIT_DS = -5.7;  // cal/mol·K
const R = 1.987;       // cal/mol·K

/** Convert concentration to Molar */
export function concToMolar(value, unit) {
  const v = parseFloat(value) || 0;
  if (unit === 'mM') return v * 1e-3;
  if (unit === 'pmol/μL') return v * 1e-6; // 1 pmol/μL = 1 μM
  return v * 1e-6; // μM default
}

/** True if sequence contains any non-ACGT character */
export function hasAmbiguousBases(seq) {
  return seq.split('').some((c) => !'ACGT'.includes(c));
}

/** GC% as a number 0–100 */
export function calcGC(seq) {
  if (!seq || seq.length === 0) return 0;
  return ((seq.match(/[GC]/g) || []).length / seq.length) * 100;
}

/**
 * Calculate Tm using SantaLucia 1998 nearest-neighbor method.
 * Ambiguous bases are stripped before calculation (result marked approximate by caller).
 * @param {string} sequence - uppercase DNA sequence
 * @param {number} concM - primer concentration in Molar (default 2.5e-7 = 0.25 μM)
 * @returns {number|null}
 */
export function calcTm(sequence, concM = 2.5e-7) {
  if (!sequence || sequence.length < 2) return null;
  const seq = sequence.toUpperCase().replace(/[^ACGT]/g, '');
  if (seq.length < 2) return null;

  let dH = INIT_DH;
  let dS = INIT_DS;

  for (let i = 0; i < seq.length - 1; i++) {
    const p = NN[seq[i] + seq[i + 1]];
    if (p) { dH += p.dH; dS += p.dS; }
  }

  const c = Math.max(concM, 1e-12);
  const tm = (dH * 1000) / (dS + R * Math.log(c / 4)) - 273.15;
  return Math.round(tm * 10) / 10;
}

/**
 * Per-primer warnings (length, GC, ambiguous bases).
 * Cross-reaction Tm-mismatch warnings are added in PCRModule.
 */
export function getPrimerWarnings(primer) {
  const warnings = [];
  const seq = (primer.sequence || '').toUpperCase();
  const len = seq.length;
  if (len === 0) return warnings;

  if (len < 18) warnings.push('Primer too short — may have poor specificity');
  if (len > 35) warnings.push('Long primer — verify synthesis quality');
  if (hasAmbiguousBases(seq)) warnings.push('Contains ambiguous bases — Tm calculation approximate');

  const gc = calcGC(seq);
  if (gc < 40) warnings.push('Extreme GC content (<40%) — check for secondary structures');
  if (gc > 70) warnings.push('Extreme GC content (>70%) — check for secondary structures');

  return warnings;
}

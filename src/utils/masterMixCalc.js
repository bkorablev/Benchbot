/**
 * Build master mix descriptors from experiment + per-reaction RNP volumes.
 *
 * Returns an array of MM objects. Returns an empty array when every condition
 * has exactly 1 replicate (caller should show the "no MMs needed" note).
 *
 * Scale factor = ceil(n × 1.1 × 10) / 10  → n reactions + 10% overage, 1 d.p.
 */

function ceil1dp(x) {
  return Math.ceil(x * 10) / 10;
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function rnpMM(name, n, rnpResult) {
  const scale = ceil1dp(n * 1.1);
  return {
    name,
    reactions: n,
    scale,
    cas9Vol: round2(rnpResult.cas9Vol * scale),
    sgrnaVol: round2(rnpResult.sgrnaVol * scale),
    bufferTopUp: round2(rnpResult.bufferTopUp * scale),
    totalVol: round2(5 * scale),
    perReactionVol: 5,
    isUntransfected: false,
  };
}

export function buildMasterMixes(guides, controls, rnpResult) {
  const mixes = [];

  // One MM per guide with ≥ 2 replicates
  guides.forEach((g) => {
    if (g.replicates >= 2) {
      mixes.push(rnpMM(`${g.name || g.label} MM`, g.replicates, rnpResult));
    }
  });

  // Non-targeting control
  if (controls.nonTargeting?.enabled && controls.nonTargeting.replicates >= 2) {
    mixes.push(rnpMM('Non-targeting Control MM', controls.nonTargeting.replicates, rnpResult));
  }

  // Positive control
  if (controls.positiveControl?.enabled && controls.positiveControl.replicates >= 2) {
    mixes.push(rnpMM('Positive Control MM', controls.positiveControl.replicates, rnpResult));
  }

  // Untransfected — no RNP, flag explicitly
  if (controls.untransfected?.enabled && controls.untransfected.replicates >= 2) {
    const n = controls.untransfected.replicates;
    mixes.push({
      name: 'Untransfected MM',
      reactions: n,
      scale: null,
      cas9Vol: null,
      sgrnaVol: null,
      bufferTopUp: null,
      totalVol: null,
      perReactionVol: null,
      isUntransfected: true,
    });
  }

  return mixes;
}

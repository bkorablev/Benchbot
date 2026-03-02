const PLATE_ROWS = {
  '96-well':  'ABCDEFGH',
  '48-well':  'ABCDEF',
  '384-well': 'ABCDEFGHIJKLMNOP',
};
const PLATE_COLS = { '96-well': 12, '48-well': 8, '384-well': 24 };

export function assignWells(count, plateFormat, order) {
  const rowStr = PLATE_ROWS[plateFormat] || PLATE_ROWS['96-well'];
  const cols   = PLATE_COLS[plateFormat] || 12;
  const rows   = rowStr.length;
  const wells  = [];

  if (order === 'column-major') {
    for (let c = 0; c < cols && wells.length < count; c++)
      for (let r = 0; r < rows && wells.length < count; r++)
        wells.push(`${rowStr[r]}${c + 1}`);
  } else {
    for (let r = 0; r < rows && wells.length < count; r++)
      for (let c = 0; c < cols && wells.length < count; c++)
        wells.push(`${rowStr[r]}${c + 1}`);
  }
  return wells;
}

export function calcTa(fTm, rTm, polyConfig) {
  if (fTm == null || rTm == null) return null;
  return Math.round((Math.min(fTm, rTm) + polyConfig.annealingOffset) * 10) / 10;
}

export function calcExtensionSecs(ampliconBp, extensionRate) {
  const bp = ampliconBp && ampliconBp > 0 ? ampliconBp : 1000;
  return Math.ceil(bp / 1000) * extensionRate;
}

export function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '—';
  if (seconds < 60) return `${seconds} s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min} min ${sec} s` : `${min} min`;
}

/** Scale a recipe to a given reaction volume. Returns new array with scaledVolume added. */
export function scaleRecipe(recipe, reactionVolume, baseVolume = 25) {
  const scale = reactionVolume / baseVolume;
  return recipe.map((item) => ({
    ...item,
    scaledVolume: Math.round(item.volume * scale * 100) / 100,
  }));
}

/** Overage factor: n reactions + 10% overage, rounded up to 1 decimal place */
export function overageFactor(n) {
  return Math.ceil(n * 1.1 * 10) / 10;
}

/**
 * Group reactions into master mixes (≥2 reactions with same F + R primer + template)
 * and singles (everything else, including NTC rows).
 */
export function groupMasterMixes(allReactions) {
  const groups = {};
  allReactions.filter((r) => !r.isNTC).forEach((r) => {
    const key = `${r.forwardPrimerId}__${r.reversePrimerId}__${r.templateId}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const mms = [];
  const singles = [];
  Object.values(groups).forEach((g) =>
    g.length >= 2 ? mms.push(g) : singles.push(...g)
  );

  return { mms, singles: [...singles, ...allReactions.filter((r) => r.isNTC)] };
}

/**
 * Group reactions with identical (Ta, extensionSecs) into thermocycler programs.
 */
export function groupPrograms(allReactions, polyConfig) {
  const groups = {};
  allReactions
    .filter((r) => !r.isNTC && r.ta != null)
    .forEach((r) => {
      const ext = calcExtensionSecs(r.ampliconBp, polyConfig.extensionRate);
      const key = `${r.ta}__${ext}`;
      if (!groups[key]) groups[key] = { ta: r.ta, extensionSecs: ext, reactions: [] };
      groups[key].reactions.push(r);
    });
  return Object.values(groups).sort((a, b) => a.ta - b.ta);
}

/** Generate plain-text export */
export function generateExportText(state, allReactions, polyConfig) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const lines = [];

  lines.push(`# PCR Experiment Summary — ${date}`, '');
  lines.push('## Experiment Settings');
  lines.push(`- Polymerase: ${polyConfig.name}`);
  lines.push(`- Reaction Volume: ${state.settings.reactionVolume} μL`);
  lines.push(`- Cycle Count: ${state.settings.cycleCount}`);
  lines.push(`- Overage: ${state.settings.overage}%`, '');

  lines.push('## Primers');
  lines.push('| Name | Sequence | Length | Tm (°C) | Concentration |');
  lines.push('|------|----------|--------|---------|---------------|');
  state.primers.forEach((p) => {
    const len = p.sequence ? p.sequence.length : 0;
    lines.push(`| ${p.name || '—'} | ${p.sequence || '—'} | ${len} nt | ${p._tm ?? '—'} | ${p.concentration} ${p.concUnit} |`);
  });
  lines.push('');

  lines.push('## Templates');
  state.templates.forEach((t) => lines.push(`- ${t.name || 'Unnamed'} (${t.type})`));
  lines.push('');

  lines.push('## Reaction Mapping');
  lines.push('| Well | F Primer | R Primer | Template | Amplicon (bp) | Ta (°C) |');
  lines.push('|------|----------|----------|----------|--------------|---------|');
  allReactions.forEach((r) => {
    lines.push(
      `| ${r.well} | ${r.fPrimer?.name || '—'} | ${r.rPrimer?.name || '—'} | ${r.isNTC ? 'NTC' : (r.template?.name || '—')} | ${r.ampliconBp || '—'} | ${r.ta ?? '—'} |`
    );
  });
  lines.push('');

  // MM groups
  const { mms, singles } = groupMasterMixes(allReactions);
  if (mms.length > 0) {
    lines.push('## Master Mix Instructions');
    mms.forEach((group) => {
      const r0 = group[0];
      const n = group.length;
      const y = overageFactor(n);
      lines.push(`\n### ${r0.fPrimer?.name || '—'} + ${r0.rPrimer?.name || '—'} — ${r0.template?.name || '—'}`);
      lines.push(`${n} rxns → ${y} with 10% overage`);
      lines.push('| Component | Per Rxn (μL) | Total (μL) |');
      lines.push('|-----------|-------------|-----------|');
      const scaled = scaleRecipe(polyConfig.recipe, state.settings.reactionVolume, polyConfig.baseVolume);
      scaled.filter((c) => c.mastermix).forEach((c) => {
        lines.push(`| ${c.component} | ${c.scaledVolume} | ${Math.round(c.scaledVolume * y * 100) / 100} |`);
      });
      const templateComp = scaled.find((c) => !c.mastermix);
      lines.push(`\nAliquot ${Math.round(scaled.filter((c) => c.mastermix).reduce((s, c) => s + c.scaledVolume, 0) * 100) / 100} μL per reaction, then add ${templateComp?.scaledVolume ?? '—'} μL Template DNA per well.`);
    });
    lines.push('');
  }

  if (singles.length > 0) {
    lines.push('## Individual Reactions');
    singles.forEach((r) => {
      lines.push(`- ${r.well}: ${r.fPrimer?.name || '—'} + ${r.rPrimer?.name || '—'}, ${r.isNTC ? 'NTC' : (r.template?.name || '—')}, ${r.ampliconBp || '—'} bp`);
    });
    lines.push('');
  }

  // Programs
  const programs = groupPrograms(allReactions, polyConfig);
  if (programs.length > 0) {
    lines.push('## Thermocycler Programs');
    programs.forEach((prog, idx) => {
      lines.push(`\n### Program ${idx + 1}  (wells: ${prog.reactions.map((r) => r.well).join(', ')})`);
      lines.push(`1. Initial Denaturation: ${polyConfig.initialDenaturation.temp}°C for ${formatTime(polyConfig.initialDenaturation.time)}`);
      lines.push(`2. ${state.settings.cycleCount} Cycles:`);
      lines.push(`   a. Denaturation: ${polyConfig.denaturation.temp}°C for ${formatTime(polyConfig.denaturation.time)}`);
      lines.push(`   b. Annealing: ${prog.ta}°C for 30 s`);
      lines.push(`   c. Extension: ${polyConfig.extensionTemp}°C for ${formatTime(prog.extensionSecs)}`);
      lines.push(`3. Final Extension: ${polyConfig.finalExtension.temp}°C for ${formatTime(polyConfig.finalExtension.time)}`);
      lines.push('4. Hold: 4°C ∞');
    });
    lines.push('');
  }

  // Warnings
  const warnings = [];
  state.primers.forEach((p) => {
    if (p._warnings?.length > 0) {
      p._warnings.forEach((w) => warnings.push(`[${p.name || 'Unnamed primer'}] ${w}`));
    }
  });
  if (warnings.length > 0) {
    lines.push('## Warnings');
    warnings.forEach((w) => lines.push(`- ${w}`));
  }

  return lines.join('\n');
}

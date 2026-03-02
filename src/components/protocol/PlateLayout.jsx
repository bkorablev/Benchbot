import { useMemo } from 'react';
import { PLATE_FORMATS, GUIDE_COLORS } from '../../data/constants';

// Colors for different sample types
const WELL_COLORS = {
  guide: null, // from guide.color
  nonTargeting: { bg: '#334155', text: '#fff', label: 'NT' },
  positiveControl: { bg: '#ea580c', text: '#fff', label: 'PC' },
  untransfected: { bg: '#cbd5e1', text: '#475569', label: 'UN' },
  empty: { bg: '#f1f5f9', text: '#94a3b8', label: '' },
};

function assignWells(guides, controls, format) {
  const { rows, cols } = format;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Build flat sample list — all replicates of each condition grouped consecutively
  const samples = [];

  guides.forEach((g) => {
    for (let r = 0; r < g.replicates; r++) {
      samples.push({
        type: 'guide',
        name: g.name || g.label,
        label: g.label,
        rep: r + 1,
        color: g.color,
      });
    }
  });

  if (controls.nonTargeting?.enabled) {
    for (let r = 0; r < controls.nonTargeting.replicates; r++) {
      samples.push({ type: 'nonTargeting', name: 'Non-targeting', label: 'NT', rep: r + 1 });
    }
  }
  if (controls.positiveControl?.enabled) {
    for (let r = 0; r < controls.positiveControl.replicates; r++) {
      samples.push({ type: 'positiveControl', name: 'Positive ctrl', label: 'PC', rep: r + 1 });
    }
  }
  if (controls.untransfected?.enabled) {
    for (let r = 0; r < controls.untransfected.replicates; r++) {
      samples.push({ type: 'untransfected', name: 'Untransfected', label: 'UN', rep: r + 1 });
    }
  }

  // Inner positions: exclude first/last row and first/last column, row-by-row L→R
  const innerPositions = [];
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      innerPositions.push([r, c]);
    }
  }

  // All positions: full plate, row-by-row L→R
  const allPositions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      allPositions.push([r, c]);
    }
  }

  // Binary choice: all-inner or full-plate — never a mix
  const usesInnerOnly = samples.length <= innerPositions.length;
  const positions = usesInnerOnly ? innerPositions : allPositions;

  samples.forEach((sample, i) => {
    if (i < positions.length) {
      const [r, c] = positions[i];
      grid[r][c] = sample;
    }
  });

  return { grid, usesInnerOnly };
}

function Well({ well, size }) {
  const s = size;
  let bg, textColor, displayLabel;

  if (!well) {
    bg = WELL_COLORS.empty.bg;
    textColor = WELL_COLORS.empty.text;
    displayLabel = '';
  } else if (well.type === 'guide') {
    bg = well.color;
    textColor = '#fff';
    displayLabel = `${well.label}·${well.rep}`;
  } else {
    const c = WELL_COLORS[well.type];
    bg = c.bg;
    textColor = c.text;
    displayLabel = `${well.label}${well.rep}`;
  }

  return (
    <div
      title={well ? `${well.name} rep ${well.rep}` : 'Empty'}
      style={{
        width: s,
        height: s,
        borderRadius: '50%',
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        fontSize: s < 28 ? '5px' : '7px',
        fontWeight: 600,
        cursor: well ? 'default' : 'default',
        transition: 'transform 0.1s',
        letterSpacing: '-0.02em',
      }}
    >
      {displayLabel}
    </div>
  );
}

export default function PlateLayout({ guides, controls, plateFormat }) {
  const format = PLATE_FORMATS.find((f) => f.label === plateFormat) || PLATE_FORMATS[0];
  const { grid, usesInnerOnly } = useMemo(
    () => assignWells(guides, controls, format),
    [guides, controls, format]
  );

  const wellSize = format.cols <= 8 ? 38 : 30;
  const rowLabels = 'ABCDEFGH'.slice(0, format.rows).split('');
  const colLabels = Array.from({ length: format.cols }, (_, i) => i + 1);

  // Legend entries
  const legendItems = [
    ...guides.map((g) => ({
      color: g.color,
      label: `${g.label} — ${g.name || 'unnamed'}`,
    })),
  ];
  if (controls.nonTargeting?.enabled)
    legendItems.push({ color: WELL_COLORS.nonTargeting.bg, label: 'Non-targeting control' });
  if (controls.positiveControl?.enabled)
    legendItems.push({ color: WELL_COLORS.positiveControl.bg, label: 'Positive control' });
  if (controls.untransfected?.enabled)
    legendItems.push({ color: WELL_COLORS.untransfected.bg, label: 'Untransfected' });
  legendItems.push({ color: WELL_COLORS.empty.bg, label: 'Empty well', border: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Plate Layout — {plateFormat}
        </h3>
        {usesInnerOnly ? (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            Inner wells only
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            Full plate — exceeds inner wells
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-x-auto">
        <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
          {/* Column headers */}
          <div style={{ display: 'flex', marginLeft: 24, marginBottom: 4, gap: 4 }}>
            {colLabels.map((c) => (
              <div
                key={c}
                style={{
                  width: wellSize,
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#94a3b8',
                  fontWeight: 600,
                }}
              >
                {c}
              </div>
            ))}
          </div>
          {/* Rows */}
          {grid.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              {/* Row label */}
              <div
                style={{
                  width: 20,
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#94a3b8',
                  fontWeight: 600,
                }}
              >
                {rowLabels[ri]}
              </div>
              {row.map((well, ci) => (
                <Well key={ci} well={well} size={wellSize} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.color,
                border: item.border ? '1.5px solid #cbd5e1' : 'none',
                flexShrink: 0,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

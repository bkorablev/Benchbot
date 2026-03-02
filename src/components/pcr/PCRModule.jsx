import { useState, useMemo } from 'react';
import { POLYMERASES } from '../../data/polymerases';
import { calcTm, concToMolar, getPrimerWarnings } from '../../utils/tmCalc';
import { assignWells, calcTa } from '../../utils/pcrCalc';
import InputsTab from './InputsTab';
import MappingTab from './MappingTab';
import OutputsTab from './OutputsTab';

const uid = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_PCR_STATE = {
  primers: [],
  templates: [],
  settings: {
    reactionVolume: 25,
    cycleCount: 30,
    overage: 10,
    polymerase: 'Q5',
  },
  reactions: [],
  ntcEnabled: false,
  plateFormat: '96-well',
  wellOrder: 'row-major',
};

export { uid };

export default function PCRModule() {
  const [state, setState] = useState(DEFAULT_PCR_STATE);
  const [activeTab, setActiveTab] = useState('inputs');

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  const polyConfig = POLYMERASES[state.settings.polymerase] || POLYMERASES.Q5;

  // ── Tm per primer ──────────────────────────────────────────────────────────
  const primerTms = useMemo(() => {
    const tms = {};
    state.primers.forEach((p) => {
      tms[p.id] = calcTm(p.sequence, concToMolar(p.concentration, p.concUnit));
    });
    return tms;
  }, [state.primers]);

  // ── NTC rows (one per unique F+R primer pair) ──────────────────────────────
  const ntcRows = useMemo(() => {
    if (!state.ntcEnabled) return [];
    const seen = new Set();
    return state.reactions
      .filter((r) => r.forwardPrimerId && r.reversePrimerId)
      .reduce((acc, r) => {
        const key = `${r.forwardPrimerId}|${r.reversePrimerId}`;
        if (!seen.has(key)) {
          seen.add(key);
          acc.push({
            id: `ntc-${r.forwardPrimerId}-${r.reversePrimerId}`,
            forwardPrimerId: r.forwardPrimerId,
            reversePrimerId: r.reversePrimerId,
            templateId: 'NTC',
            ampliconBp: null,
            isNTC: true,
          });
        }
        return acc;
      }, []);
  }, [state.reactions, state.ntcEnabled]);

  // ── All reactions enriched with wells + computed values ───────────────────
  const allReactions = useMemo(() => {
    const total = state.reactions.length + ntcRows.length;
    const wells = assignWells(total, state.plateFormat, state.wellOrder);

    const enrich = (r, idx) => {
      const fPrimer  = state.primers.find((p) => p.id === r.forwardPrimerId) ?? null;
      const rPrimer  = state.primers.find((p) => p.id === r.reversePrimerId) ?? null;
      const template = state.templates.find((t) => t.id === r.templateId) ?? null;
      const fTm = fPrimer ? primerTms[fPrimer.id] : null;
      const rTm = rPrimer ? primerTms[rPrimer.id] : null;
      return {
        ...r,
        well: wells[idx] ?? `?${idx + 1}`,
        fPrimer, rPrimer, template,
        fTm, rTm,
        ta: calcTa(fTm, rTm, polyConfig),
      };
    };

    return [
      ...state.reactions.map((r, i) => enrich(r, i)),
      ...ntcRows.map((r, i) => enrich(r, state.reactions.length + i)),
    ];
  }, [state.reactions, ntcRows, state.plateFormat, state.wellOrder, state.primers, state.templates, primerTms, polyConfig]);

  // ── Primer warnings (basic + cross-reaction Tm mismatch) ─────────────────
  const primerWarnings = useMemo(() => {
    const warnings = {};
    state.primers.forEach((p) => { warnings[p.id] = getPrimerWarnings(p); });

    allReactions
      .filter((r) => !r.isNTC && r.fTm != null && r.rTm != null)
      .forEach((r) => {
        if (Math.abs(r.fTm - r.rTm) > 5) {
          const msg = `Large Tm difference with paired primer in reaction ${r.well} — consider redesign`;
          if (warnings[r.forwardPrimerId]) warnings[r.forwardPrimerId].push(msg);
          if (warnings[r.reversePrimerId]) warnings[r.reversePrimerId].push(msg);
        }
      });

    return warnings;
  }, [state.primers, allReactions]);

  const totalWarnings = useMemo(
    () => Object.values(primerWarnings).reduce((s, ws) => s + ws.length, 0),
    [primerWarnings]
  );

  // ── Tab UI ────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'inputs',  label: 'Inputs',  badge: totalWarnings > 0 },
    { id: 'mapping', label: 'Mapping', badge: false },
    { id: 'outputs', label: 'Outputs', badge: false },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* PCR module header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">PCR Protocol Generator</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Design primers, map reactions, and generate master mix instructions and thermocycler programs
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-slate-200 mb-8">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-0.5">{idx + 1}</span>
              {tab.label}
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'inputs' && (
        <InputsTab
          state={state}
          onChange={update}
          polyConfig={polyConfig}
          primerTms={primerTms}
          primerWarnings={primerWarnings}
        />
      )}
      {activeTab === 'mapping' && (
        <MappingTab
          state={state}
          onChange={update}
          allReactions={allReactions}
          polyConfig={polyConfig}
          onGoToOutputs={() => setActiveTab('outputs')}
        />
      )}
      {activeTab === 'outputs' && (
        <OutputsTab
          state={state}
          allReactions={allReactions}
          polyConfig={polyConfig}
          primerTms={primerTms}
        />
      )}
    </div>
  );
}

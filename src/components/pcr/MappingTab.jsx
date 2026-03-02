import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';

const uid = () => Math.random().toString(36).slice(2, 9);

const PLATE_FORMATS = ['96-well', '48-well', '384-well'];
const WELL_ORDERS  = [{ value: 'row-major', label: 'Row-major (A1→A12→B1…)' }, { value: 'column-major', label: 'Column-major (A1→H1→A2…)' }];

function PrimerOption({ primer }) {
  return <option value={primer.id}>{primer.name || `Primer ${primer.id.slice(0,4)}`}</option>;
}

function ReactionRow({ reaction, index, primers, templates, onChange, onDelete }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
      <td className="px-3 py-2 text-xs text-slate-500 text-center">{index + 1}</td>
      <td className="px-3 py-2 text-xs font-mono font-semibold text-slate-700 text-center">{reaction.well}</td>

      {/* Forward primer */}
      <td className="px-2 py-1.5">
        <Select
          value={reaction.forwardPrimerId || ''}
          onChange={(e) => onChange({ ...reaction, forwardPrimerId: e.target.value || null })}
          className="text-xs py-1.5"
        >
          <option value="">— select —</option>
          {primers.map((p) => <PrimerOption key={p.id} primer={p} />)}
        </Select>
      </td>

      {/* Reverse primer */}
      <td className="px-2 py-1.5">
        <Select
          value={reaction.reversePrimerId || ''}
          onChange={(e) => onChange({ ...reaction, reversePrimerId: e.target.value || null })}
          className="text-xs py-1.5"
        >
          <option value="">— select —</option>
          {primers.map((p) => <PrimerOption key={p.id} primer={p} />)}
        </Select>
      </td>

      {/* Template */}
      <td className="px-2 py-1.5">
        <Select
          value={reaction.templateId || ''}
          onChange={(e) => onChange({ ...reaction, templateId: e.target.value || null })}
          className="text-xs py-1.5"
        >
          <option value="">— select —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name || `Template ${t.id.slice(0,4)}`}</option>
          ))}
        </Select>
      </td>

      {/* Amplicon bp */}
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={reaction.ampliconBp || ''}
          onChange={(e) => onChange({ ...reaction, ampliconBp: parseInt(e.target.value) || null })}
          placeholder="bp"
          min={1}
          className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </td>

      {/* Delete */}
      <td className="px-2 py-1.5 text-center">
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

function NTCRow({ reaction, index, primers }) {
  const fp = primers.find((p) => p.id === reaction.forwardPrimerId);
  const rp = primers.find((p) => p.id === reaction.reversePrimerId);
  return (
    <tr className="border-b border-slate-100 bg-slate-50/60">
      <td className="px-3 py-2 text-xs text-slate-400 text-center">{index + 1}</td>
      <td className="px-3 py-2 text-xs font-mono font-semibold text-slate-500 text-center">{reaction.well}</td>
      <td className="px-3 py-2 text-xs text-slate-500 text-center">{fp?.name || '—'}</td>
      <td className="px-3 py-2 text-xs text-slate-500 text-center">{rp?.name || '—'}</td>
      <td className="px-3 py-2 text-xs text-slate-400 italic text-center">NTC</td>
      <td className="px-3 py-2 text-xs text-slate-400 text-center">—</td>
      <td className="px-3 py-2 text-center">
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">auto</span>
      </td>
    </tr>
  );
}

function TaSummaryTable({ allReactions }) {
  const rows = allReactions.filter((r) => r.fPrimer && r.rPrimer);
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-700">Annealing Temperature Summary</h4>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Well', 'Tm F (°C)', 'Tm R (°C)', 'Ta (°C)', 'Warnings'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const reactionWarnings = [];
              if (r.fTm != null && r.rTm != null && Math.abs(r.fTm - r.rTm) > 5)
                reactionWarnings.push('Tm mismatch — check primer design');
              if (r.ta != null && r.ta < 50)
                reactionWarnings.push('Low annealing temp — may cause non-specific bands');
              if (r.ta != null && r.ta > 72)
                reactionWarnings.push('Annealing temp too high for most polymerases');

              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-700">{r.well}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{r.fTm ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{r.rTm ?? '—'}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-teal-700">{r.ta ?? '—'}</td>
                  <td className="px-3 py-2">
                    {reactionWarnings.length > 0 ? (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle size={12} />
                        <span className="text-xs">{reactionWarnings.join('; ')}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GradientBanner({ allReactions }) {
  const tas = allReactions
    .filter((r) => !r.isNTC && r.ta != null)
    .map((r) => r.ta);

  if (tas.length < 2) return null;

  const minTa = Math.min(...tas);
  const maxTa = Math.max(...tas);
  const spread = Math.round((maxTa - minTa) * 10) / 10;

  if (spread === 0) return null;

  if (spread <= 10) {
    return (
      <div className="flex items-start gap-2.5 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-800">
        <Info size={15} className="text-teal-600 mt-0.5 shrink-0" />
        <span>
          <strong>Gradient PCR suggested:</strong> reactions span Ta {minTa}°C–{maxTa}°C.
          Consider running a gradient block to optimize all conditions simultaneously.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
      <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
      <span>
        <strong>Wide Ta range ({minTa}°C–{maxTa}°C):</strong> reactions may not be compatible
        in a single run. Consider splitting into separate PCR runs.
      </span>
    </div>
  );
}

export default function MappingTab({ state, onChange, allReactions, polyConfig, onGoToOutputs }) {
  const [addCount, setAddCount] = useState(1);

  const update = (patch) => onChange(patch);
  const updateReactions = (reactions) => update({ reactions });

  const regularReactions = allReactions.filter((r) => !r.isNTC);
  const ntcReactions     = allReactions.filter((r) => r.isNTC);

  const addReactions = () => {
    const newRows = Array.from({ length: addCount }, () => ({
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      forwardPrimerId: null,
      reversePrimerId: null,
      templateId: null,
      ampliconBp: null,
    }));
    updateReactions([...state.reactions, ...newRows]);
  };

  const updateReaction = (id, newR) =>
    updateReactions(state.reactions.map((r) => (r.id === id ? newR : r)));

  const deleteReaction = (id) =>
    updateReactions(state.reactions.filter((r) => r.id !== id));

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Plate format</label>
          <Select
            value={state.plateFormat}
            onChange={(e) => update({ plateFormat: e.target.value })}
            className="w-28"
          >
            {PLATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Well order</label>
          <Select
            value={state.wellOrder}
            onChange={(e) => update({ wellOrder: e.target.value })}
            className="w-52"
          >
            {WELL_ORDERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="number"
            value={addCount}
            onChange={(e) => setAddCount(Math.max(1, parseInt(e.target.value) || 1))}
            min={1} max={96}
            className="w-16 px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Button variant="outline" size="sm" onClick={addReactions}>
            <Plus size={14} /> Add {addCount} Reaction{addCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>

      {/* Reaction table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['#', 'Well', 'Forward Primer', 'Reverse Primer', 'Template', 'Amplicon (bp)', ''].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.reactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                      No reactions yet — use the "Add Reactions" button above
                    </td>
                  </tr>
                )}
                {regularReactions.map((r, idx) => (
                  <ReactionRow
                    key={r.id}
                    reaction={r}
                    index={idx}
                    primers={state.primers}
                    templates={state.templates}
                    onChange={(newR) => updateReaction(r.id, { ...newR, well: undefined })}
                    onDelete={() => deleteReaction(r.id)}
                  />
                ))}
                {ntcReactions.length > 0 && (
                  <>
                    <tr className="bg-slate-100">
                      <td colSpan={7} className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        No Template Controls (auto-generated)
                      </td>
                    </tr>
                    {ntcReactions.map((r, i) => (
                      <NTCRow
                        key={r.id}
                        reaction={r}
                        index={regularReactions.length + i}
                        primers={state.primers}
                      />
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* NTC toggle */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
        state.ntcEnabled ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'
      }`}>
        <div>
          <p className="text-sm font-medium text-slate-700">No Template Control (NTC)</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically adds one NTC well per unique primer pair
          </p>
        </div>
        <Toggle
          checked={state.ntcEnabled}
          onChange={(v) => update({ ntcEnabled: v })}
        />
      </div>

      {/* Gradient banner */}
      <GradientBanner allReactions={allReactions} />

      {/* Ta summary */}
      <TaSummaryTable allReactions={allReactions} />

      {/* Generate Protocol button */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" size="lg" onClick={onGoToOutputs}>
          Generate Protocol
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

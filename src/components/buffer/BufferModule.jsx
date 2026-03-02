import { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, Copy, Check, Download, AlertTriangle, Beaker } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { BUFFER_PRESETS } from '../../data/bufferPresets';
import { calcVolume, CONC_UNITS, VOL_UNITS } from '../../utils/bufferCalc';

const uid = () => Math.random().toString(36).slice(2, 9);

// ── NumericField ───────────────────────────────────────────────────────────────
// Allows null (empty) as a committed value; reverts invalid non-empty on blur.
function NumericField({ value, onChange, placeholder, min = 0, className }) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');
  const lastRef = useRef(value);

  if (lastRef.current !== value) {
    lastRef.current = value;
    const parsed = draft === '' ? null : parseFloat(draft);
    if (parsed !== value) setDraft(value != null ? String(value) : '');
  }

  const commit = () => {
    if (draft.trim() === '') {
      onChange(null);
      lastRef.current = null;
      return;
    }
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= min) {
      onChange(n);
      lastRef.current = n;
    } else {
      setDraft(lastRef.current != null ? String(lastRef.current) : '');
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      className={className}
    />
  );
}

// ── NumericInput ───────────────────────────────────────────────────────────────
// Guaranteed non-null; reverts to last valid value on invalid blur.
function NumericInput({ value, onChange, min = 0.001, className }) {
  const [draft, setDraft] = useState(String(value));
  const prevRef = useRef(value);

  if (prevRef.current !== value) {
    prevRef.current = value;
    if (parseFloat(draft) !== value) setDraft(String(value));
  }

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= min) {
      onChange(n);
      prevRef.current = n;
      setDraft(String(n));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      className={className}
    />
  );
}

// ── Component row ──────────────────────────────────────────────────────────────
function ComponentRow({ comp, volResult, isAmber, finalVolume, finalUnit, onChange, onDelete }) {
  const disabled  = !comp.enabled;
  const exceeds   = !disabled && volResult?.volume != null && volResult.volume > finalVolume;

  const rowBorder = isAmber ? 'border-amber-300' : 'border-slate-200';
  const rowBg     = isAmber ? 'bg-amber-50'      : 'bg-slate-50';
  const rowOpacity = disabled ? 'opacity-50' : '';

  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${rowBorder} ${rowBg} ${rowOpacity} transition-colors`}>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={comp.enabled}
        onChange={(e) => onChange({ ...comp, enabled: e.target.checked })}
        className="w-4 h-4 shrink-0 cursor-pointer accent-teal-600"
      />

      {/* Name */}
      <div className="w-36 shrink-0">
        <Input
          placeholder="Component"
          value={comp.name}
          onChange={(e) => onChange({ ...comp, name: e.target.value })}
        />
      </div>

      {/* Stock conc */}
      <div className="w-20 shrink-0">
        <NumericField
          value={comp.stockConc}
          onChange={(n) => onChange({ ...comp, stockConc: n })}
          placeholder="Stock"
          min={0}
          className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Stock unit */}
      <div className="w-[100px] shrink-0">
        <Select
          value={comp.stockUnit}
          onChange={(e) => onChange({ ...comp, stockUnit: e.target.value })}
        >
          {CONC_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>

      <span className="text-slate-400 text-xs shrink-0">→</span>

      {/* Target conc */}
      <div className="w-20 shrink-0">
        <NumericField
          value={comp.targetConc}
          onChange={(n) => onChange({ ...comp, targetConc: n })}
          placeholder="Target"
          min={0}
          className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Target unit */}
      <div className="w-[100px] shrink-0">
        <Select
          value={comp.targetUnit}
          onChange={(e) => onChange({ ...comp, targetUnit: e.target.value })}
        >
          {CONC_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>

      {/* Calculated volume */}
      <div className="flex-1 min-w-0 text-right pr-1">
        {disabled ? (
          <span className="text-sm text-slate-400">—</span>
        ) : volResult?.error ? (
          <div className="flex items-center justify-end gap-1 text-xs text-red-600">
            <AlertTriangle size={11} className="shrink-0" />
            <span>{volResult.error}</span>
          </div>
        ) : volResult?.volume != null ? (
          <div>
            <span className={`text-sm font-semibold font-mono ${exceeds ? 'text-amber-600' : 'text-teal-700'}`}>
              {volResult.volume.toFixed(2)} {finalUnit}
            </span>
            {exceeds && (
              <div className="flex items-center justify-end gap-1 text-xs text-amber-600 mt-0.5">
                <AlertTriangle size={10} className="shrink-0" />
                <span>Exceeds final volume</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="w-6 shrink-0 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Buffer Settings card ───────────────────────────────────────────────────────
function BufferSettings({ state, onChange }) {
  const handlePreset = (e) => {
    const id = e.target.value;
    if (!id) return;
    const preset = BUFFER_PRESETS.find((p) => p.id === id);
    if (!preset) return;

    if (
      state.components.length > 0 &&
      !window.confirm('This will replace your current components. Continue?')
    ) return;

    onChange({
      ...state,
      name: preset.name,
      components: preset.components.map((c) => ({ id: uid(), enabled: true, ...c })),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker size={16} className="text-teal-600" />
          Buffer Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Buffer Name</label>
            <Input
              placeholder="e.g. 1x PBS"
              value={state.name}
              onChange={(e) => onChange({ ...state, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Load Preset</label>
            <Select value="" onChange={handlePreset}>
              <option value="">Load a preset...</option>
              {BUFFER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Final Volume</label>
            <NumericInput
              value={state.finalVolume}
              onChange={(n) => onChange({ ...state, finalVolume: n })}
              min={0.001}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
            <Select
              value={state.finalUnit}
              onChange={(e) => onChange({ ...state, finalUnit: e.target.value })}
            >
              {VOL_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Solvent</label>
            <Input
              placeholder="Water"
              value={state.solvent}
              onChange={(e) => onChange({ ...state, solvent: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Components card ────────────────────────────────────────────────────────────
function ComponentsCard({ state, rowResults, overflowRows, onChange }) {
  const add = () =>
    onChange({
      ...state,
      components: [
        ...state.components,
        { id: uid(), enabled: true, name: '', stockConc: null, stockUnit: 'mM', targetConc: null, targetUnit: 'mM' },
      ],
    });

  const update = (id, newComp) =>
    onChange({ ...state, components: state.components.map((c) => (c.id === id ? newComp : c)) });

  const remove = (id) =>
    onChange({ ...state, components: state.components.filter((c) => c.id !== id) });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Components</span>
          {state.components.length > 0 && (
            <span className="text-xs font-normal text-slate-400">
              Stock conc → Target conc → Volume to add
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {state.components.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">
            No components yet — add one below or load a preset.
          </p>
        )}

        {state.components.map((comp, idx) => (
          <ComponentRow
            key={comp.id}
            comp={comp}
            volResult={rowResults[idx]}
            isAmber={overflowRows[idx] ?? false}
            finalVolume={state.finalVolume}
            finalUnit={state.finalUnit}
            onChange={(newComp) => update(comp.id, newComp)}
            onDelete={() => remove(comp.id)}
          />
        ))}

        <Button type="button" variant="outline" size="sm" onClick={add} className="w-full mt-1">
          <Plus size={14} /> Add Component
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Recipe Output card ─────────────────────────────────────────────────────────
function RecipeOutput({ state, rowResults, waterVol, isOverflow }) {
  const [copied, setCopied] = useState(false);

  const enabledRows = state.components
    .map((comp, i) => ({ comp, result: rowResults[i] }))
    .filter(({ comp }) => comp.enabled);

  const waterVolColor =
    waterVol == null   ? 'text-slate-400' :
    waterVol < -0.001  ? 'text-red-600 font-semibold' :
                         'text-teal-700 font-semibold';

  const solvent = state.solvent || 'Water';

  const buildCopyText = () => {
    const P = (s, w) => String(s ?? '').padEnd(w);
    const name = state.name || 'Buffer Recipe';
    const header = [P('Component', 24), P('Stock', 14), P('Target', 14), `Volume (${state.finalUnit})`].join(' | ');
    const divider = '─'.repeat(24 + 14 + 14 + 16 + 9);

    const rows = enabledRows.map(({ comp, result }) => [
      P(comp.name || '—', 24),
      P(comp.stockConc != null ? `${comp.stockConc} ${comp.stockUnit}` : '—', 14),
      P(comp.targetConc != null ? `${comp.targetConc} ${comp.targetUnit}` : '—', 14),
      result?.volume != null ? result.volume.toFixed(2) : '—',
    ].join(' | '));

    const waterRow = [
      P(solvent, 24),
      P('', 14),
      P('', 14),
      waterVol != null ? waterVol.toFixed(2) : '—',
    ].join(' | ');

    return [name, `Final Volume: ${state.finalVolume} ${state.finalUnit}`, '', header, divider, ...rows, waterRow].join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCopyText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    const safeName = (state.name || 'buffer').replace(/[^a-zA-Z0-9_-]/g, '_');
    const volHeader = `Volume to Add (${state.finalUnit})`;
    const csvRows = [
      ['Component', 'Stock Conc.', 'Target Conc.', volHeader],
      ...enabledRows.map(({ comp, result }) => [
        comp.name || '',
        comp.stockConc != null ? `${comp.stockConc} ${comp.stockUnit}` : '',
        comp.targetConc != null ? `${comp.targetConc} ${comp.targetUnit}` : '',
        result?.volume != null ? result.volume.toFixed(2) : '',
      ]),
      [solvent, '', '', waterVol != null ? waterVol.toFixed(2) : ''],
    ];
    const csv = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${safeName}_recipe.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasData = enabledRows.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recipe Output
          {state.name && <span className="text-sm font-normal text-slate-500">— {state.name}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Overflow banner */}
        {isOverflow && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <span>
              Total component volumes exceed final volume by{' '}
              <strong>{(-waterVol).toFixed(2)} {state.finalUnit}</strong> — reduce component
              concentrations or increase final volume.
            </span>
          </div>
        )}

        {/* Summary header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-lg text-sm">
          <span className="text-slate-600">
            Final volume: <strong>{state.finalVolume} {state.finalUnit}</strong>
          </span>
          <span className="text-slate-600">
            {solvent}:{' '}
            <span className={waterVolColor}>
              {waterVol != null ? `${waterVol.toFixed(2)} ${state.finalUnit}` : '—'}
            </span>
          </span>
        </div>

        {/* Recipe table */}
        {hasData ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Component', 'Stock Conc.', 'Target Conc.', `Volume to Add (${state.finalUnit})`].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enabledRows.map(({ comp, result }) => (
                  <tr key={comp.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-700">
                      {comp.name || <span className="text-slate-400 italic">Unnamed</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-xs">
                      {comp.stockConc != null ? `${comp.stockConc} ${comp.stockUnit}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-xs">
                      {comp.targetConc != null ? `${comp.targetConc} ${comp.targetUnit}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {result?.error ? (
                        <span className="text-red-600 text-xs font-normal">{result.error}</span>
                      ) : result?.volume != null ? (
                        <span className="font-semibold text-teal-700">{result.volume.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Solvent row */}
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-3 py-2 font-medium text-slate-700">{solvent}</td>
                  <td className="px-3 py-2 text-slate-400 text-xs">—</td>
                  <td className="px-3 py-2 text-slate-400 text-xs">—</td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${waterVolColor}`}>
                    {waterVol != null ? waterVol.toFixed(2) : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-slate-400">
            No components yet — add some above or load a preset.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!hasData}>
            {copied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Recipe'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={!hasData}>
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main BufferModule ──────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  name: '',
  finalVolume: 100,
  finalUnit: 'mL',
  solvent: 'Water',
  components: [],
};

export default function BufferModule() {
  const [state, setState] = useState(DEFAULT_STATE);

  // Calculate volume for each component row
  const rowResults = useMemo(() =>
    state.components.map((comp) => {
      if (!comp.enabled) return null;
      return calcVolume(
        comp.stockConc, comp.stockUnit,
        comp.targetConc, comp.targetUnit,
        state.finalVolume, state.finalUnit,
      );
    }),
    [state.components, state.finalVolume, state.finalUnit],
  );

  // Water volume = final − sum of all enabled valid component volumes
  const waterVol = useMemo(() => {
    const sum = rowResults.reduce((acc, r) => {
      if (r?.volume != null) return acc + r.volume;
      return acc;
    }, 0);
    return state.finalVolume - sum;
  }, [rowResults, state.finalVolume]);

  const isOverflow = waterVol < -0.001;

  // Which rows get amber highlighting
  const overflowRows = useMemo(() =>
    rowResults.map((r, i) => {
      const comp = state.components[i];
      if (!comp.enabled || !r || r.error || r.volume == null) return false;
      if (r.volume > state.finalVolume) return true;  // individual exceed
      if (isOverflow) return true;                    // total overflow
      return false;
    }),
    [rowResults, state.components, state.finalVolume, isOverflow],
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Buffer Calculator</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Calculate component volumes using C₁V₁ = C₂V₂
        </p>
      </div>

      <BufferSettings state={state} onChange={setState} />
      <ComponentsCard
        state={state}
        rowResults={rowResults}
        overflowRows={overflowRows}
        onChange={setState}
      />
      <RecipeOutput
        state={state}
        rowResults={rowResults}
        waterVol={waterVol}
        isOverflow={isOverflow}
      />
    </div>
  );
}

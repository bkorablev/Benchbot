import { useState, useRef } from 'react';
import { Plus, Trash2, AlertTriangle, Dna, FlaskConical, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { POLYMERASE_OPTIONS } from '../../data/polymerases';
import { scaleRecipe } from '../../utils/pcrCalc';
import { calcGC, hasAmbiguousBases } from '../../utils/tmCalc';

const uid = () => Math.random().toString(36).slice(2, 9);

// ── NumericInput ───────────────────────────────────────────────────────────────
// Allows clearing the field; commits on blur or Enter; reverts on invalid blur.
function NumericInput({ value, onChange, min, max, className }) {
  const [draft, setDraft] = useState(String(value));

  // Sync draft when external value changes (e.g. undo / reset)
  const prevValueRef = useRef(value);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    // Only override draft if it doesn't already represent the same number
    if (parseFloat(draft) !== value) setDraft(String(value));
  }

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= min && (max == null || n <= max)) {
      onChange(n);
      prevValueRef.current = n;
      setDraft(String(n));
    } else {
      // Revert to last valid external value
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
      onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
      className={className}
    />
  );
}

const IUPAC = /^[ACGTRYMKSWBDHVN]*$/i;
const TEMPLATE_TYPES = ['Plasmid', 'gDNA', 'cDNA', 'Colony', 'Other'];
const CONC_UNITS = ['μM', 'mM', 'pmol/μL'];

// ── Primer row ────────────────────────────────────────────────────────────────
function PrimerRow({ primer, index, tm, warnings, onChange, onDelete, showDelete }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const seq = (primer.sequence || '').toUpperCase();
  const gc = seq.length > 0 ? calcGC(seq).toFixed(0) : null;
  const hasAmb = seq.length > 0 && hasAmbiguousBases(seq);

  const handleSeq = (val) => {
    const clean = val.toUpperCase().replace(/[^ACGTRYMKSWBDHVN]/g, '');
    onChange({ ...primer, sequence: clean });
  };

  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
      {/* Single horizontal row — sequence is the only flex-grow element */}
      <div className="flex items-center gap-2 min-w-0">

        {/* Row number — 20px */}
        <div className="w-5 shrink-0 text-right">
          <span className="text-xs font-bold text-slate-400">{index + 1}</span>
        </div>

        {/* Primer name — fixed 150px */}
        <div className="w-[150px] shrink-0">
          <Input
            placeholder="Primer Name"
            value={primer.name}
            onChange={(e) => onChange({ ...primer, name: e.target.value })}
          />
        </div>

        {/* Sequence — flex-grow, fills all remaining space */}
        <div className="flex-1 min-w-0">
          <Input
            placeholder="5'→3' sequence (ACGT + IUPAC)"
            value={primer.sequence}
            onChange={(e) => handleSeq(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {/* Concentration — fixed 80px */}
        <div className="w-20 shrink-0">
          <input
            type="number"
            value={primer.concentration}
            onChange={(e) => onChange({ ...primer, concentration: parseFloat(e.target.value) || 0 })}
            min={0}
            step={1}
            className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Unit dropdown — fixed 80px */}
        <div className="w-20 shrink-0">
          <Select
            value={primer.concUnit}
            onChange={(e) => onChange({ ...primer, concUnit: e.target.value })}
          >
            {CONC_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
        </div>

        {/* Stats — fixed 130px, right-aligned, never truncated */}
        <div className="w-[130px] shrink-0 text-right">
          {seq.length > 0 ? (
            <>
              <div className="text-xs font-medium text-teal-700 whitespace-nowrap">
                {seq.length} nt{tm != null ? ` | ${tm}°C` : hasAmb ? ' | ~Tm' : ''}
              </div>
              {gc != null && (
                <div className="text-xs text-slate-400">{gc}% GC</div>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-400">— nt | —°C</div>
          )}
        </div>

        {/* Warning icon — fixed 24px slot, always present to avoid layout shift */}
        <div className="w-6 shrink-0 flex items-center justify-center relative">
          {warnings.length > 0 && (
            <>
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-amber-500 hover:text-amber-600 cursor-pointer"
              >
                <AlertTriangle size={15} />
              </button>
              {showTooltip && (
                <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 space-y-1 shadow-xl">
                  {warnings.map((w, i) => <div key={i}>• {w}</div>)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete — fixed 24px slot, always present to avoid layout shift */}
        <div className="w-6 shrink-0 flex items-center justify-center">
          {showDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Template row ──────────────────────────────────────────────────────────────
function TemplateRow({ template, onChange, onDelete, showDelete }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 min-w-0">

      {/* Name — flex-grow, takes majority of width */}
      <div className="flex-1 min-w-0">
        <Input
          placeholder="Template name"
          value={template.name}
          onChange={(e) => onChange({ ...template, name: e.target.value })}
        />
      </div>

      {/* Type — fixed 140px, never expands */}
      <div className="w-[140px] shrink-0">
        <Select
          value={template.type}
          onChange={(e) => onChange({ ...template, type: e.target.value })}
        >
          {TEMPLATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      {/* Delete — fixed 24px */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {showDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

    </div>
  );
}

// ── Recipe table ──────────────────────────────────────────────────────────────
function RecipeTable({ polyConfig, reactionVolume }) {
  const scaled = scaleRecipe(polyConfig.recipe, reactionVolume, polyConfig.baseVolume);
  const total = Math.round(scaled.reduce((s, c) => s + c.scaledVolume, 0) * 100) / 100;
  const mismatch = Math.abs(total - reactionVolume) > 0.01;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Recipe Model ({polyConfig.name})
        </p>
        <span className={`text-xs font-semibold ${mismatch ? 'text-red-600' : 'text-teal-700'}`}>
          Total: {total} / {reactionVolume} μL
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Component</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Volume (μL)</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-600">Master Mix</th>
            </tr>
          </thead>
          <tbody>
            {scaled.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 text-slate-700">{item.component}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-800">{item.scaledVolume}</td>
                <td className="px-3 py-2 text-center">
                  {item.mastermix
                    ? <span className="text-teal-600 font-bold">✓</span>
                    : <span className="text-slate-400">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {polyConfig.note && (
        <p className="text-xs text-slate-500 italic px-1">{polyConfig.note}</p>
      )}
    </div>
  );
}

// ── Main InputsTab ─────────────────────────────────────────────────────────────
export default function InputsTab({ state, onChange, polyConfig, primerTms, primerWarnings }) {
  const updatePrimers = (primers) => onChange({ primers });
  const updateTemplates = (templates) => onChange({ templates });
  const updateSettings = (patch) => onChange({ settings: { ...state.settings, ...patch } });

  const addPrimer = () =>
    updatePrimers([...state.primers, { id: uid(), name: '', sequence: '', concentration: 10, concUnit: 'μM' }]);
  const removePrimer = (id) => updatePrimers(state.primers.filter((p) => p.id !== id));
  const updatePrimer = (id, newP) => updatePrimers(state.primers.map((p) => (p.id === id ? newP : p)));

  const addTemplate = () =>
    updateTemplates([...state.templates, { id: uid(), name: '', type: 'Plasmid' }]);
  const removeTemplate = (id) => updateTemplates(state.templates.filter((t) => t.id !== id));
  const updateTemplate = (id, newT) => updateTemplates(state.templates.map((t) => (t.id === id ? newT : t)));

  return (
    <div className="space-y-6">
      {/* Primers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna size={16} className="text-teal-600" />
            Primers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.primers.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No primers yet — add one below
            </p>
          )}
          {state.primers.map((primer, idx) => (
            <PrimerRow
              key={primer.id}
              primer={primer}
              index={idx}
              tm={primerTms[primer.id]}
              warnings={primerWarnings[primer.id] ?? []}
              onChange={(newP) => updatePrimer(primer.id, newP)}
              onDelete={() => removePrimer(primer.id)}
              showDelete={state.primers.length > 1}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addPrimer} className="w-full mt-1">
            <Plus size={14} /> Add Primer
          </Button>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical size={16} className="text-teal-600" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.templates.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No templates yet — add one below
            </p>
          )}
          {state.templates.map((template) => (
            <TemplateRow
              key={template.id}
              template={template}
              onChange={(newT) => updateTemplate(template.id, newT)}
              onDelete={() => removeTemplate(template.id)}
              showDelete={state.templates.length > 1}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addTemplate} className="w-full mt-1">
            <Plus size={14} /> Add Template
          </Button>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={16} className="text-teal-600" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Reaction Volume (μL)', key: 'reactionVolume', min: 1, max: 100 },
              { label: 'Cycle Count', key: 'cycleCount', min: 1, max: 50 },
              { label: 'Overage (%)', key: 'overage', min: 0, max: 50 },
            ].map(({ label, key, min, max }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <NumericInput
                  value={state.settings[key]}
                  onChange={(n) => updateSettings({ [key]: n })}
                  min={min}
                  max={max}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Polymerase</label>
            <Select
              value={state.settings.polymerase}
              onChange={(e) => updateSettings({ polymerase: e.target.value })}
            >
              {POLYMERASE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <RecipeTable polyConfig={polyConfig} reactionVolume={state.settings.reactionVolume} />
        </CardContent>
      </Card>
    </div>
  );
}

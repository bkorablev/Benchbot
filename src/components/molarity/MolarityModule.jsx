import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

// ── Unit conversion factors ────────────────────────────────────────────────────
const CONC_FACTOR = { 'M': 1, 'mM': 1e-3, 'μM': 1e-6, 'nM': 1e-9 };
const MASS_FACTOR = { 'g': 1, 'mg': 1e-3, 'μg': 1e-6, 'ng': 1e-9 };
const VOL_FACTOR  = { 'L': 1, 'mL': 1e-3, 'μL': 1e-6 };

const CONC_UNITS = ['M', 'mM', 'μM', 'nM'];
const MASS_UNITS = ['g', 'mg', 'μg', 'ng'];
const VOL_UNITS  = ['L', 'mL', 'μL'];

// ── Auto-range helpers ─────────────────────────────────────────────────────────
function autoRangeMass(grams) {
  if (grams >= 1)      return { value: grams,          unit: 'g'  };
  if (grams >= 1e-3)   return { value: grams / 1e-3,   unit: 'mg' };
  if (grams >= 1e-6)   return { value: grams / 1e-6,   unit: 'μg' };
  return                      { value: grams / 1e-9,   unit: 'ng' };
}

function autoRangeVolume(liters) {
  if (liters >= 1)    return { value: liters,         unit: 'L'  };
  if (liters >= 1e-3) return { value: liters / 1e-3,  unit: 'mL' };
  return                     { value: liters / 1e-6,  unit: 'μL' };
}

function autoRangeConc(molar) {
  if (molar >= 1)     return { value: molar,          unit: 'M'  };
  if (molar >= 1e-3)  return { value: molar / 1e-3,   unit: 'mM' };
  if (molar >= 1e-6)  return { value: molar / 1e-6,   unit: 'μM' };
  return                     { value: molar / 1e-9,   unit: 'nM' };
}

function sigFig(n, digits = 4) {
  if (n === 0) return '0';
  const d = Math.floor(Math.log10(Math.abs(n)));
  const factor = Math.pow(10, digits - 1 - d);
  return String(Math.round(n * factor) / factor);
}

function formatResult(ranged) {
  return `${sigFig(ranged.value)} ${ranged.unit}`;
}

// ── NumericField ───────────────────────────────────────────────────────────────
// Allows null (empty) as committed value; reverts invalid non-empty on blur.
function NumericField({ value, onChange, placeholder, className }) {
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
    if (!isNaN(n)) {
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
      className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-800
                  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500
                  focus:border-teal-500 transition-colors ${className ?? ''}`}
    />
  );
}

// ── UnitSelect ─────────────────────────────────────────────────────────────────
function UnitSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-800
                 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                 transition-colors cursor-pointer"
    >
      {options.map((u) => <option key={u} value={u}>{u}</option>)}
    </select>
  );
}

// ── FieldRow ───────────────────────────────────────────────────────────────────
function FieldRow({ label, value, onChange, placeholder, unitOptions, unit, onUnitChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <NumericField
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1"
        />
        {unitOptions && (
          <UnitSelect value={unit} onChange={onUnitChange} options={unitOptions} />
        )}
      </div>
    </div>
  );
}

// ── FWField ────────────────────────────────────────────────────────────────────
function FWField({ value, onChange }) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');
  const lastRef = useRef(value);

  if (lastRef.current !== value) {
    lastRef.current = value;
    const parsed = draft === '' ? null : parseFloat(draft);
    if (parsed !== value) setDraft(value != null ? String(value) : '');
  }

  const commit = () => {
    if (draft.trim() === '') { onChange(null); lastRef.current = null; return; }
    const n = parseFloat(draft);
    if (!isNaN(n)) { onChange(n); lastRef.current = n; }
    else setDraft(lastRef.current != null ? String(lastRef.current) : '');
  };

  const invalid = value != null && value <= 0;

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Formula Weight (g/mol)</label>
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        placeholder="e.g. 342.3"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 transition-colors
                    ${invalid
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'}`}
      />
      {invalid && <p className="text-xs text-red-600 mt-1">Must be greater than 0</p>}
    </div>
  );
}

// ── ResultDisplay ──────────────────────────────────────────────────────────────
function ResultDisplay({ label, result }) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="mt-1 text-2xl font-bold text-teal-600 font-mono">
        {result ?? <span className="text-slate-300">—</span>}
      </div>
    </div>
  );
}

// ── Card 1: Mass from Volume & Concentration ───────────────────────────────────
function MassFromVolConc() {
  const [conc, setConc]       = useState(null);
  const [concUnit, setConcUnit] = useState('mM');
  const [fw, setFw]           = useState(null);
  const [vol, setVol]         = useState(null);
  const [volUnit, setVolUnit] = useState('mL');

  let result = null;
  if (conc != null && fw != null && fw > 0 && vol != null && vol > 0) {
    const massG = conc * CONC_FACTOR[concUnit] * vol * VOL_FACTOR[volUnit] * fw;
    if (isFinite(massG) && !isNaN(massG)) result = formatResult(autoRangeMass(massG));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">1. Mass from volume &amp; concentration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FieldRow
          label="Concentration"
          value={conc} onChange={setConc} placeholder="e.g. 10"
          unitOptions={CONC_UNITS} unit={concUnit} onUnitChange={setConcUnit}
        />
        <FWField value={fw} onChange={setFw} />
        <FieldRow
          label="Volume"
          value={vol} onChange={setVol} placeholder="e.g. 100"
          unitOptions={VOL_UNITS} unit={volUnit} onUnitChange={setVolUnit}
        />
        <ResultDisplay label="Mass =" result={result} />
      </CardContent>
    </Card>
  );
}

// ── Card 2: Volume from Mass & Concentration ───────────────────────────────────
function VolumeFromMassConc() {
  const [mass, setMass]         = useState(null);
  const [massUnit, setMassUnit] = useState('mg');
  const [fw, setFw]             = useState(null);
  const [conc, setConc]         = useState(null);
  const [concUnit, setConcUnit] = useState('mM');

  let result = null;
  if (mass != null && fw != null && fw > 0 && conc != null && conc > 0) {
    const massG  = mass * MASS_FACTOR[massUnit];
    const concM  = conc * CONC_FACTOR[concUnit];
    const volL   = massG / (fw * concM);
    if (isFinite(volL) && !isNaN(volL)) result = formatResult(autoRangeVolume(volL));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">2. Volume from mass &amp; concentration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FieldRow
          label="Mass"
          value={mass} onChange={setMass} placeholder="e.g. 50"
          unitOptions={MASS_UNITS} unit={massUnit} onUnitChange={setMassUnit}
        />
        <FWField value={fw} onChange={setFw} />
        <FieldRow
          label="Concentration"
          value={conc} onChange={setConc} placeholder="e.g. 10"
          unitOptions={CONC_UNITS} unit={concUnit} onUnitChange={setConcUnit}
        />
        <ResultDisplay label="Volume =" result={result} />
      </CardContent>
    </Card>
  );
}

// ── Card 3: Molarity from Mass & Volume ───────────────────────────────────────
function MolarityFromMassVol() {
  const [mass, setMass]       = useState(null);
  const [massUnit, setMassUnit] = useState('mg');
  const [fw, setFw]           = useState(null);
  const [vol, setVol]         = useState(null);
  const [volUnit, setVolUnit] = useState('mL');

  let result = null;
  if (mass != null && fw != null && fw > 0 && vol != null && vol > 0) {
    const massG = mass * MASS_FACTOR[massUnit];
    const volL  = vol  * VOL_FACTOR[volUnit];
    const concM = massG / (fw * volL);
    if (isFinite(concM) && !isNaN(concM)) result = formatResult(autoRangeConc(concM));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">3. Molarity from mass &amp; volume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FieldRow
          label="Mass"
          value={mass} onChange={setMass} placeholder="e.g. 100"
          unitOptions={MASS_UNITS} unit={massUnit} onUnitChange={setMassUnit}
        />
        <FWField value={fw} onChange={setFw} />
        <FieldRow
          label="Volume"
          value={vol} onChange={setVol} placeholder="e.g. 10"
          unitOptions={VOL_UNITS} unit={volUnit} onUnitChange={setVolUnit}
        />
        <ResultDisplay label="Molarity =" result={result} />
      </CardContent>
    </Card>
  );
}

// ── Card 4: Dilution (C₁V₁ = C₂V₂) ───────────────────────────────────────────
function DilutionCalculator() {
  const [c1, setC1]           = useState(null);
  const [c1Unit, setC1Unit]   = useState('mM');
  const [c2, setC2]           = useState(null);
  const [c2Unit, setC2Unit]   = useState('μM');
  const [v2, setV2]           = useState(null);
  const [v2Unit, setV2Unit]   = useState('mL');

  const c1M = c1 != null ? c1 * CONC_FACTOR[c1Unit] : null;
  const c2M = c2 != null ? c2 * CONC_FACTOR[c2Unit] : null;
  const v2L = v2 != null ? v2 * VOL_FACTOR[v2Unit]  : null;

  let result    = null;
  let helperLine = null;
  let warning   = null;

  if (c1M != null && c2M != null && v2L != null && c1M > 0 && c2M > 0 && v2L > 0) {
    if (c2M > c1M) {
      warning = 'Desired concentration is higher than stock — check your values.';
    } else {
      const v1L = (c2M * v2L) / c1M;
      if (isFinite(v1L) && !isNaN(v1L)) {
        const rangedV1 = autoRangeVolume(v1L);
        result = formatResult(rangedV1);

        const solventL = v2L - v1L;
        const rangedSolvent = autoRangeVolume(Math.max(0, solventL));
        const rangedV2      = autoRangeVolume(v2L);
        const c2Display     = formatResult(autoRangeConc(c2M));

        helperLine = `Add ${formatResult(rangedV1)} of stock to ${formatResult(rangedSolvent)} of solvent to reach ${formatResult(rangedV2)} total volume at ${c2Display} concentration.`;
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">4. Dilute a stock solution (C₁V₁ = C₂V₂)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FieldRow
          label="Stock concentration (C₁)"
          value={c1} onChange={setC1} placeholder="e.g. 10"
          unitOptions={CONC_UNITS} unit={c1Unit} onUnitChange={setC1Unit}
        />
        <FieldRow
          label="Desired concentration (C₂)"
          value={c2} onChange={setC2} placeholder="e.g. 100"
          unitOptions={CONC_UNITS} unit={c2Unit} onUnitChange={setC2Unit}
        />
        <FieldRow
          label="Desired volume (V₂)"
          value={v2} onChange={setV2} placeholder="e.g. 10"
          unitOptions={VOL_UNITS} unit={v2Unit} onUnitChange={setV2Unit}
        />

        {warning && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <span className="mt-0.5">⚠</span>
            <span>{warning}</span>
          </div>
        )}

        <ResultDisplay label="Required volume =" result={result} />

        {helperLine && (
          <p className="text-xs text-slate-500 leading-relaxed">{helperLine}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── MolarityModule ─────────────────────────────────────────────────────────────
export default function MolarityModule() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Molarity Calculator</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Four independent calculators for common molarity conversions. Results update as you type.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MassFromVolConc />
        <VolumeFromMassConc />
        <MolarityFromMassVol />
        <DilutionCalculator />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { RefreshCw, Beaker } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { MOLAR_RATIOS } from '../../data/constants';
import { calculateRNP } from '../../utils/rnpCalc';

function NumberSpinner({ label, value, onChange, min = 0.1, max = 1000, step = 0.5, unit }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        {unit && <span className="text-xs text-slate-500 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, primary, secondary, highlight = false }) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
        highlight ? 'bg-teal-600 text-white' : 'hover:bg-slate-50'
      }`}
    >
      <span className={`text-sm ${highlight ? 'font-semibold text-white' : 'text-slate-600'}`}>
        {label}
      </span>
      <div className="text-right">
        <span className={`text-sm font-semibold ${highlight ? 'text-white' : 'text-slate-800'}`}>
          {primary}
        </span>
        {secondary && (
          <span className={`text-xs ml-2 ${highlight ? 'text-teal-100' : 'text-slate-400'}`}>
            ({secondary})
          </span>
        )}
      </div>
    </div>
  );
}

export default function RNPCalculator({ onResultChange }) {
  const [cas9Stock, setCas9Stock] = useState(20);
  const [sgrnaStock, setSgrnaStock] = useState(100);
  const [ratioValue, setRatioValue] = useState(1.2);
  const [result, setResult] = useState(() => calculateRNP(20, 100, 1.2));

  // Notify parent whenever result changes (including initial render)
  useEffect(() => {
    onResultChange?.(result);
  }, [result]);

  const recalculate = () => {
    setResult(calculateRNP(cas9Stock, sgrnaStock, ratioValue));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker size={16} className="text-teal-600" />
            Reagent Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberSpinner
              label="Cas9 stock concentration"
              value={cas9Stock}
              onChange={setCas9Stock}
              unit="μM"
              step={1}
            />
            <NumberSpinner
              label="sgRNA stock concentration"
              value={sgrnaStock}
              onChange={setSgrnaStock}
              unit="μM"
              step={5}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cas9:sgRNA molar ratio
            </label>
            <Select
              value={ratioValue}
              onChange={(e) => setRatioValue(parseFloat(e.target.value))}
            >
              {MOLAR_RATIOS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </div>
          <Button onClick={recalculate} variant="secondary" size="sm" className="w-full">
            <RefreshCw size={14} />
            Recalculate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculated Volumes — Per Reaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0.5">
          {!result.valid && (
            <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
              ⚠ Cas9 + sgRNA volumes exceed 5 μL. Reduce amounts or increase stock concentrations.
            </div>
          )}
          <ResultRow
            label="Cas9 protein"
            primary={`${result.cas9Pmol} pmol`}
            secondary={`${result.cas9Ug} μg`}
          />
          <ResultRow
            label="sgRNA"
            primary={`${result.sgrnaPmol.toFixed(1)} pmol`}
            secondary={`${result.sgrnaUg} μg`}
          />
          <div className="my-1 border-t border-slate-100" />
          <ResultRow
            label="Cas9 volume"
            primary={`${result.cas9Vol} μL`}
          />
          <ResultRow
            label="sgRNA volume"
            primary={`${result.sgrnaVol} μL`}
          />
          <ResultRow
            label="Buffer top-up"
            primary={`${result.bufferTopUp} μL`}
            secondary="1× PBS or nuclease-free water"
          />
          <div className="my-1 border-t border-slate-100" />
          <ResultRow
            label="Total RNP volume"
            primary="5 μL"
            highlight
          />
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
            Molar ratio confirmed: 1:{ratioValue} (Cas9:sgRNA)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

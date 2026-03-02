import { Plus, Trash2, FlaskConical, Dna, LayoutGrid, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Toggle } from './ui/Toggle';
import { CELL_LINES, ELECTROPORATION_SYSTEMS, PLATE_FORMATS, GUIDE_COLORS } from '../data/constants';

const DEFAULT_GUIDE = (index) => ({
  id: Date.now() + index,
  label: `g${index + 1}`,
  name: '',
  sequence: '',
  color: GUIDE_COLORS[index % GUIDE_COLORS.length],
  replicates: 3,
});

function ReplicateCounter({ value, onChange, min = 1, max = 12 }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium cursor-pointer"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-semibold text-slate-700">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium cursor-pointer"
      >
        +
      </button>
    </div>
  );
}

function plateValidation(guides, controls, plateFormat) {
  const format = PLATE_FORMATS.find((f) => f.label === plateFormat) || PLATE_FORMATS[0];
  let totalWells = 0;
  guides.forEach((g) => (totalWells += g.replicates));
  if (controls.nonTargeting.enabled) totalWells += controls.nonTargeting.replicates;
  if (controls.untransfected.enabled) totalWells += controls.untransfected.replicates;
  if (controls.positiveControl.enabled) totalWells += controls.positiveControl.replicates;

  const innerWells =
    format.label === '96-well'
      ? 60
      : format.label === '48-well'
      ? 24
      : 8;

  const fits = totalWells <= innerWells;
  const fitsTotal = totalWells <= format.wells;

  return { totalWells, innerWells, totalWellsInPlate: format.wells, fits, fitsTotal, format };
}

export default function ExperimentForm({ value, onChange, onGenerate, hasGenerated }) {
  const { cellLine, system, guides, controls, plateFormat } = value;

  const update = (patch) => onChange({ ...value, ...patch });

  const addGuide = () => {
    update({ guides: [...guides, DEFAULT_GUIDE(guides.length)] });
  };

  const removeGuide = (id) => {
    update({ guides: guides.filter((g) => g.id !== id) });
  };

  const updateGuide = (id, field, val) => {
    update({
      guides: guides.map((g) => (g.id === id ? { ...g, [field]: val } : g)),
    });
  };

  const updateControl = (key, field, val) => {
    update({
      controls: {
        ...controls,
        [key]: { ...controls[key], [field]: val },
      },
    });
  };

  const validation = plateValidation(guides, controls, plateFormat);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center pb-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <span className="text-teal-600">
            <Dna size={32} />
          </span>
          Benchbot
        </h1>
        <p className="mt-1 text-slate-500 text-sm">CRISPR Experiment Protocol Generator</p>
      </div>

      {/* Cell Line & System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical size={16} className="text-teal-600" />
            Experiment Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cell Line
              </label>
              <Select value={cellLine} onChange={(e) => update({ cellLine: e.target.value })}>
                {CELL_LINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Electroporation System
              </label>
              <Select value={system} onChange={(e) => update({ system: e.target.value })}>
                {ELECTROPORATION_SYSTEMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide RNAs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna size={16} className="text-teal-600" />
            Guide RNAs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: guide.color }}
                />
                <span className="text-xs font-bold text-slate-500 w-6 shrink-0">{guide.label}</span>
                <Input
                  placeholder="Guide name (e.g. BRCA1-ex5)"
                  value={guide.name}
                  onChange={(e) => updateGuide(guide.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-slate-500">reps</span>
                  <ReplicateCounter
                    value={guide.replicates}
                    onChange={(v) => updateGuide(guide.id, 'replicates', v)}
                  />
                </div>
                {guides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGuide(guide.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 pl-5">
                <Input
                  placeholder="Sequence (optional, 20-mer, 5'→3')"
                  value={guide.sequence}
                  onChange={(e) =>
                    updateGuide(guide.id, 'sequence', e.target.value.toUpperCase())
                  }
                  maxLength={20}
                  className="font-mono text-xs"
                />
                {guide.sequence && (
                  <span
                    className={`shrink-0 self-center text-xs px-2 py-1 rounded-md font-mono ${
                      guide.sequence.length === 20
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {guide.sequence.length}/20
                  </span>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGuide}
            className="w-full mt-1"
          >
            <Plus size={14} />
            Add guide
          </Button>
        </CardContent>
      </Card>

      {/* Experimental Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Experimental Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              key: 'nonTargeting',
              label: 'Non-targeting gRNA',
              description: 'Scrambled guide — no genomic target',
            },
            {
              key: 'untransfected',
              label: 'Untransfected',
              description: 'Cells without RNP (mock)',
            },
            {
              key: 'positiveControl',
              label: 'Positive control',
              description: 'Previously validated guide',
            },
          ].map(({ key, label, description }) => (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                controls[key].enabled
                  ? 'border-teal-200 bg-teal-50/50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Toggle
                  checked={controls[key].enabled}
                  onChange={(v) => updateControl(key, 'enabled', v)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>
              {controls[key].enabled && (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-slate-500">reps</span>
                  <ReplicateCounter
                    value={controls[key].replicates}
                    onChange={(v) => updateControl(key, 'replicates', v)}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plate Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-teal-600" />
            Recovery Plate Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={plateFormat} onChange={(e) => update({ plateFormat: e.target.value })}>
            {PLATE_FORMATS.map((f) => (
              <option key={f.label} value={f.label}>{f.label} plate</option>
            ))}
          </Select>
          <div
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              validation.fits
                ? 'bg-teal-50 text-teal-700'
                : validation.fitsTotal
                ? 'bg-orange-50 text-orange-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <span className="text-base">
              {validation.fits ? '✓' : validation.fitsTotal ? '⚠' : '✗'}
            </span>
            <span>
              {validation.totalWells} well{validation.totalWells !== 1 ? 's' : ''} needed —{' '}
              {validation.fits
                ? `fits in inner wells (${validation.innerWells} available, edge wells avoided)`
                : validation.fitsTotal
                ? `uses edge wells (inner: ${validation.innerWells}, total: ${validation.totalWellsInPlate})`
                : `exceeds plate capacity (${validation.totalWellsInPlate} wells total)`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" variant="primary" size="lg" className="w-full">
        {hasGenerated ? <RefreshCw size={17} /> : <FlaskConical size={18} />}
        {hasGenerated ? 'Update Protocol' : 'Generate Protocol'}
      </Button>
    </form>
  );
}

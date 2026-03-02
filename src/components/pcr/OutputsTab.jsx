import { Download, Copy, Check, AlertTriangle, Thermometer } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  scaleRecipe, overageFactor, groupMasterMixes, groupPrograms,
  formatTime, calcExtensionSecs, generateExportText,
} from '../../utils/pcrCalc';

// ── Annealing section ─────────────────────────────────────────────────────────
function AnnealingSection({ allReactions }) {
  const taValues = allReactions.filter((r) => !r.isNTC && r.ta != null).map((r) => r.ta);
  const minTa = taValues.length > 0 ? Math.min(...taValues) : null;

  return (
    <div className="space-y-4">
      {minTa != null ? (
        <div className="flex items-center gap-4 px-5 py-4 bg-teal-600 rounded-xl text-white">
          <Thermometer size={28} className="shrink-0" />
          <div>
            <div className="text-3xl font-bold">{minTa}°C</div>
            <div className="text-sm text-teal-100">Recommended Ta — lowest across all reactions</div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-500">
          No Ta computed yet — assign primers to reactions in the Mapping tab.
        </div>
      )}

      {/* Per-reaction table */}
      {allReactions.filter((r) => r.fPrimer && r.rPrimer).length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Well', 'Tm F (°C)', 'Tm R (°C)', 'Ta (°C)', 'Primers', 'Template', 'Amplicon'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allReactions.filter((r) => r.fPrimer && r.rPrimer).map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs font-semibold">{r.well}</td>
                  <td className="px-3 py-2 text-xs">{r.fTm ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.rTm ?? '—'}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-teal-700">{r.ta ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {r.fPrimer?.name} / {r.rPrimer?.name}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {r.isNTC ? <span className="italic text-slate-400">NTC</span> : (r.template?.name || '—')}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.ampliconBp ? `${r.ampliconBp} bp` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Master Mix card ───────────────────────────────────────────────────────────
function MasterMixCard({ group, scaledRecipe }) {
  const r0 = group[0];
  const n  = group.length;
  const y  = overageFactor(n);

  const mmComponents = scaledRecipe.filter((c) => c.mastermix);
  const templateComp = scaledRecipe.find((c) => !c.mastermix);
  const volumeWithoutTemplate = Math.round(mmComponents.reduce((s, c) => s + c.scaledVolume, 0) * 100) / 100;

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {r0.fPrimer?.name || '—'} + {r0.rPrimer?.name || '—'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Template: {r0.template?.name || '—'}</p>
          </div>
          <Badge variant="teal">{n} rxns → {y}×</Badge>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 py-1.5 text-slate-500 font-semibold">Component</th>
                <th className="text-right px-3 py-1.5 text-slate-500 font-semibold">Per Rxn (μL)</th>
                <th className="text-right px-3 py-1.5 text-slate-500 font-semibold">Total (μL)</th>
              </tr>
            </thead>
            <tbody>
              {mmComponents.map((c, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-1.5 text-slate-700">{c.component}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{c.scaledVolume}</td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold text-teal-700">
                    {Math.round(c.scaledVolume * y * 100) / 100}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-teal-700 font-medium bg-teal-50 px-3 py-2 rounded-lg">
          Aliquot {volumeWithoutTemplate} μL per reaction, then add{' '}
          {templateComp?.scaledVolume ?? '—'} μL Template DNA per well.
        </div>

        <div className="text-xs text-slate-500">
          Wells: {group.map((r) => r.well).join(', ')}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Individual reactions table ────────────────────────────────────────────────
function IndividualReactionsTable({ singles, scaledRecipe }) {
  if (singles.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-700">Individual Reactions</h4>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Well</th>
              {scaledRecipe.map((c, i) => (
                <th key={i} className="px-3 py-2 text-right font-semibold text-slate-600 whitespace-nowrap">{c.component}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {singles.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-mono font-semibold text-slate-700">
                  {r.well}
                  {r.isNTC && <span className="ml-1 text-slate-400 italic">(NTC)</span>}
                </td>
                {scaledRecipe.map((c, i) => (
                  <td key={i} className="px-3 py-2 text-right font-mono text-slate-700">
                    {r.isNTC && !c.mastermix ? <span className="text-slate-400">—</span> : c.scaledVolume}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Thermocycler program card ─────────────────────────────────────────────────
function ProgramCard({ program, index, polyConfig, cycleCount }) {
  const [copied, setCopied] = useState(false);

  const extTime = formatTime(program.extensionSecs);
  const text = [
    `Program ${index + 1}`,
    `─────────────────────────────────`,
    `1. Initial Denaturation: ${polyConfig.initialDenaturation.temp}°C for ${formatTime(polyConfig.initialDenaturation.time)}`,
    `2. ${cycleCount} Cycles:`,
    `   a. Denaturation: ${polyConfig.denaturation.temp}°C for ${formatTime(polyConfig.denaturation.time)}`,
    `   b. Annealing:    ${program.ta}°C for 30 s`,
    `   c. Extension:    ${polyConfig.extensionTemp}°C for ${extTime}`,
    `3. Final Extension: ${polyConfig.finalExtension.temp}°C for ${formatTime(polyConfig.finalExtension.time)}`,
    `4. Hold:            4°C ∞`,
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Program {index + 1}</p>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <Check size={13} className="text-teal-600" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <pre className="text-xs font-mono bg-slate-900 text-slate-100 rounded-lg p-4 leading-relaxed overflow-x-auto whitespace-pre">
          {`1. Initial Denaturation:  ${polyConfig.initialDenaturation.temp}°C  ${formatTime(polyConfig.initialDenaturation.time)}\n`}
          {`2. ${cycleCount} Cycles:\n`}
          {`   a. Denaturation:  ${polyConfig.denaturation.temp}°C  ${formatTime(polyConfig.denaturation.time)}\n`}
          {`   b. Annealing:     `}
          <span className="text-teal-300 font-bold">{program.ta}°C</span>
          {`  30 s\n`}
          {`   c. Extension:     ${polyConfig.extensionTemp}°C  ${extTime}\n`}
          {`3. Final Extension:   ${polyConfig.finalExtension.temp}°C  ${formatTime(polyConfig.finalExtension.time)}\n`}
          {`4. Hold:              4°C  ∞`}
        </pre>

        <p className="text-xs text-slate-500">
          <span className="font-semibold">Wells:</span>{' '}
          {program.reactions.map((r) => r.well).join(', ')}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-slate-200" />
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {children}
      </h3>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

// ── Main OutputsTab ───────────────────────────────────────────────────────────
export default function OutputsTab({ state, allReactions, polyConfig, primerTms }) {
  const scaledRecipe = scaleRecipe(polyConfig.recipe, state.settings.reactionVolume, polyConfig.baseVolume);
  const { mms, singles } = groupMasterMixes(allReactions);
  const programs = groupPrograms(allReactions, polyConfig);

  // Attach _tm and _warnings to primers for export
  const primersForExport = state.primers.map((p) => ({
    ...p,
    _tm: primerTms[p.id],
  }));

  const handleExport = () => {
    const text = generateExportText(
      { ...state, primers: primersForExport },
      allReactions,
      polyConfig
    );
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `pcr-protocol-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      {/* Export button (top right) */}
      <div className="flex justify-end">
        <Button variant="secondary" size="md" onClick={handleExport}>
          <Download size={14} />
          Export Summary
        </Button>
      </div>

      {/* Annealing Temperature */}
      <div>
        <SectionTitle>Annealing Temperature</SectionTitle>
        <AnnealingSection allReactions={allReactions} />
      </div>

      {/* Master Mix Instructions */}
      <div>
        <SectionTitle>Master Mix Instructions</SectionTitle>
        {mms.length === 0 && singles.length === 0 ? (
          <div className="px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-500">
            No reactions defined yet — set up your reactions in the Mapping tab.
          </div>
        ) : (
          <div className="space-y-6">
            {mms.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {mms.map((group, i) => (
                    <MasterMixCard key={i} group={group} scaledRecipe={scaledRecipe} />
                  ))}
                </div>
              </div>
            )}
            <IndividualReactionsTable singles={singles} scaledRecipe={scaledRecipe} />
          </div>
        )}
      </div>

      {/* Thermocycler Programs */}
      <div>
        <SectionTitle>Thermocycler Programs</SectionTitle>
        {programs.length === 0 ? (
          <div className="px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-500">
            No programs yet — assign primers and amplicon sizes in the Mapping tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {programs.map((prog, i) => (
              <ProgramCard
                key={i}
                program={prog}
                index={i}
                polyConfig={polyConfig}
                cycleCount={state.settings.cycleCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Lightbulb } from 'lucide-react';
import { Badge } from '../ui/Badge';

function TipBox({ children }) {
  return (
    <div className="flex gap-2 mt-3 px-3 py-2.5 bg-teal-50 border border-teal-100 rounded-lg">
      <Lightbulb size={13} className="text-teal-600 mt-0.5 shrink-0" />
      <p className="text-xs text-teal-700">{children}</p>
    </div>
  );
}

function Step({ number, category, title, timing, bullets, tip }) {
  return (
    <div className="flex gap-4">
      {/* Step number */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
          {number}
        </div>
        <div className="flex-1 w-px bg-slate-200 my-1" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{category}</span>
          {timing && (
            <Badge variant="slate">{timing}</Badge>
          )}
        </div>
        <h4 className="text-base font-semibold text-slate-800 mb-2">{title}</h4>
        <ul className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="text-teal-500 mt-0.5 shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {tip && <TipBox>{tip}</TipBox>}
      </div>
    </div>
  );
}

export default function StepByStepProtocol({ experiment, settings, rnpResult, masterMixes = [] }) {
  const { cellLine, system, guides, controls } = experiment;
  const guideNames = guides.map((g) => g.name || g.label).join(', ');
  const totalReactions =
    guides.reduce((s, g) => s + g.replicates, 0) +
    (controls.nonTargeting?.enabled ? controls.nonTargeting.replicates : 0) +
    (controls.untransfected?.enabled ? controls.untransfected.replicates : 0) +
    (controls.positiveControl?.enabled ? controls.positiveControl.replicates : 0);

  const steps = [
    {
      category: 'PREPARATION',
      title: 'Cell Culture Preparation',
      timing: 'Day −1',
      bullets: [
        `Expand ${cellLine} cells to ensure sufficient cell number for experiment.`,
        `Target: ${(totalReactions * 2e5 * 1.2 / 1e6).toFixed(1)} × 10⁶ cells total (${totalReactions} reactions × 2 × 10⁵ cells + 20% overage).`,
        `Ensure cells are in log-phase growth (60–80% confluency or density < 1 × 10⁶ cells/mL for suspension cells).`,
        `Pre-warm complete growth medium to 37°C in advance.`,
      ],
      tip: `${cellLine} cells should be passaged 24–48 hours before electroporation for best viability and transfection efficiency.`,
    },
    {
      category: 'PREPARATION',
      title: 'Reagent Preparation',
      timing: '30 min before',
      bullets: [
        `Thaw Cas9 protein (stock: 20 μM default; adjust to your stock) on ice.`,
        `Thaw sgRNA stocks for: ${guideNames}.`,
        controls.nonTargeting?.enabled ? 'Thaw non-targeting control sgRNA.' : null,
        controls.positiveControl?.enabled ? 'Thaw positive control sgRNA.' : null,
        `Warm ${settings.buffer} to room temperature (15–25 min).`,
        `Pre-warm recovery medium: add supplement if required.`,
        `Label all tubes and plates clearly.`,
      ].filter(Boolean),
      tip: 'Keep Cas9 protein on ice at all times until use. Avoid repeated freeze-thaw cycles.',
    },
    {
      category: 'RNP ASSEMBLY',
      title: 'Form RNP Complexes',
      timing: '15 min',
      bullets: (() => {
        const rnpMixes = masterMixes.filter((m) => !m.isUntransfected);
        const untransfectedMix = masterMixes.find((m) => m.isUntransfected);
        const hasMM = rnpMixes.length > 0;

        if (!hasMM) {
          // All single reactions — per-reaction volumes
          const cas9V = rnpResult?.cas9Vol ?? '—';
          const sgrnaV = rnpResult?.sgrnaVol ?? '—';
          const bufV = rnpResult?.bufferTopUp ?? '—';
          return [
            `Each condition has 1 replicate — prepare RNP individually per reaction.`,
            `For each guide (${guideNames}${controls.nonTargeting?.enabled ? ', NT control' : ''}${controls.positiveControl?.enabled ? ', positive control' : ''}):`,
            `  1. Add Cas9 ${cas9V} μL to a low-bind tube.`,
            `  2. Add sgRNA ${sgrnaV} μL directly to Cas9.`,
            `  3. Add buffer ${bufV} μL to bring total to 5 μL.`,
            `  4. Mix gently by pipetting 5× — do not vortex.`,
            `  5. Incubate at room temperature for 10–15 min.`,
            untransfectedMix
              ? `Untransfected: add 5 μL electroporation buffer — no RNP.`
              : null,
          ].filter(Boolean);
        }

        return [
          `Prepare ${rnpMixes.length} master mix${rnpMixes.length !== 1 ? 'es' : ''} as calculated in the Master Mix Calculator above.`,
          ...rnpMixes.map(
            (m) =>
              `${m.name}: Cas9 ${m.cas9Vol} μL + sgRNA ${m.sgrnaVol} μL + buffer ${m.bufferTopUp} μL → ${m.totalVol} μL total (covers ${m.reactions} reactions).`
          ),
          `For each MM: add components to a low-bind tube, mix gently by pipetting 5×, do not vortex.`,
          `Incubate all MMs at room temperature for 10–15 min.`,
          `Aliquot 5 μL of the appropriate MM into each reaction tube just before electroporation.`,
          untransfectedMix
            ? `Untransfected (${untransfectedMix.reactions} wells): add 5 μL electroporation buffer — no RNP.`
            : null,
        ].filter(Boolean);
      })(),
      tip: 'RNP complexes are most active when freshly assembled. Use within 2 hours of preparation.',
    },
    {
      category: 'CELL PREPARATION',
      title: 'Harvest and Count Cells',
      timing: '10 min',
      bullets: [
        `Collect ${cellLine} cells: centrifuge at 200× g for 5 min.`,
        `Aspirate medium completely; residual serum inhibits electroporation.`,
        `Resuspend in 1× PBS, count cells (hemocytometer or automated counter).`,
        `Centrifuge again at 200× g for 5 min, aspirate PBS.`,
        `Resuspend in ${settings.buffer} at 2 × 10⁵ cells per 20 μL.`,
        `Prepare ${totalReactions} aliquots of 20 μL each in individual tubes.`,
      ],
      tip: 'Work quickly once cells are resuspended in electroporation buffer — extended exposure reduces viability.',
    },
    {
      category: 'ELECTROPORATION',
      title: `Electroporate with ${system}`,
      timing: '5–10 min',
      bullets: [
        `For each reaction: combine 20 μL cell suspension + 5 μL RNP (total 25 μL).`,
        `Mix gently and transfer to ${settings.tipCuvette}.`,
        `Electroporate using program: ${settings.program}.`,
        `Immediately add 75 μL pre-warmed recovery medium to the cuvette.`,
        `Transfer cells to a recovery plate well with 0.5–1 mL pre-warmed medium.`,
        `Process all ${totalReactions} reactions before placing plate in incubator.`,
      ],
      tip: settings.tip,
    },
    {
      category: 'RECOVERY',
      title: 'Cell Recovery and Expansion',
      timing: '48–72 hours',
      bullets: [
        `Incubate cells at 37°C, 5% CO₂ for 48–72 hours without disturbing.`,
        `Do not change medium for the first 24 hours.`,
        `At 48 h: assess viability (trypan blue or live/dead stain).`,
        `Expand cells if needed before downstream analysis.`,
        `If using ${experiment.plateFormat} format: inner wells provide best recovery conditions.`,
      ],
      tip: 'Cells typically look stressed at 24 h — most will recover by 48 h. Low viability at 48 h indicates electroporation conditions need optimization.',
    },
    {
      category: 'GENOTYPING',
      title: 'Assess Editing Efficiency',
      timing: 'Day 3–5',
      bullets: [
        `Harvest cells and extract genomic DNA (spin column or magnetic bead protocol).`,
        `PCR-amplify the target locus for each guide: ${guideNames}.`,
        `Analyze editing by ICE analysis (Sanger sequencing) or TIDE/TIDES.`,
        `Alternatively: run PCR amplicons on SURVEYOR/T7E1 assay for rapid screening.`,
        controls.nonTargeting?.enabled
          ? 'Non-targeting control: expect 0% indels — confirms assay specificity.'
          : null,
        controls.positiveControl?.enabled
          ? 'Positive control: validate expected editing rate before interpreting experimental guides.'
          : null,
        `Record editing efficiency (% indels or % HDR) for each condition.`,
      ].filter(Boolean),
      tip: 'ICE analysis (Synthego) and TIDE (Brinkman et al.) are free online tools for Sanger-based editing quantification.',
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Step-by-Step Protocol</h3>
      <div>
        {steps.map((step, i) => (
          <Step
            key={i}
            number={i + 1}
            category={step.category}
            title={step.title}
            timing={step.timing}
            bullets={step.bullets}
            tip={step.tip}
          />
        ))}
      </div>
    </div>
  );
}

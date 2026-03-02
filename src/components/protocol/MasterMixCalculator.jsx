import { FlaskConical, Info } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

function VolumeCell({ label, value, unit = 'μL', muted = false }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-semibold ${muted ? 'text-slate-400' : 'text-slate-800'}`}>
        {value != null ? `${value}` : '—'}
        {value != null && <span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>}
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function MMCard({ mm }) {
  if (mm.isUntransfected) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">{mm.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mm.reactions} reactions</p>
            </div>
            <Badge variant="slate">No RNP</Badge>
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500">
              Untransfected cells do not receive RNP. Add <strong>5 μL electroporation buffer</strong> per
              well in place of the RNP master mix.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <FlaskConical size={13} className="text-teal-600" />
              <p className="text-sm font-semibold text-slate-800">{mm.name}</p>
            </div>
            <p className="text-xs text-slate-500">
              {mm.reactions} reactions · scale ×{mm.scale}{' '}
              <span className="text-slate-400">({mm.reactions} rxns + 10% overage)</span>
            </p>
          </div>
          <Badge variant="teal">{mm.reactions} rxns</Badge>
        </div>

        {/* Volume grid */}
        <div className="grid grid-cols-4 gap-2 py-3 px-2 bg-slate-50 rounded-lg border border-slate-100">
          <VolumeCell label="Cas9" value={mm.cas9Vol} />
          <VolumeCell label="sgRNA" value={mm.sgrnaVol} />
          <VolumeCell label="Buffer" value={mm.bufferTopUp} />
          <div className="text-center border-l border-slate-200">
            <div className="text-sm font-bold text-teal-600">
              {mm.totalVol}
              <span className="text-xs font-normal text-teal-400 ml-0.5">μL</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Total</div>
          </div>
        </div>

        {/* Instruction */}
        <p className="text-xs text-teal-700 font-medium">
          → Aliquot {mm.perReactionVol} μL of this MM into each of the {mm.reactions} reaction tubes
        </p>
      </CardContent>
    </Card>
  );
}

export default function MasterMixCalculator({ masterMixes }) {
  const allSingle = masterMixes.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Master Mix Calculator</h3>
        {!allSingle && (
          <span className="text-xs text-slate-400">
            {masterMixes.filter((m) => !m.isUntransfected).length} RNP mix
            {masterMixes.filter((m) => !m.isUntransfected).length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {allSingle ? (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-700">
          <Info size={14} className="shrink-0" />
          No master mixes needed — all conditions are single reactions. Prepare each RNP individually per the volumes above.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {masterMixes.map((mm, i) => (
            <MMCard key={i} mm={mm} />
          ))}
        </div>
      )}
    </div>
  );
}

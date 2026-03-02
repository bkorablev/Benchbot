import { ShieldOff, UserX, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

const controlDefs = [
  {
    key: 'nonTargeting',
    icon: ShieldOff,
    badge: 'Negative',
    badgeVariant: 'slate',
    title: 'Non-targeting gRNA',
    description:
      'A scrambled or non-targeting guide RNA that does not match any genomic sequence. Controls for Cas9 delivery and RNP toxicity.',
    tip: 'Expect no editing. Any effect observed is due to the RNP itself, not target cleavage.',
  },
  {
    key: 'untransfected',
    icon: UserX,
    badge: 'Mock',
    badgeVariant: 'slate',
    title: 'Untransfected cells',
    description:
      'Cells that undergo the full workflow without receiving any RNP. Establishes baseline viability and growth.',
    tip: 'Compare viability and growth to electroporated samples to assess procedure toxicity.',
  },
  {
    key: 'positiveControl',
    icon: CheckCircle,
    badge: 'Positive',
    badgeVariant: 'teal',
    title: 'Positive control',
    description:
      'A previously validated guide RNA with confirmed high editing efficiency. Verifies RNP activity in the current experiment.',
    tip: 'Use a guide targeting a safe harbor or housekeeping gene with known >70% efficiency.',
  },
];

export default function ControlsSection({ controls }) {
  const activeControls = controlDefs.filter((c) => controls[c.key]?.enabled);

  if (activeControls.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Recommended Controls</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {activeControls.map(({ key, icon: Icon, badge, badgeVariant, title, description, tip }) => (
          <Card key={key}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Icon size={15} className="text-teal-600" />
                <Badge variant={badgeVariant}>{badge}</Badge>
              </div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              <div className="pt-1 text-xs text-teal-700 font-medium">{tip}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

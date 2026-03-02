import { Zap, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

function SettingRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function ElectroporationCard({ settings, cellLine, system }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap size={16} className="text-teal-600" />
          Electroporation Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <SettingRow label="System" value={system} />
          <SettingRow label="Cell line" value={cellLine} />
          <SettingRow label="Cells per reaction" value={settings.cellCount} />
          <SettingRow label="Buffer" value={settings.buffer} />
          <SettingRow label="Tip / Cuvette" value={settings.tipCuvette} />
          <SettingRow label="Program / Settings" value={settings.program} />
        </div>
        <div className="flex gap-2 px-3 py-2.5 bg-teal-50 border border-teal-100 rounded-lg">
          <Lightbulb size={14} className="text-teal-600 mt-0.5 shrink-0" />
          <p className="text-xs text-teal-700">{settings.tip}</p>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Dna, Download } from 'lucide-react';
import { Button } from './ui/Button';
import RNPCalculator from './protocol/RNPCalculator';
import MasterMixCalculator from './protocol/MasterMixCalculator';
import ElectroporationCard from './protocol/ElectroporationCard';
import ControlsSection from './protocol/ControlsSection';
import PlateLayout from './protocol/PlateLayout';
import StepByStepProtocol from './protocol/StepByStepProtocol';
import { getElectroporationSettings } from '../data/constants';
import { calculateRNP } from '../utils/rnpCalc';
import { buildMasterMixes } from '../utils/masterMixCalc';

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-slate-200" />
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {children}
      </h2>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export default function ProtocolPage({ experiment }) {
  const { cellLine, system, guides, controls, plateFormat } = experiment;
  const settings = getElectroporationSettings(cellLine, system);

  // Track the live RNP result so MMs and Step 3 stay in sync with the calculator
  const [rnpResult, setRnpResult] = useState(() => calculateRNP(20, 100, 1.2));

  const masterMixes = buildMasterMixes(guides, controls, rnpResult);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Section header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dna size={16} className="text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">Generated Protocol</h2>
          </div>
          <p className="text-sm text-slate-500">
            {guides.length} guide RNA{guides.length !== 1 ? 's' : ''} · {cellLine} ·{' '}
            {system} · {plateFormat}
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={14} />
          Export
        </Button>
      </div>

      {/* RNP Complex — per reaction */}
      <div>
        <SectionTitle>RNP Complex — Per Reaction</SectionTitle>
        <RNPCalculator onResultChange={setRnpResult} />
      </div>

      {/* Master Mix Calculator */}
      <div>
        <SectionTitle>Master Mix Calculator</SectionTitle>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <MasterMixCalculator masterMixes={masterMixes} />
        </div>
      </div>

      {/* Electroporation Settings */}
      <div>
        <SectionTitle>Electroporation Settings</SectionTitle>
        <ElectroporationCard settings={settings} cellLine={cellLine} system={system} />
      </div>

      {/* Controls */}
      {(controls.nonTargeting?.enabled ||
        controls.untransfected?.enabled ||
        controls.positiveControl?.enabled) && (
        <div>
          <SectionTitle>Recommended Controls</SectionTitle>
          <ControlsSection controls={controls} />
        </div>
      )}

      {/* Plate Layout */}
      <div>
        <SectionTitle>Plate Layout</SectionTitle>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <PlateLayout guides={guides} controls={controls} plateFormat={plateFormat} />
        </div>
      </div>

      {/* Protocol Steps */}
      <div>
        <SectionTitle>Protocol Steps</SectionTitle>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <StepByStepProtocol
            experiment={experiment}
            settings={settings}
            rnpResult={rnpResult}
            masterMixes={masterMixes}
          />
        </div>
      </div>
    </div>
  );
}

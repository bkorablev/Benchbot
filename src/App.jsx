import { useState, useRef } from 'react';
import { TriangleAlert, Dna, TestTube2, Beaker } from 'lucide-react';
import ExperimentForm from './components/ExperimentForm';
import ProtocolPage from './components/ProtocolPage';
import PCRModule from './components/pcr/PCRModule';
import BufferModule from './components/buffer/BufferModule';
import { GUIDE_COLORS } from './data/constants';

const INITIAL_CRISPR_STATE = {
  cellLine: 'K562',
  system: 'Lonza 4D-Nucleofector',
  guides: [
    { id: 1, label: 'g1', name: '', sequence: '', color: GUIDE_COLORS[0], replicates: 3 },
  ],
  controls: {
    nonTargeting:    { enabled: true,  replicates: 2 },
    untransfected:   { enabled: true,  replicates: 2 },
    positiveControl: { enabled: false, replicates: 2 },
  },
  plateFormat: '96-well',
};

// ── Landing page ───────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'crispr',
    icon: Dna,
    title: 'CRISPR Editor',
    description: 'Generate RNP complex protocols, plate layouts, and step-by-step editing workflows',
  },
  {
    id: 'pcr',
    icon: TestTube2,
    title: 'PCR Protocol Generator',
    description: 'Calculate primer Tm, master mixes, and thermocycler programs for any set of reactions',
  },
  {
    id: 'buffer',
    icon: Beaker,
    title: 'Buffer Calculator',
    description: 'Calculate component volumes for any buffer using C₁V₁ = C₂V₂ with unit conversion',
  },
];

function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Logo + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 20 20" fill="white" className="w-7 h-7">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm-1 5a1 1 0 012 0v3a1 1 0 01-1 1H7a1 1 0 010-2h1V7zm1 7a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </div>
        <span className="text-4xl font-bold text-slate-900 tracking-tight">Benchbot</span>
      </div>

      {/* Tagline */}
      <p className="text-slate-500 text-lg mb-12">Your molecular biology bench assistant</p>

      {/* Tool cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl w-full">
        {TOOLS.map(({ id, icon: Icon, title, description }) => (
          <button
            key={id}
            onClick={() => onEnter(id)}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-left
                       hover:border-teal-400 hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-150 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
              <Icon size={20} className="text-teal-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeView,   setActiveView]   = useState('home');   // 'home' | 'tool'
  const [activeModule, setActiveModule] = useState('crispr');

  const enterTool = (moduleId) => {
    setActiveModule(moduleId);
    setActiveView('tool');
  };

  const goHome = () => setActiveView('home');

  // ── CRISPR state ────────────────────────────────────────────────────────────
  const [formState, setFormState]               = useState(INITIAL_CRISPR_STATE);
  const [generatedExperiment, setGeneratedExperiment] = useState(null);
  const [isDirty, setIsDirty]                   = useState(false);
  const protocolRef = useRef(null);

  const handleFormChange = (newState) => {
    setFormState(newState);
    if (generatedExperiment) setIsDirty(true);
  };

  const handleGenerate = () => {
    setGeneratedExperiment(JSON.parse(JSON.stringify(formState)));
    setIsDirty(false);
    setTimeout(() => protocolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const crisprStatusLabel = !generatedExperiment ? 'Setup' : isDirty ? 'Outdated' : 'Protocol ready';
  const crisprStatusColor = !generatedExperiment ? 'bg-slate-300' : isDirty ? 'bg-amber-400' : 'bg-teal-500';

  const modules = [
    { id: 'crispr', label: 'CRISPR Editor', icon: Dna       },
    { id: 'pcr',    label: 'PCR',           icon: TestTube2 },
    { id: 'buffer', label: 'Buffer Calc',   icon: Beaker    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Landing page — shown when activeView === 'home' */}
      {activeView === 'home' && <LandingPage onEnter={enterTool} />}

      {/* Tool shell — always mounted (preserves state), hidden when on home */}
      <div className={activeView === 'tool' ? '' : 'hidden'}>

        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-4">

            {/* Brand — clickable home link */}
            <button
              onClick={goHome}
              className="flex items-center gap-2 shrink-0 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm-1 5a1 1 0 012 0v3a1 1 0 01-1 1H7a1 1 0 010-2h1V7zm1 7a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors underline-offset-2 group-hover:underline">
                Benchbot
              </span>
            </button>

            {/* Module navigation */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {modules.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveModule(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    activeModule === id
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Right status (CRISPR only) */}
            <div className="ml-auto flex items-center gap-1.5">
              {activeModule === 'crispr' && (
                <>
                  <div className={`w-2 h-2 rounded-full transition-colors ${crisprStatusColor}`} />
                  <span className="text-xs text-slate-500">{crisprStatusLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CRISPR module (kept mounted to preserve state) */}
        <div className={activeModule === 'crispr' ? '' : 'hidden'}>
          <div className="px-4 py-8 space-y-8">
            <ExperimentForm
              value={formState}
              onChange={handleFormChange}
              onGenerate={handleGenerate}
              hasGenerated={!!generatedExperiment}
            />
            {generatedExperiment && (
              <>
                {isDirty && (
                  <div className="max-w-2xl mx-auto flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <TriangleAlert size={15} className="text-amber-500 shrink-0" />
                    <span>
                      Inputs changed — <strong>click Update Protocol</strong> to refresh the output below
                    </span>
                  </div>
                )}
                <div ref={protocolRef} className="scroll-mt-16">
                  <ProtocolPage experiment={generatedExperiment} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* PCR module (kept mounted to preserve state) */}
        <div className={activeModule === 'pcr' ? '' : 'hidden'}>
          <div className="px-4 py-8">
            <PCRModule />
          </div>
        </div>

        {/* Buffer module (kept mounted to preserve state) */}
        <div className={activeModule === 'buffer' ? '' : 'hidden'}>
          <div className="px-4 py-8">
            <BufferModule />
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { RecommendationCard, ProcessingStepper, OptionCard, ExplainabilityPanel, ConflictCard } from '../../components/ai/AIComponents.jsx';
import { MultideptBundleCard } from '../../components/charts/CorridorTimeline.jsx';
import { IconAI, IconRefresh, IconCheck, IconWarning, IconLayers, IconSparkles } from '../../components/icons/Icons.jsx';

export function AIPlanningWorkspace() {
  const {
    aiBundlingOptions,
    conflicts,
    aiProcessingStatus,
    triggerAiAnalysis,
    approveBundleOption,
    selectedOption,
    setSelectedOption,
    addToast
  } = useApp();

  const [simulating, setSimulating] = useState(false);

  const handleRunSimulation = () => {
    setSimulating(true);
    triggerAiAnalysis();
    setTimeout(() => {
      setSimulating(false);
      addToast('AI Simulation completed successfully. Strategies updated.', 'success');
    }, 1500);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  const handleApplyOption = (option) => {
    approveBundleOption(option);
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded">
                AI SCHEDULING SYSTEM
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <IconAI className="w-6 h-6 text-blue-700" />
              <span>Multi-Department Block Bundling & AI Conflict Solver</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Shadow block alignment engine for Civil, S&T, and Electrical Traction requests
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunSimulation}
              disabled={simulating || aiProcessingStatus.analyzing}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <IconSparkles className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Simulating Optimization...' : 'Re-Run Optimization'}</span>
            </button>
          </div>
        </div>

        {/* Workflow Stepper Bar */}
        <div className="pt-4">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            Optimization Workflow Status
          </h2>
          <ProcessingStepper currentStep={simulating ? 2 : 4} />
        </div>
      </div>

      {/* Top Main Strategy Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Options Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Generated Bundling Strategies</h2>
            <span className="text-xs text-slate-600 font-mono">
              {aiBundlingOptions.length} Strategies evaluated
            </span>
          </div>

          <div className="space-y-4">
            {aiBundlingOptions.map((opt, i) => (
              <OptionCard
                key={opt.id}
                option={opt}
                isSelected={selectedOption?.id === opt.id}
                onSelect={() => handleSelectOption(opt)}
                onApply={() => handleApplyOption(opt)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: AI Decision Explainability Panel */}
        <div className="space-y-6">
          <ExplainabilityPanel selectedOption={selectedOption} />
        </div>
      </div>

      {/* Cross-Departmental Bundled Shadow Blocks Grid */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Multi-Department Shadow Block Bundles
            </h2>
            <p className="text-xs text-slate-500">Synchronized maintenance windows sharing track possession</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-bold">
            3 Synchronized Corridors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultideptBundleCard
            bundleTitle="Corridor C1: NDLS - AGC (Tughlakabad - Palwal)"
            windowTime="11:30 - 15:00 (3.5h Possession)"
            departments={['Track Engineering', 'Signal & Telecom', 'Electrical TRD']}
            efficiencyScore="96%"
            passengerImpact="Zero Train Detentions (Shadow Window)"
          />
          <MultideptBundleCard
            bundleTitle="Corridor C2: HWH - BWN (Bandel - Burdwan)"
            windowTime="12:00 - 14:30 (2.5h Possession)"
            departments={['Track Engineering', 'Signal & Telecom']}
            efficiencyScore="91%"
            passengerImpact="1 Freight train rerouted via Loop line"
          />
        </div>
      </div>
    </div>
  );
}

export default AIPlanningWorkspace;

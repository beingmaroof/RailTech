import { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { IconCheck, IconConflict, IconWarning, IconAI, IconSpinner, IconInfo } from '../icons/Icons.jsx';
import { ProgressBar } from '../charts/SVGCharts.jsx';

// ---- RecommendationCard ----
export function RecommendationCard({ option, plan, onApply, onView, isRecommended = true }) {
  const opt = option || (plan?.options?.find(o => o.id === plan.recommendedOption)) || plan;

  if (!opt) return null;

  return (
    <div className="bg-white border-2 border-ir-navy-700/30 rounded-lg p-5 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-ir-blue-50 border border-ir-blue-200 text-ir-navy-700">
              <IconAI className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-ir-navy-800 uppercase tracking-wider">
              {isRecommended ? 'AI Top Recommended Strategy' : 'Optimization Option'}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ir-blue-50 text-ir-navy-900 border border-ir-blue-200">
              {opt.name || opt.id}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900">{opt.title || opt.name}</h3>
          <p className="text-xs text-slate-600 max-w-2xl">{opt.description || opt.explainability}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <div className="text-slate-600">
              Passenger Delay: <strong className="text-emerald-700 font-mono">{opt.delayImpact || '0 mins'}</strong>
            </div>
            <div className="text-slate-600">
              Efficiency Score: <strong className="text-ir-blue-700 font-mono">{opt.efficiencyScore || opt.score || '96%'}</strong>
            </div>
            <div className="text-slate-600">
              Corridor Slot: <strong className="text-slate-800 font-mono">{opt.windowTime || '11:30 - 15:00'}</strong>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
          <button
            onClick={() => onApply && onApply(opt)}
            className="px-4 py-2 bg-ir-navy-700 hover:bg-ir-navy-800 text-white font-bold rounded text-xs uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <IconCheck className="w-3.5 h-3.5" />
            <span>Apply AI Strategy</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AIRecommendationCard(props) {
  return <RecommendationCard {...props} />;
}

// ---- ProcessingStepper ----
export function ProcessingStepper({ steps, currentStep = 4, complete = true, onDone }) {
  const defaultSteps = [
    { title: 'Gathering Requests', desc: 'Civil, S&T, TRD requisitions ingested' },
    { title: 'Corridor Slot Matching', desc: 'Analyzing section timetables' },
    { title: 'Shadow Block Bundling', desc: 'Aligning concurrent track work' },
    { title: 'Optimization Complete', desc: '3 Strategies ready for review' },
  ];

  const activeSteps = steps || defaultSteps;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {activeSteps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum <= currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div
            key={step.title}
            className={`p-3 rounded-md border text-xs transition flex items-start gap-3 ${
              isCurrent
                ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                : isCompleted
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isCompleted
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isCompleted ? <IconCheck className="w-3.5 h-3.5" /> : stepNum}
            </div>
            <div>
              <div className="font-bold text-slate-900">{step.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AIProcessingStepper(props) {
  return <ProcessingStepper {...props} />;
}

// ---- OptionCard ----
export function OptionCard({ option, isSelected, onSelect, onApply }) {
  if (!option) return null;

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-lg border transition cursor-pointer relative ${
        isSelected
          ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
          : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {option.id || option.name}
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{option.name || option.title}</h4>
          </div>
          <p className="text-xs text-slate-600 mt-1">{option.description || option.explainability}</p>
        </div>

        {isSelected && (
          <span className="text-xs px-2.5 py-1 bg-blue-700 text-white font-bold rounded shrink-0">
            Selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase">Delay Impact</span>
          <span className="font-bold text-emerald-700 font-mono">{option.delayImpact || '0 mins'}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase">Efficiency Score</span>
          <span className="font-bold text-blue-700 font-mono">{option.efficiencyScore || '96%'}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase">Shadow Window</span>
          <span className="font-bold text-slate-800 font-mono">{option.windowTime || '11:30-15:00'}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply && onApply(option);
          }}
          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          Approve Strategy
        </button>
      </div>
    </div>
  );
}

export function AIOptionCard(props) {
  return <OptionCard {...props} />;
}

// ---- ExplainabilityPanel ----
export function ExplainabilityPanel({ selectedOption }) {
  const opt = selectedOption || {
    id: 'OPT-1',
    name: 'Strategy A: Max Shadow Bundling',
    explainability: 'Aligns Track Tamping with Signal Point Testing and TRD Overhead Catenary maintenance into a single 3.5h window.',
    reasons: [
      'Zero passenger train detentions: Fits precisely into the 12:00-14:30 non-peak timetable gap',
      'Resource Optimization: Shared track possession reduces total line block overhead by 66%',
      'Freight Regulation: Freight rakes held at loop lines without blocking main line signals',
    ],
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <IconInfo className="w-5 h-5 text-blue-700" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">AI Logic & Decision Rationale</h3>
      </div>

      <div className="space-y-3 text-xs text-slate-700">
        <div>
          <span className="font-bold text-slate-500 block uppercase text-[10px]">Active Strategy Rationale</span>
          <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
            {opt.explainability || opt.description}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <span className="font-bold text-slate-500 block uppercase text-[10px]">Key Optimization Drivers</span>
          {(opt.reasons || [
            'Zero train cancellation on high density corridor',
            'Cross-department track clearance synchronized',
            'Safety interlock verified for simultaneous work',
          ]).map((r, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              <IconCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-800 font-medium">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- ConflictCard ----
export function ConflictCard({ conflict }) {
  if (!conflict) return null;

  return (
    <div className="bg-red-50/60 border border-red-200 rounded-lg p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconWarning className="w-4 h-4 text-red-600" />
          <span className="font-bold text-xs text-red-800 uppercase tracking-wider">{conflict.severity || 'Conflict'}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
          {conflict.section || 'Corridor C1'}
        </span>
      </div>

      <p className="text-xs text-slate-900 font-bold">{conflict.message || conflict.title}</p>
      <p className="text-xs text-slate-600">{conflict.detail || conflict.description}</p>

      {conflict.recommendation && (
        <div className="mt-2 pt-2 border-t border-red-200 text-xs text-amber-800 flex items-center gap-1.5 font-medium">
          <IconAI className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span><strong>AI Fix:</strong> {conflict.recommendation}</span>
        </div>
      )}
    </div>
  );
}

export default RecommendationCard;

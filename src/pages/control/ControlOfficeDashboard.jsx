import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge.jsx';
import { Modal, ConfirmationDialog } from '../../components/common/Modal.jsx';
import {
  PASSENGER_TRAINS,
  GOODS_TRAINS,
  BLOCK_WINDOWS,
  GOODS_FORECAST,
  ASSET_AVAILABILITY,
  INITIAL_CONFLICTS,
  BEFORE_AFTER,
} from '../../data/demoData.js';
import {
  IconBlock,
  IconCheck,
  IconClose,
  IconWarning,
  IconClock,
  IconLayers,
  IconTrain,
  IconFilter,
  IconSearch,
  IconSparkles,
  IconRefresh,
  IconApprove,
  IconReject,
  IconEdit,
  IconAsset,
  IconChevronRight,
  IconChevronDown,
  IconInfo,
} from '../../components/icons/Icons.jsx';

// ── IR Palette constants (Strict match with Admin Dashboard & Indian Railways brand) ──
const IR = {
  navy:    '#0B1F3A',  // Deep Royal/Navy Blue
  blue:    '#123A8C',  // Primary Indian Railways Blue
  royal:   '#0056B3',  // Royal Blue accent
  lightbg: '#E8F1FF',  // Soft ice blue tint for highlight callouts
  palebg:  '#F2F6FC',  // Clean neutral light gray-blue for headers & alternating cells
  border:  '#D9E2EC',  // Professional crisp border
  text:    '#172B4D',  // Deep charcoal/navy text
  sub:     '#5E6C84',  // Neutral slate subtitle/caption text
  green:   '#16804B',  // Official Railway Green for approved/safe/high score
  amber:   '#D88900',  // Railway Alert Amber
  red:     '#C62828',  // Safety Red for conflicts/unadvisable
  yellow:  '#FDCC0D',  // Safety Gold / Yellow for badges/highlights
  bg:      '#F4F7FA',  // Clean background
};

// ── Reusable Section Header Component ──
function SectionHeader({ icon: Icon, title, subtitle, badge, accentColor }) {
  return (
    <div
      className="p-4 flex items-start justify-between gap-4 border-b"
      style={{ background: IR.palebg, borderColor: IR.border }}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: accentColor || IR.blue }} />}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>
            {title}
          </h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: IR.sub }}>{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span
          className="shrink-0 text-xs px-2.5 py-0.5 font-semibold rounded"
          style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.sub }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

const AI_STEPS = [
  'Reading Timetable & Train Headways',
  'Checking Corridor Capacity & Available Windows',
  'Evaluating Multi-Department Coordination Feasibility',
  'Scanning Train Path Conflicts & Delay Projections',
  'Assessing Freight & Goods Traffic Forecasts',
  'Calculating Asset Availability & Turnaround Impact',
  'Ranking Operational Block Windows',
  'Finalizing Block Recommendation Matrix',
];

const INITIAL_BLOCK_OPTIONS = [
  {
    id: 'OPT-A',
    label: 'Option A (Early Window)',
    corridor: 'C101',
    date: '2026-09-22',
    start: '10:00',
    end: '12:00',
    duration: 120,
    departments: ['Engineering'],
    activities: ['ENG-REQ-001 (Track Repair)'],
    conflictCount: 2,
    trainConflicts: ['TR102 (Shatabdi Express, 10:00–10:45)'],
    goodsForecast: 'Low',
    utilization: 50,
    suitabilityScore: 35,
    isBest: false,
    status: 'Not Advisable',
    reasons: [
      'Direct path overlap with Passenger Train TR102 (Shatabdi Express) scheduled 10:00–10:45',
      'Projected passenger delay of 45 minutes on trunk route C101',
      'Single-department requisition: wastes available cross-departmental coordination gap',
    ],
  },
  {
    id: 'OPT-B',
    label: 'Option B (Synchronized Shadow Window)',
    corridor: 'C101',
    date: '2026-09-22',
    start: '11:00',
    end: '13:00',
    duration: 120,
    departments: ['Engineering', 'Signal & Telecom', 'Traction'],
    activities: [
      'ENG-REQ-001 (Track Repair)',
      'SNT-REQ-001 (Point Machine Overhaul)',
      'TRD-REQ-001 (OHE Cantilever Inspection)',
    ],
    conflictCount: 0,
    trainConflicts: [],
    goodsForecast: 'Low (15% freight density)',
    utilization: 100,
    suitabilityScore: 95,
    isBest: true,
    status: 'Best Option',
    reasons: [
      'Zero passenger train conflicts: safely clears headway gap between TR102 (dep 10:45) & TR103 (arr 13:30)',
      'Full 3-Department Bundling (Civil + S&T + Electrical TRD) in single line possession',
      'Goods traffic forecast is Low: zero freight detention or bypass stabling required',
      '100% block utilization (120/120 min) with zero residual track possession waste',
      'Reduces total sectional line occupations from 3 down to 1 coordinated shadow block',
    ],
  },
  {
    id: 'OPT-C',
    label: 'Option C (Afternoon Slot)',
    corridor: 'C101',
    date: '2026-09-22',
    start: '16:00',
    end: '18:00',
    duration: 120,
    departments: ['Engineering', 'Signal & Telecom'],
    activities: ['ENG-REQ-001 (Track Repair)', 'SNT-REQ-001 (Point Machine Overhaul)'],
    conflictCount: 0,
    trainConflicts: [],
    goodsForecast: 'Low (25% freight density)',
    utilization: 75,
    suitabilityScore: 60,
    isBest: false,
    status: 'Advisable',
    reasons: [
      'Afternoon slot clears passenger pathing with no express train delays',
      'Traction department crew unavailable for this shift; OHE inspection must be postponed to next cycle',
      '25% of available window duration left unutilized',
    ],
  },
  {
    id: 'OPT-D',
    label: 'Option D (Night Maintenance Slot)',
    corridor: 'C101',
    date: '2026-09-22',
    start: '20:00',
    end: '22:00',
    duration: 120,
    departments: ['Engineering'],
    activities: ['ENG-REQ-001 (Track Repair)'],
    conflictCount: 0,
    trainConflicts: [],
    goodsForecast: 'Low',
    utilization: 60,
    suitabilityScore: 55,
    isBest: false,
    status: 'Advisable',
    reasons: [
      'Zero passenger conflicts during post-peak night operations',
      'Requires special floodlighting and night safety clearance protocols',
      'Leaves S&T and Traction unbundled, requiring independent possessions later',
    ],
  },
];

export function ControlOfficeDashboard() {
  const { requests, conflicts, approveRequest, rejectRequest, modifyRequest, addToast } = useApp();

  // State: Timetable Filters
  const [timetableDate, setTimetableDate] = useState('2026-09-22');
  const [corridorFilter, setCorridorFilter] = useState('All');
  const [trainTypeFilter, setTrainTypeFilter] = useState('All');
  const [searchTrain, setSearchTrain] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);

  // State: Pending Cases & Case Detail
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCaseDrawerOpen, setIsCaseDrawerOpen] = useState(false);

  // State: AI Planning Flow
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiStep, setAiStep] = useState(8);
  const [options, setOptions] = useState(INITIAL_BLOCK_OPTIONS);
  const [selectedOptionId, setSelectedOptionId] = useState('OPT-B');

  // State: Action Modals
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Train traffic priority during peak hours');
  const [rejectNotes, setRejectNotes] = useState('');

  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    startTime: '11:00',
    duration: '2',
    track: 'Both Lines (Up & Down)',
  });

  const pendingRequests = requests.filter((r) => r.status?.includes('Pending') || r.status?.includes('Review'));
  const approvedRequests = requests.filter((r) => r.status?.includes('Approved'));
  const selectedOption = options.find((o) => o.id === selectedOptionId) || options[1];

  // Auto-select first pending case on mount if none selected
  useEffect(() => {
    if (!selectedCase && requests.length > 0) {
      const firstPending = requests.find((r) => r.status?.includes('Pending')) || requests[0];
      setSelectedCase(firstPending);
    }
  }, [requests, selectedCase]);

  // Combined Trains List with Filtering
  const allTrains = [...PASSENGER_TRAINS, ...GOODS_TRAINS];
  const filteredTrains = allTrains.filter((train) => {
    const matchCorridor = corridorFilter === 'All' || train.corridor === corridorFilter;
    const matchType = trainTypeFilter === 'All' || train.type === trainTypeFilter;
    const matchSearch =
      !searchTrain ||
      train.id.toLowerCase().includes(searchTrain.toLowerCase()) ||
      train.name.toLowerCase().includes(searchTrain.toLowerCase());
    return matchCorridor && matchType && matchSearch;
  });

  // AI Generation Simulation Trigger
  const handleGenerateAIOptions = () => {
    setIsGeneratingAI(true);
    setAiStep(0);

    const interval = setInterval(() => {
      setAiStep((prev) => {
        if (prev >= AI_STEPS.length - 1) {
          clearInterval(interval);
          setIsGeneratingAI(false);
          addToast('AI Block Optimization Matrix Generated: 4 Options Evaluated', 'success');
          return AI_STEPS.length;
        }
        return prev + 1;
      });
    }, 260);
  };

  // Open Case Drawer
  const handleOpenCase = (req) => {
    setSelectedCase(req);
    setIsCaseDrawerOpen(true);
  };

  // Handle Approve Block Window
  const handleApproveConfirm = () => {
    if (selectedCase) {
      approveRequest(selectedCase.id);
      addToast(
        `Block Granted for ${selectedCase.id} on ${selectedCase.section || selectedOption.corridor} (${selectedOption.start}–${selectedOption.end})`,
        'success'
      );
    } else {
      addToast(`Block Window ${selectedOption.id} Granted for ${selectedOption.corridor}`, 'success');
    }
    setApprovalModalOpen(false);
  };

  // Handle Reject Block Window
  const handleRejectConfirm = () => {
    if (selectedCase) {
      rejectRequest(selectedCase.id, `${rejectReason}${rejectNotes ? ` — ${rejectNotes}` : ''}`);
      addToast(`Block Request ${selectedCase.id} REJECTED: ${rejectReason}`, 'warning');
    }
    setRejectModalOpen(false);
  };

  // Handle Modify Window Save
  const handleModifySave = (e) => {
    e.preventDefault();
    const durationHours = parseFloat(modifyForm.duration) || 2;
    const [h, m] = modifyForm.startTime.split(':').map(Number);
    const endH = (h + Math.floor(durationHours)) % 24;
    const endM = (m + Math.round((durationHours % 1) * 60)) % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    if (selectedCase) {
      modifyRequest(selectedCase.id, {
        requestedTime: modifyForm.startTime,
        durationHours: durationHours,
      });
    }

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === selectedOptionId) {
          return {
            ...opt,
            start: modifyForm.startTime,
            end: endTimeStr,
            duration: durationHours * 60,
            status: 'Modified Window',
            suitabilityScore: 88,
            reasons: [
              `Manual controller adjustment applied: Window shifted to ${modifyForm.startTime}–${endTimeStr}`,
              `Track possession scope set to: ${modifyForm.track}`,
              `Controller override active — verified with sectional headway table`,
            ],
          };
        }
        return opt;
      })
    );

    addToast(`Block Window modified to ${modifyForm.startTime}–${endTimeStr} (${durationHours}h)`, 'info');
    setModifyModalOpen(false);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  const kpiItems = [
    { label: 'Pending Requisitions', value: pendingRequests.length, sub: 'Requires action', valueColor: IR.amber, Icon: IconClock },
    { label: 'Active Line Conflicts', value: conflicts.length, sub: 'Timetable overlaps', valueColor: conflicts.length > 0 ? IR.red : IR.green, Icon: IconWarning },
    { label: 'Approved Blocks Today', value: approvedRequests.length, sub: 'Line possessions', valueColor: IR.green, Icon: IconCheck },
    { label: 'Punctuality Index', value: '94.6%', sub: 'Mainline preserved', valueColor: IR.navy, Icon: IconBlock },
  ];

  return (
    <div className="space-y-5 font-sans" style={{ color: IR.text }}>
      {/* ── 1. COMMAND HEADER & KPI STRIP ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        {/* Top IR Blue Gradient Accent Bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${IR.navy} 0%, ${IR.blue} 50%, ${IR.royal} 100%)` }} />

        <div className="p-5" style={{ borderBottom: `1px solid ${IR.border}` }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded"
                  style={{ background: IR.navy, color: IR.yellow }}
                >
                  Traffic Control Division
                </span>
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded"
                  style={{ background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }}
                >
                  Ministry of Railways
                </span>
                <span
                  className="px-2.5 py-0.5 text-[11px] font-semibold rounded"
                  style={{ background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }}
                >
                  ● Live Line Block Operations
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: IR.navy }}>
                Traffic Control Office — Operations &amp; Block Authorization
              </h1>
              <p className="text-xs mt-1" style={{ color: IR.sub }}>
                Divisional Section Controller Console · Granting engineering block possessions · Real-time train regulation
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <button
                onClick={handleGenerateAIOptions}
                disabled={isGeneratingAI}
                className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: IR.navy, color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = IR.blue)}
                onMouseLeave={(e) => (e.currentTarget.style.background = IR.navy)}
              >
                <IconSparkles className="w-4 h-4" style={{ color: IR.yellow }} />
                <span>{isGeneratingAI ? 'Simulating Optimization...' : 'Generate Block Options'}</span>
              </button>
              <div className="text-[11px]" style={{ color: IR.sub }}>{today}</div>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderTop: `1px solid ${IR.border}` }}
        >
          {kpiItems.map((k, i) => (
            <div
              key={k.label}
              className="p-4"
              style={{
                borderRight: i < kpiItems.length - 1 ? `1px solid ${IR.border}` : 'none',
                background: i % 2 === 0 ? 'white' : IR.palebg,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-tight" style={{ color: IR.sub }}>
                  {k.label}
                </span>
                <k.Icon className="w-3.5 h-3.5" style={{ color: k.valueColor }} />
              </div>
              <div className="text-2xl font-black" style={{ color: k.valueColor }}>{k.value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. DAILY MASTER TIMETABLE ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.blue }} />
        <div
          className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          <div className="flex items-center gap-2.5">
            <IconTrain className="w-4 h-4 shrink-0" style={{ color: IR.blue }} />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                Daily Master Timetable &amp; Train Movement Density
              </h2>
              <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                Live timetable slots across trunk routes · Click row to inspect train composition and speed restrictions
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={timetableDate}
              onChange={(e) => setTimetableDate(e.target.value)}
              className="px-2.5 py-1.5 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="2026-09-22">22 Sep 2026 (Today)</option>
              <option value="2026-09-23">23 Sep 2026 (Tomorrow)</option>
            </select>

            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="All">All Corridors</option>
              <option value="C101">Corridor C101</option>
              <option value="C102">Corridor C102</option>
              <option value="C103">Corridor C103</option>
              <option value="C104">Corridor C104</option>
            </select>

            <select
              value={trainTypeFilter}
              onChange={(e) => setTrainTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="All">All Types</option>
              <option value="Passenger">Passenger Express</option>
              <option value="Goods">Goods / Freight</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search train..."
                value={searchTrain}
                onChange={(e) => setSearchTrain(e.target.value)}
                className="pl-7 pr-2.5 py-1.5 rounded text-xs w-36 font-medium focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              />
              <IconSearch className="w-3.5 h-3.5 absolute left-2 top-2" style={{ color: IR.sub }} />
            </div>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10" style={{ background: IR.palebg }}>
              <tr className="border-b text-[11px] uppercase font-bold" style={{ borderColor: IR.border, color: IR.sub }}>
                <th className="p-3 border-r" style={{ borderColor: IR.border }}>Train No.</th>
                <th className="p-3 border-r" style={{ borderColor: IR.border }}>Train Name</th>
                <th className="p-3 border-r" style={{ borderColor: IR.border }}>Type</th>
                <th className="p-3 border-r text-center" style={{ borderColor: IR.border }}>Corridor</th>
                <th className="p-3 border-r text-center" style={{ borderColor: IR.border }}>Scheduled Slot</th>
                <th className="p-3 border-r text-center" style={{ borderColor: IR.border }}>Running Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: IR.border }}>
              {filteredTrains.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center font-medium" style={{ color: IR.sub }}>
                    No train movements match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTrains.map((train) => (
                  <tr
                    key={train.id}
                    onClick={() => setSelectedTrain(train)}
                    className="cursor-pointer transition-colors"
                    style={{ '--hover-bg': IR.palebg }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = IR.palebg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    <td className="p-3 font-mono font-bold border-r" style={{ borderColor: IR.border, color: IR.blue }}>
                      {train.id}
                    </td>
                    <td className="p-3 font-bold border-r" style={{ borderColor: IR.border, color: IR.text }}>
                      {train.name}
                    </td>
                    <td className="p-3 border-r" style={{ borderColor: IR.border }}>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                        style={
                          train.type === 'Passenger'
                            ? { background: IR.lightbg, color: IR.blue, borderColor: '#BFDBFE' }
                            : { background: '#FFFBEB', color: IR.amber, borderColor: '#FDE68A' }
                        }
                      >
                        {train.type}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold border-r" style={{ borderColor: IR.border, color: IR.text }}>
                      {train.corridor}
                    </td>
                    <td className="p-3 text-center font-mono border-r" style={{ borderColor: IR.border, color: IR.text }}>
                      {train.start} – {train.end}
                    </td>
                    <td className="p-3 text-center border-r" style={{ borderColor: IR.border }}>
                      <StatusBadge status={train.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrain(train);
                        }}
                        className="text-xs font-bold underline"
                        style={{ color: IR.blue }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. PENDING REQUISITIONS QUEUE ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.navy }} />
        <SectionHeader
          icon={IconLayers}
          title="Maintenance Requisition Queue — Pending Controller Action"
          subtitle="Departmental block requests requiring operational vetting and window alignment"
          badge={`${pendingRequests.length} Pending`}
          accentColor={IR.navy}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b text-[11px] uppercase font-bold" style={{ background: IR.palebg, borderColor: IR.border, color: IR.sub }}>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Case ID</th>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Department</th>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Work Scope &amp; Section</th>
                <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>Requested Window</th>
                <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>Priority</th>
                <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>Status</th>
                <th className="p-3.5 text-right">Operational Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: IR.border }}>
              {requests.map((req) => {
                const isSelected = selectedCase?.id === req.id;
                return (
                  <tr
                    key={req.id}
                    className="transition-colors"
                    style={{ background: isSelected ? IR.lightbg : 'white' }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = IR.palebg; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'white'; }}
                  >
                    <td className="p-3.5 font-mono font-bold border-r" style={{ borderColor: IR.border, color: IR.blue }}>
                      {req.id}
                    </td>
                    <td className="p-3.5 font-medium border-r" style={{ borderColor: IR.border, color: IR.text }}>
                      {req.department}
                    </td>
                    <td className="p-3.5 border-r" style={{ borderColor: IR.border }}>
                      <div className="font-bold" style={{ color: IR.text }}>{req.workType || req.title}</div>
                      <div className="text-[11px]" style={{ color: IR.sub }}>{req.section}</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r" style={{ borderColor: IR.border }}>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] border"
                        style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
                      >
                        {req.requestedTime || req.time} ({req.durationHours || req.duration}h)
                      </span>
                    </td>
                    <td className="p-3.5 text-center border-r" style={{ borderColor: IR.border }}>
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="p-3.5 text-center border-r" style={{ borderColor: IR.border }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenCase(req)}
                        className="px-3 py-1.5 rounded text-[11px] font-bold uppercase transition tracking-wider shadow-xs inline-flex items-center gap-1 cursor-pointer"
                        style={{ background: IR.blue, color: 'white' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = IR.navy)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = IR.blue)}
                      >
                        <span>View Case</span>
                        <IconChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. ASSET HEALTH & CORRIDOR READINESS ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.green }} />
        <SectionHeader
          icon={IconAsset}
          title="Asset Health &amp; Infrastructure Readiness"
          subtitle="Departmental infrastructure fitness & corridor line availability metrics (SCADA/TMS link)"
          badge="Live Feed"
          accentColor={IR.green}
        />

        <div className="p-5 space-y-4">
          {/* 3 Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Track Card */}
            <div
              className="rounded-lg p-4 border overflow-hidden relative"
              style={{ background: IR.palebg, borderColor: IR.border }}
            >
              <div style={{ height: 3, background: IR.blue, position: 'absolute', top: 0, left: 0, right: 0 }} />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                  Track Infrastructure
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ background: '#F0FDF4', color: IR.green, borderColor: '#BBF7D0' }}>
                  Fit for 130 km/h
                </span>
              </div>
              <div className="text-2xl font-black mt-2" style={{ color: IR.navy }}>94.2%</div>
              <p className="text-[11px] mt-1" style={{ color: IR.sub }}>
                Permanent way alignment, turnouts &amp; ballast packing intact
              </p>
            </div>

            {/* Signal Card */}
            <div
              className="rounded-lg p-4 border overflow-hidden relative"
              style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
            >
              <div style={{ height: 3, background: IR.green, position: 'absolute', top: 0, left: 0, right: 0 }} />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                  Signal &amp; Interlocking
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ background: '#F0FDF4', color: IR.green, borderColor: '#BBF7D0' }}>
                  Zero Critical Faults
                </span>
              </div>
              <div className="text-2xl font-black mt-2" style={{ color: IR.green }}>96.8%</div>
              <p className="text-[11px] mt-1" style={{ color: IR.sub }}>
                Solid state interlocking &amp; axle counters fully operational
              </p>
            </div>

            {/* Traction Card */}
            <div
              className="rounded-lg p-4 border overflow-hidden relative"
              style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
            >
              <div style={{ height: 3, background: IR.amber, position: 'absolute', top: 0, left: 0, right: 0 }} />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                  Traction (TRD / OHE)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ background: '#FFFBEB', color: IR.amber, borderColor: '#FDE68A' }}>
                  25 kV Tension Normal
                </span>
              </div>
              <div className="text-2xl font-black mt-2" style={{ color: IR.amber }}>91.5%</div>
              <p className="text-[11px] mt-1" style={{ color: IR.sub }}>
                Feeder breaker health 100% · Substation loads balanced
              </p>
            </div>
          </div>

          {/* Corridor Availability Breakdown Bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {Object.entries(ASSET_AVAILABILITY).map(([code, data]) => (
              <div
                key={code}
                className="p-3.5 rounded-md border"
                style={{ background: 'white', borderColor: IR.border }}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold" style={{ color: IR.text }}>{code} Availability</span>
                  <span className="font-mono font-bold" style={{ color: IR.navy }}>{data.current}%</span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: IR.palebg }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${data.current}%`,
                      background: data.current >= 90 ? IR.green : data.current >= 80 ? IR.blue : IR.amber,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1.5" style={{ color: IR.sub }}>
                  <span>Prev: {data.previous}%</span>
                  <span>Target: {data.expected}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. AI PLANNING INPUTS & STEPPER ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${IR.royal} 0%, ${IR.blue} 100%)` }} />
        <div
          className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b gap-3"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          <div className="flex items-center gap-2.5">
            <IconSparkles className="w-4 h-4 shrink-0" style={{ color: IR.blue }} />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                AI Block Optimization Engine — Operational Inputs
              </h2>
              <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                Multi-objective algorithm balancing punctuality, multi-departmental bundling, and track asset turnaround
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAIOptions}
            disabled={isGeneratingAI}
            className="px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ background: IR.blue, color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = IR.navy)}
            onMouseLeave={(e) => (e.currentTarget.style.background = IR.blue)}
          >
            <IconRefresh className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAI ? 'Processing...' : 'Re-Run AI Simulation'}</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Input Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded border text-center" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Input Requisitions</div>
              <div className="text-xl font-black mt-1" style={{ color: IR.navy }}>21 Tasks</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>Track, S&amp;T, TRD</div>
            </div>
            <div className="p-3.5 rounded border text-center" style={{ background: 'white', borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Evaluated Windows</div>
              <div className="text-xl font-black mt-1" style={{ color: IR.blue }}>15 Blocks</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>Day &amp; Night slots</div>
            </div>
            <div className="p-3.5 rounded border text-center" style={{ background: '#FFF5F5', borderColor: '#FECACA' }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.red }}>Active Overlaps</div>
              <div className="text-xl font-black mt-1" style={{ color: IR.red }}>3 Conflicts</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>Passenger pathing risks</div>
            </div>
            <div className="p-3.5 rounded border text-center" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.green }}>Bundling Capacity</div>
              <div className="text-xl font-black mt-1" style={{ color: IR.green }}>4 Coordinated</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>Tri-department matches</div>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="p-4 rounded-lg border" style={{ background: IR.palebg, borderColor: IR.border }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: IR.text }}>
                <span className="w-2 h-2 rounded-full" style={{ background: IR.blue }} />
                Optimization Engine Execution Pipeline
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: IR.sub }}>
                {isGeneratingAI ? `Step ${Math.min(aiStep + 1, 8)} of 8` : 'Pipeline Complete (8/8)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {AI_STEPS.map((step, idx) => {
                const isCompleted = aiStep > idx;
                const isCurrent = aiStep === idx && isGeneratingAI;

                return (
                  <div
                    key={step}
                    className="p-2.5 rounded border text-xs flex items-center gap-2 transition"
                    style={
                      isCompleted
                        ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: IR.green, fontWeight: 600 }
                        : isCurrent
                        ? { background: IR.lightbg, borderColor: '#93C5FD', color: IR.blue, fontWeight: 700 }
                        : { background: 'white', borderColor: IR.border, color: IR.sub }
                    }
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={
                        isCompleted
                          ? { background: IR.green, color: 'white' }
                          : isCurrent
                          ? { background: IR.blue, color: 'white' }
                          : { background: IR.palebg, color: IR.sub }
                      }
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className="truncate text-[11px]">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. EVALUATED BLOCK POSSESSION OPTIONS (4 CARDS) ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: IR.text }}>
              <span>Evaluated Block Possession Options</span>
              <span
                className="px-2 py-0.5 text-xs font-bold rounded"
                style={{ background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }}
              >
                4 Scenarios Analyzed
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
              Select an option to review comprehensive multi-department scheduling and proceed with controller authorization
            </p>
          </div>
          <span className="text-xs font-medium" style={{ color: IR.sub }}>Corridor C101 · Target Date: 2026-09-22</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className="rounded-lg p-4 shadow-sm flex flex-col justify-between transition cursor-pointer relative"
                style={{
                  background: isSelected
                    ? 'white'
                    : opt.isBest
                    ? '#FDFAF0'
                    : opt.status === 'Not Advisable'
                    ? '#FFFBFB'
                    : 'white',
                  border: isSelected
                    ? `2px solid ${IR.blue}`
                    : opt.isBest
                    ? `2px solid ${IR.yellow}`
                    : opt.status === 'Not Advisable'
                    ? '1px solid #FECACA'
                    : `1px solid ${IR.border}`,
                  boxShadow: isSelected ? '0 4px 12px rgba(18, 58, 140, 0.15)' : undefined,
                }}
              >
                {opt.isBest && (
                  <div
                    className="absolute -top-3 left-4 text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-xs tracking-wider"
                    style={{ background: IR.yellow, color: IR.navy }}
                  >
                    ★ RECOMMENDED BEST OPTION
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="font-mono font-bold text-xs" style={{ color: IR.blue }}>{opt.id}</span>
                    <StatusBadge status={opt.status} />
                  </div>

                  <h3 className="font-bold text-sm" style={{ color: IR.text }}>{opt.label}</h3>

                  <div
                    className="mt-2.5 p-2.5 rounded border text-xs space-y-1.5"
                    style={{
                      background: isSelected || opt.isBest ? IR.lightbg : IR.palebg,
                      borderColor: isSelected || opt.isBest ? '#BFDBFE' : IR.border,
                    }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: IR.sub }}>Window:</span>
                      <span className="font-mono font-bold" style={{ color: IR.text }}>
                        {opt.start} – {opt.end} ({opt.duration / 60}h)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: IR.sub }}>Corridor:</span>
                      <span className="font-bold" style={{ color: IR.text }}>{opt.corridor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: IR.sub }}>Utilization:</span>
                      <span className="font-bold" style={{ color: IR.text }}>{opt.utilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: IR.sub }}>Train Conflicts:</span>
                      <span
                        className="font-bold"
                        style={{ color: opt.conflictCount > 0 ? IR.red : IR.green }}
                      >
                        {opt.conflictCount > 0 ? `${opt.conflictCount} Conflict(s)` : '0 (None)'}
                      </span>
                    </div>
                  </div>

                  {/* Suitability Score Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-bold" style={{ color: IR.sub }}>Suitability Index</span>
                      <span className="font-mono font-black" style={{ color: IR.navy }}>{opt.suitabilityScore} / 100</span>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: IR.border }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${opt.suitabilityScore}%`,
                          background:
                            opt.suitabilityScore >= 85
                              ? IR.green
                              : opt.suitabilityScore >= 50
                              ? IR.blue
                              : IR.red,
                        }}
                      />
                    </div>
                  </div>

                  {/* Departments Included */}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.sub }}>
                      Bundled Departments ({opt.departments.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {opt.departments.map((dept) => (
                        <span
                          key={dept}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                          style={{ background: 'white', borderColor: IR.border, color: IR.text }}
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Why this Option Analysis */}
                  <div className="mt-3 pt-2.5 border-t" style={{ borderColor: IR.border }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.sub }}>
                      Operational Analysis:
                    </div>
                    <ul className="text-[11px] space-y-1 list-disc list-inside" style={{ color: IR.sub }}>
                      {opt.reasons.slice(0, 2).map((r, idx) => (
                        <li key={idx} className="leading-tight">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t" style={{ borderColor: IR.border }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOptionId(opt.id);
                    }}
                    className="w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                    style={
                      isSelected
                        ? { background: IR.navy, color: 'white' }
                        : opt.isBest
                        ? { background: IR.blue, color: 'white' }
                        : { background: IR.palebg, color: IR.text, border: `1px solid ${IR.border}` }
                    }
                  >
                    {isSelected ? '✓ Selected for Review' : 'Select Option'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. SELECTED OPTION REVIEW PANEL ── */}
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{ background: 'white', border: `2px solid ${IR.blue}` }}
      >
        <div style={{ height: 4, background: `linear-gradient(90deg, ${IR.navy} 0%, ${IR.blue} 100%)` }} />

        <div className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b gap-3" style={{ borderColor: IR.border }}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-2 py-0.5 text-[10px] font-black uppercase rounded"
                  style={{ background: IR.navy, color: IR.yellow }}
                >
                  Selected for Authorization
                </span>
                <span className="font-mono font-bold text-xs" style={{ color: IR.blue }}>{selectedOption.id}</span>
              </div>
              <h2 className="text-lg font-black tracking-tight" style={{ color: IR.navy }}>
                {selectedOption.label} — Window: {selectedOption.start} to {selectedOption.end} ({selectedOption.duration / 60}h)
              </h2>
              <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                Corridor {selectedOption.corridor} · Status:{' '}
                <strong style={{ color: IR.text }}>{selectedOption.status}</strong> · Suitability Score:{' '}
                <strong style={{ color: IR.blue }}>{selectedOption.suitabilityScore}/100</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setModifyModalOpen(true)}
                className="px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border"
                style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = IR.palebg)}
              >
                <IconEdit className="w-3.5 h-3.5" style={{ color: IR.sub }} />
                <span>Modify Window</span>
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border"
                style={{ background: '#FEF2F2', borderColor: '#FECACA', color: IR.red }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FEF2F2')}
              >
                <IconReject className="w-3.5 h-3.5" style={{ color: IR.red }} />
                <span>Decline / Reject</span>
              </button>
              <button
                onClick={() => setApprovalModalOpen(true)}
                className="px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition shadow flex items-center gap-1.5 cursor-pointer"
                style={{ background: IR.green, color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#126639')}
                onMouseLeave={(e) => (e.currentTarget.style.background = IR.green)}
              >
                <IconCheck className="w-4 h-4 text-white" />
                <span>Authorize &amp; Grant Block</span>
              </button>
            </div>
          </div>

          {/* Coordinated Requisition Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-md border" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Multi-Department Bundle</div>
              <div className="font-bold mt-1 text-sm" style={{ color: IR.navy }}>
                {selectedOption.departments.join(' + ')}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: IR.sub }}>
                Synchronized single line possession without duplicate track isolation
              </div>
            </div>

            <div className="p-3.5 rounded-md border" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Train Impact &amp; Conflicts</div>
              <div className="font-bold mt-1 text-sm" style={{ color: selectedOption.trainConflicts.length === 0 ? IR.green : IR.red }}>
                {selectedOption.trainConflicts.length === 0
                  ? 'Zero Passenger Train Conflicts'
                  : selectedOption.trainConflicts.join(', ')}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: IR.sub }}>
                Goods traffic forecast: {selectedOption.goodsForecast}
              </div>
            </div>

            <div className="p-3.5 rounded-md border" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Operational Efficiency</div>
              <div className="font-bold mt-1 text-sm" style={{ color: IR.green }}>
                {selectedOption.utilization}% Block Utilization
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: IR.sub }}>
                Punctuality preserved: 100% · Line occupancy minimized
              </div>
            </div>
          </div>

          {/* Reasons Checklist Box */}
          <div className="p-3.5 rounded-md border" style={{ background: IR.lightbg, borderColor: '#BFDBFE' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: IR.navy }}>
              Why Controller Should Approve This Window:
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs" style={{ color: IR.text }}>
              {selectedOption.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold shrink-0" style={{ color: IR.green }}>✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── 8. ACTIVE OPERATIONAL CONFLICTS PANEL ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.red }} />
        <SectionHeader
          icon={IconWarning}
          title="Active Operational Conflicts &amp; Interlocking Overlaps"
          subtitle="Safety and schedule conflicts identified across active corridors"
          badge={`${conflicts.length} Overlaps`}
          accentColor={IR.red}
        />

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className="p-3.5 rounded-md border flex flex-col justify-between text-xs"
                style={{ background: '#FFF5F5', borderColor: '#FECACA' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold" style={{ color: IR.red }}>{conf.id}</span>
                    <StatusBadge status={conf.severity || 'High'} />
                  </div>
                  <div className="font-bold" style={{ color: IR.text }}>{conf.title || conf.type}</div>
                  <p className="text-[11px] mt-1 leading-snug" style={{ color: IR.sub }}>
                    {conf.description || conf.message || 'Block window overlaps with scheduled high-density train movement.'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: '#FECACA', color: IR.sub }}>
                  <span>Corridor: {conf.corridor || 'C103'}</span>
                  <span className="font-bold" style={{ color: IR.red }}>Action Required</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {/* Train Details Modal */}
      <Modal
        open={Boolean(selectedTrain)}
        onClose={() => setSelectedTrain(null)}
        title={`Train Movement Inspection — ${selectedTrain?.id}`}
        size="md"
      >
        {selectedTrain && (
          <div className="space-y-4 text-xs font-sans" style={{ color: IR.text }}>
            <div className="p-3.5 rounded-md border" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="text-base font-bold" style={{ color: IR.navy }}>{selectedTrain.name}</div>
              <div className="mt-0.5" style={{ color: IR.sub }}>
                Type: <strong style={{ color: IR.text }}>{selectedTrain.type}</strong> · Corridor: <strong style={{ color: IR.text }}>{selectedTrain.corridor}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Scheduled Departure / Arrival</span>
                <div className="text-sm font-mono font-bold mt-1" style={{ color: IR.blue }}>
                  {selectedTrain.start} – {selectedTrain.end}
                </div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Current Movement Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedTrain.status} />
                </div>
              </div>
            </div>

            <div className="p-3 border rounded space-y-1" style={{ borderColor: IR.border }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Sectional Route Parameters</span>
              <div>Max Permissible Speed: <strong>130 km/h</strong></div>
              <div>Rake Composition: <strong>22 LHB Coaches</strong></div>
              <div>Locomotive: <strong>WAP-7 (Electric)</strong></div>
            </div>

            <div className="flex justify-end pt-3 border-t" style={{ borderColor: IR.border }}>
              <button
                onClick={() => setSelectedTrain(null)}
                className="px-4 py-2 rounded font-bold cursor-pointer border"
                style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Case Detail Modal / Drawer */}
      <Modal
        open={isCaseDrawerOpen}
        onClose={() => setIsCaseDrawerOpen(false)}
        title={`Requisition Details — ${selectedCase?.id}`}
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-4 text-xs font-sans" style={{ color: IR.text }}>
            <div
              className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ background: IR.palebg, borderColor: IR.border }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: IR.sub }}>
                  Requisition ID: {selectedCase.id}
                </span>
                <h3 className="text-base font-bold mt-0.5" style={{ color: IR.navy }}>
                  {selectedCase.workType || selectedCase.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                  Department: <strong style={{ color: IR.text }}>{selectedCase.department}</strong> · Section:{' '}
                  <strong style={{ color: IR.text }}>{selectedCase.section}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedCase.priority} />
                <StatusBadge status={selectedCase.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 border rounded" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Requested Time</span>
                <div className="font-mono font-bold text-sm mt-0.5" style={{ color: IR.navy }}>
                  {selectedCase.requestedTime || selectedCase.time}
                </div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Duration</span>
                <div className="font-mono font-bold text-sm mt-0.5" style={{ color: IR.navy }}>
                  {selectedCase.durationHours || selectedCase.duration} Hours
                </div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Track Possession</span>
                <div className="font-bold text-xs mt-0.5" style={{ color: IR.text }}>Up Main Line</div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>OHE Power Block</span>
                <div className="font-bold text-xs mt-0.5" style={{ color: IR.amber }}>Required (25 kV)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border space-y-2" style={{ borderColor: IR.border, background: 'white' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: IR.navy }}>
                Engineering Safety &amp; Worksite Logistics
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ color: IR.text }}>
                <div>• Machinery: <strong>BCM (Ballast Cleaning Machine) &amp; Duomatic Tamper</strong></div>
                <div>• Speed Restriction (SR): <strong>30 km/h caution imposed for 48h</strong></div>
                <div>• Staff / Gang Strength: <strong>24 Trackmen under SSE/P-Way</strong></div>
                <div>• Emergency Clear Time: <strong>15 minutes notice</strong></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: IR.border }}>
              <button
                onClick={() => setIsCaseDrawerOpen(false)}
                className="px-4 py-2 rounded font-bold text-xs border cursor-pointer"
                style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
              >
                Close Drawer
              </button>
              <button
                onClick={() => {
                  setIsCaseDrawerOpen(false);
                  handleGenerateAIOptions();
                }}
                className="px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow flex items-center gap-1.5 cursor-pointer"
                style={{ background: IR.navy, color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = IR.blue)}
                onMouseLeave={(e) => (e.currentTarget.style.background = IR.navy)}
              >
                <IconSparkles className="w-4 h-4" style={{ color: IR.yellow }} />
                <span>Evaluate AI Block Options for this Case</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Confirmation */}
      <ConfirmationDialog
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleApproveConfirm}
        title={`Authorize & Grant Block Window — ${selectedOption.id}`}
        message={`Are you sure you want to issue the Line Block Permit for Corridor ${selectedOption.corridor} between ${selectedOption.start} and ${selectedOption.end} (${selectedOption.duration / 60}h)? This will synchronize requisitions across ${selectedOption.departments.join(', ')}.`}
        confirmText="Authorize & Issue Permit"
        danger={false}
      />

      {/* Rejection Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Decline Block Window — ${selectedOption.id}`}
        size="md"
      >
        <div className="space-y-4 p-2 text-xs font-sans" style={{ color: IR.text }}>
          <p style={{ color: IR.sub }}>
            Specify the operational justification for declining this block requisition. The departmental field engineer will be alerted immediately.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              Decline Reason Category *
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="Train traffic priority during peak hours">Train traffic priority during peak hours</option>
              <option value="Insufficient safety margin between express trains">Insufficient safety margin between express trains</option>
              <option value="Conflicting VIP / Vande Bharat train movement">Conflicting VIP / Vande Bharat train movement</option>
              <option value="Heavy freight backlog on bypass loop lines">Heavy freight backlog on bypass loop lines</option>
              <option value="Traction / OHE crew shortage for isolation">Traction / OHE crew shortage for isolation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              Controller Remarks / Directives
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Resubmit for night window BW-009 or shift start time after 14:00..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="w-full p-2 rounded text-xs font-medium focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: IR.border }}>
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded font-bold border cursor-pointer"
              style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              className="px-4 py-2 rounded font-bold uppercase tracking-wider shadow cursor-pointer"
              style={{ background: IR.red, color: 'white' }}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* Modify Option Modal */}
      <Modal
        open={modifyModalOpen}
        onClose={() => setModifyModalOpen(false)}
        title={`Modify Block Window — ${selectedOption.id}`}
        size="md"
      >
        <form onSubmit={handleModifySave} className="space-y-4 p-2 text-xs font-sans" style={{ color: IR.text }}>
          <p style={{ color: IR.sub }}>
            Manually shift time or adjust track possession parameters. The AI algorithm will recalculate feasibility scores.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              New Start Time *
            </label>
            <input
              type="time"
              value={modifyForm.startTime}
              onChange={(e) => setModifyForm({ ...modifyForm, startTime: e.target.value })}
              className="w-full p-2 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              Duration (Hours) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="8"
              value={modifyForm.duration}
              onChange={(e) => setModifyForm({ ...modifyForm, duration: e.target.value })}
              className="w-full p-2 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              Track Possession Line *
            </label>
            <select
              value={modifyForm.track}
              onChange={(e) => setModifyForm({ ...modifyForm, track: e.target.value })}
              className="w-full p-2 rounded text-xs font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="Both Lines (Up & Down)">Both Lines (Up &amp; Down Simultaneous)</option>
              <option value="Up Main Line Only">Up Main Line Only</option>
              <option value="Down Main Line Only">Down Main Line Only</option>
              <option value="Loop Line / Siding">Loop Line / Siding</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: IR.border }}>
            <button
              type="button"
              onClick={() => setModifyModalOpen(false)}
              className="px-4 py-2 rounded font-bold border cursor-pointer"
              style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-bold uppercase tracking-wider shadow cursor-pointer"
              style={{ background: IR.blue, color: 'white' }}
            >
              Save &amp; Recalculate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ControlOfficeDashboard;

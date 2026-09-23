import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge.jsx';
import { Modal, ConfirmationDialog } from '../../components/common/Modal.jsx';
import { assetService } from '../../services/assetService.js';
import { engineeringService } from '../../services/engineeringService.js';
import {
  IconMaintenance,
  IconPlus,
  IconCheck,
  IconClock,
  IconWarning,
  IconLayers,
  IconTrain,
  IconAsset,
  IconSparkles,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconChevronRight,
  IconChevronDown,
  IconClose,
  IconInfo,
  IconUser,
  IconCalendar,
} from '../../components/icons/Icons.jsx';

// ── IR Palette constants (matching Admin & Control Office dashboards) ──
const IR = {
  navy: '#0B1F3A',  // Deep Royal / Navy Blue
  blue: '#123A8C',  // Primary Indian Railways Blue
  royal: '#0056B3',  // Royal Blue accent
  lightbg: '#E8F1FF',  // Soft ice blue tint for highlight callouts
  palebg: '#F2F6FC',  // Clean neutral light gray-blue for headers & alternating cells
  border: '#D9E2EC',  // Professional crisp border
  text: '#172B4D',  // Deep charcoal/navy text
  sub: '#5E6C84',  // Neutral slate subtitle/caption text
  green: '#16804B',  // Official Railway Green for approved/safe/high score
  amber: '#D88900',  // Railway Alert Amber
  red: '#C62828',  // Safety Red for conflicts/unadvisable
  yellow: '#FDCC0D',  // Safety Gold / Yellow for badges/highlights
  bg: '#F4F7FA',  // Clean background
};

// ── Workflow Steps Definition ──
const WORKFLOW_STEPS = [
  'REQUEST CREATED',
  'PENDING REVIEW',
  'AI ANALYSIS',
  'ASSIGNED',
  'SCHEDULED',
  'IN PROGRESS',
  'COMPLETED',
];

export function EngineeringDashboard() {
  const { user } = useAuth();
  const { requests, submitRequest, startWork, endWork, corridors, addToast } = useApp();

  // Active Tab: 'pending' | 'in_progress' | 'completed' | 'all'
  const [activeTab, setActiveTab] = useState('pending');

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [corridorFilter, setCorridorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawers and Modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [endConfirmDialog, setEndConfirmDialog] = useState({ open: false, task: null });
  const [showAssetRoster, setShowAssetRoster] = useState(false);

  // New Maintenance Request Form State
  const [formState, setFormState] = useState({
    asset: 'Track 1 (Up Main Line)',
    trackNumber: 'Track 1',
    corridor: 'C101',
    kmPost: 'Km 45/2',
    maintenanceType: 'Track Repair',
    workDescription: '',
    priority: 'High',
    requestedDate: new Date().toISOString().split('T')[0],
    preferredTime: '11:00',
    durationHours: '2.0',
    requiredBlock: 'AI Recommended',
    staffCount: '14',
    machineryNeeded: 'Duomatic Tamping Machine (CSU-09)',
    technicalDetails: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter Engineering requests
  const engRequests = useMemo(() => {
    return requests.filter((r) => {
      const dept = (r.department || '').toLowerCase();
      return dept.includes('engineering') || dept.includes('civil') || dept.includes('track');
    });
  }, [requests]);

  // Assigned Work (Tasks specifically assigned to Engineering user / staff)
  const assignedTasks = useMemo(() => {
    return engRequests.filter((r) => {
      const status = r.status || '';
      return status === 'Scheduled' || status === 'In Progress' || status === 'Assigned';
    });
  }, [engRequests]);

  // Tabbed requests
  const filteredRequests = useMemo(() => {
    return engRequests.filter((r) => {
      // Tab filter
      const st = (r.status || '').toLowerCase();
      if (activeTab === 'pending') {
        if (!st.includes('pending') && !st.includes('review') && !st.includes('ai') && !st.includes('submitted')) {
          return false;
        }
      } else if (activeTab === 'in_progress') {
        if (!st.includes('progress')) return false;
      } else if (activeTab === 'completed') {
        if (!st.includes('completed')) return false;
      }

      // Priority filter
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;

      // Corridor filter
      if (corridorFilter !== 'All') {
        const loc = (r.location || r.section || r.asset || '').toUpperCase();
        if (!loc.includes(corridorFilter.toUpperCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (r.id || '').toLowerCase().includes(q);
        const descMatch = (r.workType || r.description || r.title || '').toLowerCase().includes(q);
        const locMatch = (r.location || r.section || '').toLowerCase().includes(q);
        if (!idMatch && !descMatch && !locMatch) return false;
      }

      return true;
    });
  }, [engRequests, activeTab, priorityFilter, corridorFilter, searchQuery]);

  // KPI Counts
  const kpiData = useMemo(() => {
    const assigned = assignedTasks.length;
    const pending = engRequests.filter((r) => (r.status || '').includes('Pending') || (r.status || '').includes('Review')).length;
    const critical = engRequests.filter((r) => r.priority === 'Critical').length;
    const inProgress = engRequests.filter((r) => (r.status || '').includes('Progress')).length;
    const completed = engRequests.filter((r) => (r.status || '').includes('Completed')).length;
    const assetSummary = assetService.getSummary();

    return {
      assigned,
      pending,
      critical,
      inProgress,
      completed,
      assetAvailability: `${assetSummary.trackAvailability}% Track Fit`,
    };
  }, [engRequests, assignedTasks]);

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate and Submit New Request
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!formState.workDescription.trim() || formState.workDescription.trim().length < 8) {
      errors.workDescription = 'Please provide a detailed scope (at least 8 characters).';
    }
    if (!formState.requestedDate) {
      errors.requestedDate = 'Valid date is required.';
    }
    if (!formState.preferredTime) {
      errors.preferredTime = 'Start time is required.';
    }
    const dur = parseFloat(formState.durationHours);
    if (isNaN(dur) || dur < 0.5 || dur > 12) {
      errors.durationHours = 'Duration must be between 0.5 and 12 hours.';
    }
    const staff = parseInt(formState.staffCount, 10);
    if (isNaN(staff) || staff < 1 || staff > 100) {
      errors.staffCount = 'Staff count must be between 1 and 100.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // AI Prioritization calculation (Section 37 formula)
    const aiPriority = engineeringService.calculatePriorityScore({
      priority: formState.priority,
      maintenanceType: formState.maintenanceType,
      durationHours: formState.durationHours,
    });

    const newReqPayload = {
      asset: `${formState.asset} (${formState.corridor})`,
      trackNumber: formState.trackNumber,
      location: `${formState.corridor} — ${formState.kmPost}`,
      section: `${formState.corridor} — ${formState.kmPost}`,
      maintenanceType: formState.maintenanceType,
      workDescription: formState.workDescription,
      priority: formState.priority,
      priorityScore: aiPriority.score,
      requestedDate: formState.requestedDate,
      preferredTime: formState.preferredTime,
      durationHours: formState.durationHours,
      duration: Math.round(parseFloat(formState.durationHours) * 60),
      requiredBlock: formState.requiredBlock,
      staffCount: formState.staffCount,
      machinery: formState.machineryNeeded,
      technicalDetails: formState.technicalDetails,
      department: 'Engineering',
      status: 'Pending Review',
      assignedEmployee: 'Rahul Sharma',
      employeeId: 'ENG-1042',
      assignedRole: 'Track Engineer',
      assignedBy: 'Control Office',
    };

    submitRequest(newReqPayload);
    setCreateModalOpen(false);
    setActiveTab('pending');

    // Reset Form
    setFormState({
      asset: 'Track 1 (Up Main Line)',
      trackNumber: 'Track 1',
      corridor: 'C101',
      kmPost: 'Km 45/2',
      maintenanceType: 'Track Repair',
      workDescription: '',
      priority: 'High',
      requestedDate: new Date().toISOString().split('T')[0],
      preferredTime: '11:00',
      durationHours: '2.0',
      requiredBlock: 'AI Recommended',
      staffCount: '14',
      machineryNeeded: 'Duomatic Tamping Machine (CSU-09)',
      technicalDetails: '',
    });
  };

  // Open Task Drawer
  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  // Action: Start Work
  const handleStartWork = (taskId) => {
    startWork(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => ({
        ...prev,
        status: 'In Progress',
        startedAt: new Date().toISOString(),
      }));
    }
  };

  // Action: Prompt End Work
  const handlePromptEndWork = (task) => {
    setEndConfirmDialog({ open: true, task });
  };

  // Action: Confirm End Work
  const handleConfirmEndWork = () => {
    if (endConfirmDialog.task) {
      endWork(endConfirmDialog.task.id);
      if (selectedTask?.id === endConfirmDialog.task.id) {
        setSelectedTask((prev) => ({
          ...prev,
          status: 'Completed',
          completedAt: new Date().toISOString(),
        }));
      }
    }
    setEndConfirmDialog({ open: false, task: null });
  };

  const assetSummary = assetService.getSummary();
  const trackAssets = assetService.getTrackAssets();
  const machineryAssets = assetService.getMachineryAssets();
  const staffResources = assetService.getStaffResources();

  // Resource check for the selected task
  const taskResourceCheck = selectedTask ? assetService.checkResourceReadiness(selectedTask) : null;

  return (
    <div className="space-y-5 font-sans" style={{ color: IR.text }}>
      {/* ── 1. COMMAND HEADER ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${IR.navy} 0%, ${IR.blue} 50%, ${IR.royal} 100%)` }} />

        <div className="p-5" style={{ borderBottom: `1px solid ${IR.border}` }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded"
                  style={{ background: IR.navy, color: IR.yellow }}
                >
                  Track Maintenance Division
                </span>
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded"
                  style={{ background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }}
                >
                  Civil Engineering Wing
                </span>
                <span
                  className="px-2 py-0.5 text-[11px] font-semibold rounded"
                  style={{ background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }}
                >
                  ● Field Operations Ready
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: IR.navy }}>
                Track Maintenance Portal
              </h1>
              <p className="text-xs mt-1" style={{ color: IR.sub }}>
                Track maintenance requests, assigned work and asset availability. · Logged in: <strong style={{ color: IR.text }}>{user?.name || 'Priya Sharma'}</strong> ({user?.designation || 'Senior Track Engineer'})
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow flex items-center gap-2 cursor-pointer"
                style={{ background: IR.navy, color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = IR.blue)}
                onMouseLeave={(e) => (e.currentTarget.style.background = IR.navy)}
              >
                <IconPlus className="w-4 h-4" style={{ color: IR.yellow }} />
                <span>+ New Maintenance Request</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. 6 WORKFLOW KPI CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" style={{ borderTop: `1px solid ${IR.border}` }}>
          {[
            { label: 'Assigned Work', value: kpiData.assigned, sub: 'Allocated tasks', color: IR.navy, Icon: IconMaintenance },
            { label: 'Pending Requests', value: kpiData.pending, sub: 'Awaiting scheduling', color: IR.amber, Icon: IconClock },
            { label: 'Critical Requests', value: kpiData.critical, sub: 'Safety priority', color: IR.red, Icon: IconWarning },
            { label: 'In Progress', value: kpiData.inProgress, sub: 'Active track jobs', color: IR.blue, Icon: IconRefresh },
            { label: 'Completed Work', value: kpiData.completed, sub: 'Verified log', color: IR.green, Icon: IconCheck },
            { label: 'Asset Availability', value: kpiData.assetAvailability, sub: 'Readiness index', color: IR.royal, Icon: IconAsset },
          ].map((k, i) => (
            <div
              key={k.label}
              className="p-3.5"
              style={{
                borderRight: i < 5 ? `1px solid ${IR.border}` : 'none',
                background: i % 2 === 0 ? 'white' : IR.palebg,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-tight" style={{ color: IR.sub }}>
                  {k.label}
                </span>
                <k.Icon className="w-3.5 h-3.5" style={{ color: k.color }} />
              </div>
              <div className="text-xl font-black" style={{ color: k.color }}>
                {k.value}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. ASSIGNED WORK (PRIMARY SECTION) ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.blue }} />
        <div
          className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          <div className="flex items-center gap-2.5">
            <IconMaintenance className="w-4 h-4 shrink-0" style={{ color: IR.blue }} />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                My Assigned Track Maintenance Work
              </h2>
              <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                Work orders allocated by Traffic Control Office requiring execution &amp; resource readiness verification
              </p>
            </div>
          </div>
          <span
            className="text-xs px-2.5 py-0.5 font-bold rounded shrink-0"
            style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.blue }}
          >
            {assignedTasks.length} Active Orders
          </span>
        </div>

        <div className="p-5">
          {assignedTasks.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed text-xs" style={{ borderColor: IR.border, color: IR.sub }}>
              No active assigned track work currently allocated to this profile.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {assignedTasks.map((task) => {
                const readiness = assetService.checkResourceReadiness(task);
                const isScheduled = task.status === 'Scheduled';
                const isInProgress = task.status === 'In Progress';
                const isCompleted = task.status === 'Completed';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task)}
                    className="rounded-lg p-4 border transition cursor-pointer flex flex-col justify-between"
                    style={{
                      background: isInProgress ? '#FBFDFF' : 'white',
                      borderColor: isInProgress ? IR.blue : IR.border,
                      boxShadow: isInProgress ? '0 2px 8px rgba(18, 58, 140, 0.08)' : undefined,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = IR.navy)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = isInProgress ? IR.blue : IR.border)}
                  >
                    <div>
                      {/* Top bar: ID & Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs" style={{ color: IR.blue }}>{task.id}</span>
                        <StatusBadge status={task.status} />
                      </div>

                      {/* Work Type & Description */}
                      <h3 className="font-bold text-sm" style={{ color: IR.text }}>
                        {task.maintenanceType || task.workType || task.title}
                      </h3>
                      <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: IR.sub }}>
                        {task.description || task.workDescription}
                      </p>

                      {/* Track Details Strip (Section 15) */}
                      <div className="mt-3 p-2.5 rounded border text-xs space-y-1.5" style={{ background: IR.palebg, borderColor: IR.border }}>
                        <div className="flex justify-between">
                          <span style={{ color: IR.sub }}>Track:</span>
                          <span className="font-bold" style={{ color: IR.text }}>{task.trackNumber || 'Track 1 (Up Main)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: IR.sub }}>Location:</span>
                          <span className="font-bold" style={{ color: IR.text }}>{task.location || task.section || 'C101 Km 45/2'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: IR.sub }}>Scheduled Timing:</span>
                          <span className="font-mono font-bold" style={{ color: IR.navy }}>
                            {task.preferredTime || task.requestedTime || '14:00'} ({task.duration ? `${task.duration}m` : '2h'})
                          </span>
                        </div>
                        {task.startedAt && (
                          <div className="flex justify-between pt-1 border-t" style={{ borderColor: IR.border }}>
                            <span style={{ color: IR.sub }}>Started At:</span>
                            <span className="font-mono font-bold text-emerald-800">
                              {new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Resource Readiness & Assigned To Summary (Section 14 & 31) */}
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span
                          className="px-2 py-0.5 rounded font-bold border inline-flex items-center gap-1"
                          style={{
                            background: readiness.isReady ? '#F0FDF4' : '#FFFBEB',
                            borderColor: readiness.isReady ? '#BBF7D0' : '#FDE68A',
                            color: readiness.isReady ? IR.green : IR.amber,
                          }}
                        >
                          <span>{readiness.isReady ? '✓' : '⚠'}</span>
                          <span>{readiness.overall}</span>
                        </span>

                        <span className="text-[10px]" style={{ color: IR.sub }}>
                          Assigned: <strong>{task.assignedEmployee || 'Priya Sharma'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Controls (Section 25 & 32) */}
                    <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: IR.border }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTask(task);
                        }}
                        className="text-xs font-bold underline"
                        style={{ color: IR.blue }}
                      >
                        Inspect Details
                      </button>

                      {isScheduled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWork(task.id);
                          }}
                          className="px-3.5 py-1.5 rounded text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          style={{ background: IR.green, color: 'white' }}
                        >
                          <span>START</span>
                          <IconChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptEndWork(task);
                          }}
                          className="px-3.5 py-1.5 rounded text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          style={{ background: IR.red, color: 'white' }}
                        >
                          <span>END WORK</span>
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Finished</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. MAINTENANCE REQUISITION TABS & MAIN TABLE ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.navy }} />

        {/* Tab Headers */}
        <div
          className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          {/* Tabs: [ Pending ] [ In Progress ] [ Completed ] [ All ] */}
          <div className="flex items-center gap-2">
            {[
              { id: 'pending', label: 'Pending Requests' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed Work' },
              { id: 'all', label: 'All Requests' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer"
                style={
                  activeTab === t.id
                    ? { background: IR.navy, color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                    : { background: 'white', color: IR.sub, border: `1px solid ${IR.border}` }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded font-semibold focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            >
              <option value="All">All Corridors</option>
              <option value="C101">C101</option>
              <option value="C102">C102</option>
              <option value="C103">C103</option>
              <option value="C104">C104</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-2.5 py-1.5 rounded text-xs w-36 font-medium focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              />
              <IconSearch className="w-3.5 h-3.5 absolute left-2 top-2" style={{ color: IR.sub }} />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b text-[11px] uppercase font-bold" style={{ background: IR.palebg, borderColor: IR.border, color: IR.sub }}>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Request ID</th>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Work Description &amp; Scope</th>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Track / Asset</th>
                <th className="p-3.5 border-r" style={{ borderColor: IR.border }}>Location</th>
                <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>Timing &amp; Duration</th>
                <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>Priority &amp; Score</th>
                <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: IR.border }}>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center font-medium" style={{ color: IR.sub }}>
                    No maintenance records found matching the active criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const score = req.priorityScore || (req.priority === 'Critical' ? 92 : req.priority === 'High' ? 84 : req.priority === 'Medium' ? 61 : 35);
                  return (
                    <tr
                      key={req.id}
                      onClick={() => handleOpenTask(req)}
                      className="transition-colors cursor-pointer"
                      style={{ background: 'white' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = IR.palebg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      <td className="p-3.5 font-mono font-bold border-r" style={{ borderColor: IR.border, color: IR.blue }}>
                        {req.id}
                      </td>
                      <td className="p-3.5 font-bold border-r" style={{ borderColor: IR.border, color: IR.text }}>
                        <div>{req.workType || req.title}</div>
                        <div className="text-[11px] font-normal" style={{ color: IR.sub }}>{req.maintenanceType}</div>
                      </td>
                      <td className="p-3.5 border-r" style={{ borderColor: IR.border, color: IR.text }}>
                        {req.trackNumber || req.asset || 'Track 1'}
                      </td>
                      <td className="p-3.5 border-r" style={{ borderColor: IR.border, color: IR.text }}>
                        {req.location || req.section}
                      </td>
                      <td className="p-3.5 text-center font-mono border-r" style={{ borderColor: IR.border }}>
                        <span className="px-2 py-0.5 rounded text-[11px] border" style={{ background: IR.palebg, borderColor: IR.border }}>
                          {req.preferredTime || req.requestedTime || '11:00'} ({req.durationHours || (req.duration ? req.duration / 60 : 2)}h)
                        </span>
                      </td>
                      {/* Priority Level AND Priority Score (Section 21) */}
                      <td className="p-3.5 text-center border-r" style={{ borderColor: IR.border }}>
                        <div className="flex flex-col items-center">
                          <PriorityBadge priority={req.priority} />
                          <span className="font-mono text-[10px] font-bold mt-1" style={{ color: IR.navy }}>
                            {score} / 100
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center border-r" style={{ borderColor: IR.border }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTask(req);
                          }}
                          className="text-xs font-bold underline"
                          style={{ color: IR.blue }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. ASSET AVAILABILITY (SUMMARY + EXPANDABLE DETAILS) ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.green }} />
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          <div className="flex items-center gap-2.5">
            <IconAsset className="w-4 h-4 shrink-0" style={{ color: IR.green }} />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                Track &amp; Machinery Asset Availability Roster
              </h2>
              <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                Real-time equipment fitness, sectional gang availability, and track fitness indicators
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAssetRoster(!showAssetRoster)}
            className="text-xs font-bold underline cursor-pointer"
            style={{ color: IR.blue }}
          >
            {showAssetRoster ? '▲ Hide Full Details' : '▼ View Full Details'}
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary Cards (Section 24A) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border text-center" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Track Availability</div>
              <div className="text-2xl font-black mt-1" style={{ color: IR.navy }}>{assetSummary.trackAvailability}%</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>{assetSummary.counts.tracksAvailable}/{assetSummary.counts.tracksTotal} Lines Clear</div>
            </div>

            <div className="p-3.5 rounded-lg border text-center" style={{ background: 'white', borderColor: IR.border }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Machinery Availability</div>
              <div className="text-2xl font-black mt-1" style={{ color: IR.blue }}>{assetSummary.machineryAvailability}%</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>{assetSummary.counts.machineryAvailable}/{assetSummary.counts.machineryTotal} Rigs Operational</div>
            </div>

            <div className="p-3.5 rounded-lg border text-center" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.green }}>Staff Gang Readiness</div>
              <div className="text-2xl font-black mt-1" style={{ color: IR.green }}>{assetSummary.staffAvailability}%</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>{assetSummary.counts.staffAvailable} Trackmen on Duty</div>
            </div>

            <div className="p-3.5 rounded-lg border text-center" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: IR.green }}>Overall Resource Readiness</div>
              <div className="text-xl font-black mt-1.5" style={{ color: IR.green }}>READY TO START</div>
              <div className="text-[10px] mt-0.5" style={{ color: IR.sub }}>Section C101 Verified</div>
            </div>
          </div>

          {/* Expandable Details (Section 24B) */}
          {showAssetRoster && (
            <div className="pt-3 border-t space-y-4" style={{ borderColor: IR.border }}>
              {/* Track Roster */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: IR.navy }}>
                  Permanent Way Track Health
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {trackAssets.slice(0, 3).map((trk) => (
                    <div key={trk.id} className="p-3 rounded border text-xs" style={{ background: 'white', borderColor: IR.border }}>
                      <div className="flex justify-between font-bold">
                        <span style={{ color: IR.text }}>{trk.name}</span>
                        <span style={{ color: trk.status === 'Available' ? IR.green : IR.amber }}>{trk.status}</span>
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: IR.sub }}>Section: {trk.section}</div>
                      <div className="text-[11px]" style={{ color: IR.sub }}>Speed Fit: <strong>{trk.speedFit}</strong> · Ballast: <strong>{trk.ballastHealth}</strong></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Machinery Roster */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: IR.navy }}>
                  Heavy Track Machine Fleet
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {machineryAssets.slice(0, 3).map((mch) => (
                    <div key={mch.id} className="p-3 rounded border text-xs" style={{ background: 'white', borderColor: IR.border }}>
                      <div className="flex justify-between font-bold">
                        <span style={{ color: IR.text }}>{mch.name}</span>
                        <span style={{ color: mch.status === 'Available' ? IR.green : IR.amber }}>{mch.status}</span>
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: IR.sub }}>Depot: {mch.baseDepot} · Operator: {mch.operator}</div>
                      <div className="text-[11px]" style={{ color: IR.sub }}>Fuel/Battery Level: <strong>{mch.fuelLevel}</strong></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. AI RECOMMENDATIONS PANEL FOR ENGINEERING ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.royal }} />
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          <div className="flex items-center gap-2.5">
            <IconSparkles className="w-4 h-4 shrink-0" style={{ color: IR.royal }} />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                AI Decision-Support Recommendations for Engineering
              </h2>
              <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                Optimal corridor shadow window suggestions derived from passenger timetables and multi-department syncing
              </p>
            </div>
          </div>
          <span
            className="text-xs px-2.5 py-0.5 font-bold rounded"
            style={{ background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }}
          >
            Engineering Advisory
          </span>
        </div>

        <div className="p-5">
          <div className="p-4 rounded-lg border" style={{ background: IR.lightbg, borderColor: '#BFDBFE' }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border" style={{ background: 'white', borderColor: '#BFDBFE', color: IR.blue }}>
                  Corridor C101 • Recommended Shadow Window
                </span>
                <h3 className="text-base font-black mt-1" style={{ color: IR.navy }}>
                  11:00 – 13:00 Window (Duration: 120 mins)
                </h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: IR.text }}>
                  AI Scheduling Engine identified a clean 120-minute gap on Track 1 (C101). Bundling Track Joint Repair with S&amp;T point tests and Traction OHE inspection eliminates independent line occupations.
                </p>
                <div className="mt-2 text-xs flex flex-wrap gap-3 font-semibold" style={{ color: IR.navy }}>
                  <span>✓ 0 Passenger Train Conflicts</span>
                  <span>✓ Goods Forecast: Low</span>
                  <span>✓ Multi-department Bundle: Civil + S&amp;T + TRD</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t text-[11px] flex items-center gap-1.5" style={{ borderColor: '#BFDBFE', color: IR.blue }}>
              <IconInfo className="w-3.5 h-3.5 shrink-0" />
              <span>Engineering users can view recommendations. Operational block authorization remains strictly with Control Office.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. TASK DETAILS DRAWER (SIDE DRAWER) ── */}
      <Modal
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Task Inspection — ${selectedTask?.id || ''}`}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4 text-xs font-sans" style={{ color: IR.text }}>
            {/* Header Strip with Workflow Stepper */}
            <div className="p-4 rounded-lg border" style={{ background: IR.palebg, borderColor: IR.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-xs" style={{ color: IR.blue }}>{selectedTask.id}</span>
                  <h3 className="text-base font-bold mt-0.5" style={{ color: IR.navy }}>
                    {selectedTask.workType || selectedTask.maintenanceType || selectedTask.title}
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: IR.sub }}>
                    Created: {new Date(selectedTask.createdAt || Date.now()).toLocaleDateString('en-IN')} · Department: {selectedTask.department}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={selectedTask.priority} />
                  <StatusBadge status={selectedTask.status} />
                </div>
              </div>

              {/* Progress Stepper Banner (Section 3 & 18) */}
              <div className="mt-3 pt-3 border-t" style={{ borderColor: IR.border }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: IR.sub }}>
                  Engineering Workflow Progression
                </span>
                <div className="flex flex-wrap gap-1">
                  {WORKFLOW_STEPS.map((step, idx) => {
                    const isDone =
                      (selectedTask.status === 'Completed' && idx <= 6) ||
                      (selectedTask.status === 'In Progress' && idx <= 5) ||
                      (selectedTask.status === 'Scheduled' && idx <= 4) ||
                      (selectedTask.status === 'Assigned' && idx <= 3) ||
                      (selectedTask.status?.includes('Review') && idx <= 1) ||
                      idx === 0;

                    return (
                      <span
                        key={step}
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                        style={
                          isDone
                            ? { background: '#F0FDF4', color: IR.green, borderColor: '#BBF7D0' }
                            : { background: 'white', color: IR.sub, borderColor: IR.border }
                        }
                      >
                        {isDone ? '✓ ' : ''}{step}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Employee Details (Section 14) */}
            <div className="p-3.5 rounded-lg border" style={{ background: 'white', borderColor: IR.border }}>
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: IR.navy }}>
                Assigned Personnel Details (Allocated by Control Office)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px]" style={{ color: IR.sub }}>Assigned Employee:</span>
                  <div className="font-bold text-sm" style={{ color: IR.text }}>
                    {selectedTask.assignedEmployee || 'Rahul Sharma'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px]" style={{ color: IR.sub }}>Employee ID:</span>
                  <div className="font-mono font-bold text-sm" style={{ color: IR.blue }}>
                    {selectedTask.employeeId || 'ENG-1042'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px]" style={{ color: IR.sub }}>Assigned Role:</span>
                  <div className="font-bold text-sm" style={{ color: IR.text }}>
                    {selectedTask.assignedRole || 'Track Engineer'}
                  </div>
                </div>
              </div>
            </div>

            {/* Track Details & Timing (Section 15 & 29) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 border rounded" style={{ borderColor: IR.border, background: 'white' }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Track Number</span>
                <div className="font-bold text-sm mt-0.5" style={{ color: IR.text }}>
                  {selectedTask.trackNumber || 'Track 1 (Up Main)'}
                </div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border, background: 'white' }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Corridor Section</span>
                <div className="font-bold text-sm mt-0.5" style={{ color: IR.text }}>
                  {selectedTask.location || selectedTask.section || 'C101 Km 45/2'}
                </div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border, background: 'white' }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Scheduled Window</span>
                <div className="font-mono font-bold text-sm mt-0.5" style={{ color: IR.navy }}>
                  {selectedTask.preferredTime || selectedTask.requestedTime || '14:00'} ({selectedTask.duration ? `${selectedTask.duration}m` : '2h'})
                </div>
              </div>
              <div className="p-3 border rounded" style={{ borderColor: IR.border, background: 'white' }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Actual Execution</span>
                <div className="font-mono font-bold text-sm mt-0.5" style={{ color: selectedTask.completedAt ? IR.green : IR.sub }}>
                  {selectedTask.completedAt ? `Duration: ${selectedTask.actualDuration || 45}m` : selectedTask.startedAt ? 'Running Now' : 'Not Started'}
                </div>
              </div>
            </div>

            {/* Resource Readiness Check (Section 31) */}
            {taskResourceCheck && (
              <div className="p-3.5 rounded-lg border" style={{ background: taskResourceCheck.isReady ? '#F0FDF4' : '#FFFBEB', borderColor: taskResourceCheck.isReady ? '#BBF7D0' : '#FDE68A' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: taskResourceCheck.isReady ? IR.green : IR.amber }}>
                    Resource Readiness Check
                  </span>
                  <span className="font-black text-xs" style={{ color: taskResourceCheck.isReady ? IR.green : IR.amber }}>
                    {taskResourceCheck.overall}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]" style={{ color: IR.text }}>
                  <div>• Track: <strong>{taskResourceCheck.trackStatus}</strong> ({taskResourceCheck.trackName})</div>
                  <div>• Machinery: <strong>{taskResourceCheck.machineryStatus}</strong> ({taskResourceCheck.machineryName})</div>
                  <div>• Staff Gang: <strong>{taskResourceCheck.staffStatus}</strong> ({taskResourceCheck.staffCount})</div>
                </div>
              </div>
            )}

            {/* Maintenance Description & AI Details */}
            <div className="p-3.5 rounded-lg border space-y-2" style={{ background: 'white', borderColor: IR.border }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: IR.navy }}>
                Technical Scope &amp; AI Prioritization
              </span>
              <p className="text-xs leading-relaxed" style={{ color: IR.text }}>
                {selectedTask.description || selectedTask.workDescription || 'Standard track maintenance execution.'}
              </p>
              <div className="pt-2 border-t flex flex-wrap items-center justify-between text-xs" style={{ borderColor: IR.border }}>
                <span style={{ color: IR.sub }}>
                  Priority Score: <strong style={{ color: IR.navy }}>{selectedTask.priorityScore || 85} / 100</strong>
                </span>
                <span style={{ color: IR.sub }}>
                  Required Block: <strong>{selectedTask.requiredBlock || 'Planned'}</strong>
                </span>
                <span style={{ color: IR.sub }}>
                  Staff: <strong>{selectedTask.staffCount || selectedTask.manpower || 14} Crew</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons in Drawer */}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: IR.border }}>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded text-xs font-bold border cursor-pointer"
                style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                {selectedTask.status === 'Scheduled' && (
                  <button
                    onClick={() => {
                      handleStartWork(selectedTask.id);
                    }}
                    className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider shadow cursor-pointer flex items-center gap-1.5"
                    style={{ background: IR.green, color: 'white' }}
                  >
                    <span>START WORK</span>
                  </button>
                )}

                {selectedTask.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      handlePromptEndWork(selectedTask);
                    }}
                    className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider shadow cursor-pointer flex items-center gap-1.5"
                    style={{ background: IR.red, color: 'white' }}
                  >
                    <span>END WORK</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 8. NEW MAINTENANCE REQUEST MODAL (13 FIELDS) ── */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="INDIAN RAILWAYS — NEW TRACK MAINTENANCE REQUISITION"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans p-1" style={{ color: IR.text }}>
          <p className="text-xs" style={{ color: IR.sub }}>
            Create an official maintenance requisition. The request will enter Pending Review and be evaluated by the AI Prioritization engine.
          </p>

          {/* Grid Layout: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field 1: Asset / Track */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                1. Asset / Track Name <span className="text-red-500">*</span>
              </label>
              <select
                name="asset"
                value={formState.asset}
                onChange={handleFormChange}
                className="w-full p-2.5 rounded font-semibold focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              >
                <option value="Track 1 (Up Main Line)">Track 1 (Up Main Line)</option>
                <option value="Track 2 (Down Main Line)">Track 2 (Down Main Line)</option>
                <option value="Track 3 (Loop Line / Siding)">Track 3 (Loop Line / Siding)</option>
                <option value="Switch & Crossing Turnout #4">Switch &amp; Crossing Turnout #4</option>
              </select>
            </div>

            {/* Field 2: Track Number */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                2. Track Number <span className="text-red-500">*</span>
              </label>
              <select
                name="trackNumber"
                value={formState.trackNumber}
                onChange={handleFormChange}
                className="w-full p-2.5 rounded font-semibold focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              >
                <option value="Track 1">Track 1</option>
                <option value="Track 2">Track 2</option>
                <option value="Track 3">Track 3</option>
                <option value="Track 4">Track 4</option>
              </select>
            </div>

            {/* Field 3: Location */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                3. Rail Corridor &amp; Section <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="corridor"
                  value={formState.corridor}
                  onChange={handleFormChange}
                  className="w-full p-2.5 rounded font-semibold focus:outline-none"
                  style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
                >
                  <option value="C101">C101 (NDLS - AGC)</option>
                  <option value="C102">C102 (HWH - BWN)</option>
                  <option value="C103">C103 (CSMT - KYN)</option>
                  <option value="C104">C104 (MAS - GDR)</option>
                </select>
                <input
                  type="text"
                  name="kmPost"
                  placeholder="e.g. Km 45/2 - 48/0"
                  value={formState.kmPost}
                  onChange={handleFormChange}
                  className="w-full p-2.5 rounded font-medium focus:outline-none"
                  style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
                />
              </div>
            </div>

            {/* Field 4: Maintenance Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                4. Maintenance Type <span className="text-red-500">*</span>
              </label>
              <select
                name="maintenanceType"
                value={formState.maintenanceType}
                onChange={handleFormChange}
                className="w-full p-2.5 rounded font-semibold focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              >
                <option value="Track Repair">Track Repair</option>
                <option value="Track Inspection">Track Inspection</option>
                <option value="Rail Inspection">Rail Inspection</option>
                <option value="Sleeper Replacement">Sleeper Replacement</option>
                <option value="Ballast Maintenance">Ballast Maintenance</option>
                <option value="Track Geometry Maintenance">Track Geometry Maintenance</option>
                <option value="Other">Other Civil Work</option>
              </select>
            </div>
          </div>

          {/* Field 5: Work Description / Scope */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              5. Work Description &amp; Scope <span className="text-red-500">*</span>
            </label>
            <textarea
              name="workDescription"
              rows={2}
              placeholder="e.g. Deep screening of ballast voids and alignment correction near km post 45..."
              value={formState.workDescription}
              onChange={handleFormChange}
              className="w-full p-2.5 rounded text-xs font-medium focus:outline-none"
              style={{
                background: 'white',
                border: formErrors.workDescription ? '1px solid #EF4444' : `1px solid ${IR.border}`,
                color: IR.text,
              }}
            />
            {formErrors.workDescription && (
              <span className="text-[10px] text-red-600 font-semibold">{formErrors.workDescription}</span>
            )}
          </div>

          {/* Timing, Duration, Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Field 6: Priority */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                6. Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formState.priority}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-semibold focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              >
                <option value="Critical">Critical (Safety Hazard)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low (Routine)</option>
              </select>
            </div>

            {/* Field 7: Requested Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                7. Requested Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="requestedDate"
                value={formState.requestedDate}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-medium focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              />
            </div>

            {/* Field 8: Preferred Start Time */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                8. Preferred Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="preferredTime"
                value={formState.preferredTime}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-medium focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              />
            </div>

            {/* Field 9: Required Duration */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                9. Duration (Hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                name="durationHours"
                value={formState.durationHours}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-medium focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              />
            </div>
          </div>

          {/* Block Type, Staff Count, Machinery Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Field 10: Required Block */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                10. Required Block <span className="text-red-500">*</span>
              </label>
              <select
                name="requiredBlock"
                value={formState.requiredBlock}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-semibold focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              >
                <option value="Planned">Planned Block</option>
                <option value="Immediate">Immediate / Emergency</option>
                <option value="AI Recommended">AI Recommended Window</option>
                <option value="Specific Block">Specific Night Block</option>
              </select>
            </div>

            {/* Field 11: Staff Count */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                11. Staff Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                name="staffCount"
                value={formState.staffCount}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-medium focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              />
            </div>

            {/* Field 12: Machinery Needed */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
                12. Machinery Needed <span className="text-red-500">*</span>
              </label>
              <select
                name="machineryNeeded"
                value={formState.machineryNeeded}
                onChange={handleFormChange}
                className="w-full p-2 rounded font-semibold focus:outline-none"
                style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
              >
                <option value="Duomatic Tamping Machine (CSU-09)">Duomatic Tamping Machine</option>
                <option value="Ballast Cleaning Machine (BCM-300)">Ballast Cleaning Machine (BCM)</option>
                <option value="Motorized Inspection Trolley (MIT-04)">Inspection Trolley</option>
                <option value="Dynamic Track Stabilizer (DTS-11)">Dynamic Track Stabilizer</option>
                <option value="Manual Tools / Rail Tongs Only">Manual Tools / Gang Rigs</option>
              </select>
            </div>
          </div>

          {/* Field 13: Technical Scope / Location Details */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: IR.text }}>
              13. Technical Scope &amp; Special Safety Caution Details
            </label>
            <textarea
              name="technicalDetails"
              rows={2}
              placeholder="e.g. 30 km/h caution order required for 48 hrs post tamping; OHE shutdown not requested..."
              value={formState.technicalDetails}
              onChange={handleFormChange}
              className="w-full p-2.5 rounded text-xs font-medium focus:outline-none"
              style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.text }}
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: IR.border }}>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded font-bold border cursor-pointer"
              style={{ background: IR.palebg, borderColor: IR.border, color: IR.text }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded font-bold uppercase tracking-wider shadow cursor-pointer"
              style={{ background: IR.navy, color: 'white' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = IR.blue)}
              onMouseLeave={(e) => (e.currentTarget.style.background = IR.navy)}
            >
              Submit Official Requisition
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 9. CONFIRM END WORK DIALOG ── */}
      <ConfirmationDialog
        open={endConfirmDialog.open}
        onClose={() => setEndConfirmDialog({ open: false, task: null })}
        onConfirm={handleConfirmEndWork}
        title={`End Maintenance Activity — ${endConfirmDialog.task?.id || ''}?`}
        message={`Confirm completion of track work on ${endConfirmDialog.task?.location || 'this section'}. Ensure all tools, machinery, and track personnel are clear of the foul line before handing back track to Traffic Control.`}
        confirmText="Confirm End & Mark Completed"
        danger={false}
      />
    </div>
  );
}

export default EngineeringDashboard;

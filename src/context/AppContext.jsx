import { createContext, useContext, useState } from 'react';
import { maintenanceService } from '../services/maintenanceService.js';
import { blockService } from '../services/blockService.js';
import { notificationService } from '../services/notificationService.js';
import { INITIAL_CONFLICTS, CORRIDORS as DEMO_CORRIDORS } from '../data/demoData.js';
import { storageService } from '../services/storageService.js';

const AppContext = createContext(null);

const DEFAULT_CORRIDORS = [
  { id: 'C1', code: 'C1', name: 'NDLS - AGC (Tughlakabad - Palwal)' },
  { id: 'C2', code: 'C2', name: 'HWH - BWN (Bandel - Burdwan)' },
  { id: 'C3', code: 'C3', name: 'CSMT - KYN (Mumbai CSMT - Kalyan)' },
];

const DEFAULT_AI_OPTIONS = [
  {
    id: 'OPT-1',
    name: 'Strategy A: Max Shadow Bundling',
    title: 'Strategy A: Max Shadow Bundling',
    delayImpact: '0 mins',
    efficiencyScore: '96%',
    windowTime: '11:30 - 15:00',
    description: 'Synchronizes track geometry tamping, S&T electronic interlocking tests, and TRD OHE catenary adjustment into a single 3.5-hour shadow window during non-peak hours.',
    explainability: 'Zero train detentions on high density corridor. Reduces overall possession time by 66%.',
    reasons: [
      'Zero passenger train detentions: Fits precisely into the 12:00-14:30 non-peak timetable gap',
      'Resource Optimization: Shared track possession reduces total line block overhead by 66%',
      'Freight Regulation: Freight rakes held at loop lines without blocking main line signals',
    ],
  },
  {
    id: 'OPT-2',
    name: 'Strategy B: Sequential Night Window',
    title: 'Strategy B: Sequential Night Window',
    delayImpact: '15 mins',
    efficiencyScore: '89%',
    windowTime: '01:00 - 04:30',
    description: 'Executes maintenance sequentially overnight during low traffic volume.',
    explainability: 'Low risk for passenger trains, minimal impact on overnight freight movement.',
    reasons: [
      'Minimal passenger impact during night maintenance block',
      'Allows dedicated track machine access',
    ],
  },
];

export function AppProvider({ children }) {
  const [requests, setRequests] = useState(() => {
    const data = maintenanceService.getAll();
    return data && data.length > 0 ? data : [
      { id: 'REQ-101', workType: 'Deep Screening & Tamping', section: 'NDLS - AGC (Tughlakabad - Palwal)', sectionId: 'C1', department: 'Engineering (Civil/Track)', dept: 'Track', durationHours: 3.5, requestedTime: '11:30', requestedDate: '2026-09-25', priority: 'High', status: 'Pending AI Review' },
      { id: 'REQ-102', workType: 'Electronic Interlocking Point Test', section: 'NDLS - AGC (Tughlakabad - Palwal)', sectionId: 'C1', department: 'Signal & Telecom (S&T)', dept: 'S&T', durationHours: 2.0, requestedTime: '12:00', requestedDate: '2026-09-25', priority: 'High', status: 'Pending AI Review' },
      { id: 'REQ-103', workType: 'OHE Wire Inspection & Swivel Replacement', section: 'NDLS - AGC (Tughlakabad - Palwal)', sectionId: 'C1', department: 'Electrical (Traction/TRD)', dept: 'TRD', durationHours: 2.5, requestedTime: '12:00', requestedDate: '2026-09-25', priority: 'Medium', status: 'Pending AI Review' },
      { id: 'REQ-104', workType: 'Turnout Renewal & Rail Grinding', section: 'HWH - BWN (Bandel - Burdwan)', sectionId: 'C2', department: 'Engineering (Civil/Track)', dept: 'Track', durationHours: 4.0, requestedTime: '13:00', requestedDate: '2026-09-26', priority: 'Critical', status: 'Approved' },
    ];
  });

  const [blocks, setBlocks] = useState(() => blockService.getAll());
  const [aiPlan, setAiPlan] = useState(() => blockService.getLatestPlan());
  const [conflicts, setConflicts] = useState(() => {
    if (!storageService.has('conflicts')) {
      storageService.set('conflicts', INITIAL_CONFLICTS || []);
    }
    return storageService.get('conflicts') || INITIAL_CONFLICTS || [];
  });

  const [notifications, setNotifications] = useState(() => notificationService.getAll());
  const [toasts, setToasts] = useState([]);
  const [aiBundlingOptions, setAiBundlingOptions] = useState(DEFAULT_AI_OPTIONS);
  const [selectedOption, setSelectedOption] = useState(DEFAULT_AI_OPTIONS[0]);
  const [corridors] = useState(DEFAULT_CORRIDORS);
  const [aiProcessingStatus, setAiProcessingStatus] = useState({ analyzing: false });

  // Filters
  const [requestFilters, setRequestFilters] = useState({
    priority: '',
    status: '',
    location: '',
    maintenanceType: '',
    search: '',
  });

  const addToast = (msgOrObject, typeFallback = 'info') => {
    const id = Date.now();
    let toastObj = { id, message: '', type: typeFallback };
    if (typeof msgOrObject === 'string') {
      toastObj.message = msgOrObject;
      toastObj.type = typeFallback;
    } else if (msgOrObject && typeof msgOrObject === 'object') {
      toastObj = { id, type: msgOrObject.type || typeFallback, message: msgOrObject.message || 'Notification' };
    }
    setToasts(prev => [...prev, toastObj]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addNotification = (notification) => {
    const n = notificationService.add(notification);
    setNotifications(notificationService.getAll());
    addToast({ type: notification.type || 'info', message: notification.message });
    return n;
  };

  const triggerAiAnalysis = () => {
    setAiProcessingStatus({ analyzing: true });
    setTimeout(() => {
      setAiProcessingStatus({ analyzing: false });
      addToast('AI Network Analysis completed. All Shadow Blocks optimized!', 'success');
    }, 1200);
  };

  const approveBundleOption = (option) => {
    setSelectedOption(option);
    addToast(`AI Strategy "${option.name || option.title}" approved and applied to zonal timetable!`, 'success');
  };

  const submitRequest = (formData) => {
    const deptPrefix = (formData.department || '').includes('Signal') ? 'SNT'
      : (formData.department || '').includes('Traction') || (formData.department || '').includes('Electrical') ? 'TRD'
      : 'ENG';
    const existing = requests.filter(r => r.id && r.id.startsWith(deptPrefix + '-REQ-'));
    const nextNum = (existing.length + 1).toString().padStart(3, '0');
    const newId = formData.id || `${deptPrefix}-REQ-${nextNum}`;

    const newReq = {
      id: newId,
      requestNo: requests.length + 1,
      asset: formData.asset || `Track ${formData.section || 'C101'}`,
      trackNumber: formData.trackNumber || 'Track 1 (Up Main)',
      location: formData.location || formData.section || 'C101',
      section: formData.location || formData.section || DEFAULT_CORRIDORS[0].name,
      maintenanceType: formData.maintenanceType || formData.workType || 'Track Repair',
      workType: formData.maintenanceType || formData.workType || 'Track Repair',
      title: formData.workDescription || formData.description || formData.workType || 'Track Maintenance Work',
      description: formData.workDescription || formData.description || '',
      department: formData.department || 'Engineering',
      priority: formData.priority || 'High',
      priorityScore: formData.priorityScore || 85,
      durationHours: parseFloat(formData.durationHours) || (formData.duration ? formData.duration / 60 : 2.0),
      duration: formData.duration || (formData.durationHours ? parseFloat(formData.durationHours) * 60 : 120),
      preferredTime: formData.preferredTime || formData.requestedTime || '11:00',
      requestedTime: formData.preferredTime || formData.requestedTime || '11:00',
      requestedDate: formData.requestedDate || new Date().toISOString().split('T')[0],
      requiredBlock: formData.requiredBlock || 'Planned',
      manpower: parseInt(formData.staffCount || formData.manpower || 12, 10),
      staffCount: parseInt(formData.staffCount || formData.manpower || 12, 10),
      machinery: formData.machinery || formData.machineryNeeded || 'Duomatic Tamping Machine',
      technicalDetails: formData.technicalDetails || '',
      status: 'Pending Review',
      assignedEmployee: 'Rahul Sharma',
      employeeId: 'ENG-1042',
      assignedRole: 'Track Engineer',
      assignedBy: 'Control Office',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      conflictStatus: 'No Conflict',
    };

    setRequests(prev => {
      const updated = [newReq, ...prev];
      storageService.set('maintenance_requests', updated);
      return updated;
    });

    addToast(`Requisition ${newReq.id} submitted successfully! Status: Pending Review`, 'success');
    return newReq;
  };

  const startWork = (id) => {
    const now = new Date().toISOString();
    setRequests(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, status: 'In Progress', startedAt: now } : r));
      storageService.set('maintenance_requests', updated);
      return updated;
    });
    addToast(`Work started for ${id}. Status: In Progress`, 'info');
  };

  const endWork = (id) => {
    const now = new Date().toISOString();
    setRequests(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          const startedAt = r.startedAt || new Date(Date.now() - 45 * 60 * 1000).toISOString();
          const diffMs = new Date(now).getTime() - new Date(startedAt).getTime();
          const actualDurationMinutes = Math.max(1, Math.round(diffMs / 60000));
          return {
            ...r,
            status: 'Completed',
            completedAt: now,
            actualDuration: actualDurationMinutes,
          };
        }
        return r;
      });
      storageService.set('maintenance_requests', updated);
      return updated;
    });
    addToast(`Maintenance work ${id} marked as Completed.`, 'success');
  };

  const approveRequest = (id) => {
    setRequests(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, status: 'Approved' } : r));
      storageService.set('maintenance_requests', updated);
      return updated;
    });
    addToast(`Block Requisition ${id} Approved by Controller`, 'success');
  };

  const rejectRequest = (id, reason) => {
    setRequests(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, status: 'Rejected' } : r));
      storageService.set('maintenance_requests', updated);
      return updated;
    });
    addToast(`Block Requisition ${id} Rejected`, 'warning');
  };

  const modifyRequest = (id, updates) => {
    setRequests(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, ...updates, status: 'Modified Window' } : r));
      storageService.set('maintenance_requests', updated);
      return updated;
    });
    addToast(`Block Requisition ${id} window modified`, 'info');
  };

  const kpis = {
    totalRequests: requests.length,
    activeConflicts: conflicts.length,
    bundledBlocks: requests.filter(r => r.status?.includes('Approved') || r.isBundled).length || 5,
    savedPassengerMinutes: 420,
  };

  return (
    <AppContext.Provider
      value={{
        requests,
        setRequests,
        blocks,
        aiPlan,
        conflicts,
        notifications,
        toasts,
        addToast,
        removeToast,
        addNotification,
        aiBundlingOptions,
        selectedOption,
        setSelectedOption,
        corridors,
        kpis,
        aiProcessingStatus,
        triggerAiAnalysis,
        approveBundleOption,
        submitRequest,
        approveRequest,
        rejectRequest,
        modifyRequest,
        startWork,
        endWork,
        requestFilters,
        setRequestFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

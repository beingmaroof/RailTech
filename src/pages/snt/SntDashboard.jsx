import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { KpiCard } from '../../components/common/KpiCard.jsx';
import { IconSignal, IconPlus, IconCheck, IconAI } from '../../components/icons/Icons.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export function SntDashboard() {
  const { user } = useAuth();
  const { requests, submitRequest, corridors, addToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    workType: 'Signal Point Maintenance & Electronic Interlocking Test',
    section: 'NDLS - AGC (Tughlakabad - Palwal)',
    department: 'Signal & Telecom (S&T)',
    durationHours: 2.0,
    requestedTime: '12:00',
    priority: 'High',
    manpower: 6,
    machinery: 'S&T Testing Rigs',
    description: 'Point machine insulation testing and relay rack overhaul',
  });

  const sntRequests = requests.filter((r) => r.department?.includes('Signal') || r.dept === 'S&T');

  const handleSubmit = (e) => {
    e.preventDefault();
    const req = submitRequest(formData);
    setModalOpen(false);
    addToast(`S&T Request ${req.id} submitted! Matched with Civil Shadow Window.`, 'success');
  };

  const columns = [
    { key: 'id', header: 'ID', render: (v) => <span className="font-mono text-emerald-400 font-bold">{v}</span> },
    { key: 'workType', header: 'Signal/Telecom Task', render: (v, r) => <div><div className="font-semibold text-slate-100">{v}</div><div className="text-xs text-slate-400">{r.section}</div></div> },
    { key: 'durationHours', header: 'Duration', render: (v, r) => <span className="font-mono">{v || r.duration}h</span> },
    { key: 'priority', header: 'Priority', render: (v) => <StatusBadge priority={v} size="sm" /> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v} size="sm" /> },
  ];

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded">
                SIGNAL & TELECOM WING
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <IconSignal className="w-6 h-6 text-emerald-700" />
              <span>Signal & Telecom (S&T) Engineering Portal</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Electronic Interlocking, Track Circuiting, Point Machines & Axle Counter Maintenance
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            <span>New S&T Requisition</span>
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active S&T Requests</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{sntRequests.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Logged in division</div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Bundled Shadow Windows</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{sntRequests.filter(r => r.isBundled || r.status?.includes('Approved')).length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Aligned with Civil track blocks</div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Punctuality Safeguarded</div>
            <div className="text-2xl font-black text-blue-900 mt-1">100%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero delay impact</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden space-y-0">
        <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">S&T Maintenance Schedule Log</h2>
          <span className="text-xs text-slate-600 font-medium">Total: {sntRequests.length} records</span>
        </div>
        <div className="p-2">
          <DataTable columns={columns} data={sntRequests} pageSize={5} />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="INDIAN RAILWAYS — S&T BLOCK REQUISITION FORM" size="md">
        <form onSubmit={handleSubmit} className="space-y-4 p-2 bg-white rounded-lg text-slate-900 font-sans">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Task Title *</label>
            <input type="text" value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })} required className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:border-blue-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Rail Corridor Section *</label>
            <select value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:border-blue-600 focus:outline-none">
              {corridors.map((c) => <option key={c.id} value={c.name}>{c.code}: {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Start Time *</label>
              <input type="time" value={formData.requestedTime} onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:border-blue-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Duration (Hours) *</label>
              <input type="number" step="0.5" value={formData.durationHours} onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) })} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:border-blue-600 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold uppercase cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold uppercase cursor-pointer shadow">Submit S&T Requisition</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SntDashboard;

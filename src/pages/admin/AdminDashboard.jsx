import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import {
  IconWarning, IconLayers, IconClock, IconCheck,
  IconTrack, IconSignal, IconTraction,
  IconAI, IconSparkles, IconReport, IconAnalytics,
  IconInfo, IconConflict, IconCalendar,
} from '../../components/icons/Icons.jsx';

// ── IR Palette constants ─────────────────────────────────────
const IR = {
  navy:    '#0B1F3A',
  blue:    '#123A8C',
  royal:   '#0056B3',
  lightbg: '#E8F1FF',
  palebg:  '#F2F6FC',
  border:  '#D9E2EC',
  text:    '#172B4D',
  sub:     '#5E6C84',
  green:   '#16804B',
  amber:   '#D88900',
  red:     '#C62828',
  yellow:  '#FDCC0D',
  bg:      '#F4F7FA',
};

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, badge, accentColor }) {
  return (
    <div
      className="p-4 flex items-start justify-between gap-4 border-b"
      style={{ background: IR.palebg, borderColor: IR.border }}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: accentColor || IR.blue }} />}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>{title}</h2>
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

// ── Priority Badge ────────────────────────────────────────────
function PriorityBadge({ level }) {
  const map = {
    High:   { bg: '#FEF2F2', color: IR.red,   border: '#FECACA' },
    Medium: { bg: '#FFFBEB', color: IR.amber,  border: '#FDE68A' },
    Low:    { bg: IR.lightbg, color: IR.blue,  border: '#BFDBFE' },
  };
  const s = map[level] || { bg: IR.palebg, color: IR.sub, border: IR.border };
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {level}
    </span>
  );
}

// ── AI Recommendations (synthetic) ───────────────────────────
const AI_RECOMMENDATIONS = [
  {
    id: 'AI-001', priority: 'High', section: 'C101 — Agra–Mathura',
    issue: 'Three overlapping maintenance windows detected. Track geometry and OHE block requests conflict between 02:00–04:30 hrs.',
    recommendation: 'Merge Track Geometry (Civil) and OHE Inspection (TRD) into a combined 3-hour block on Wednesdays. Estimated saving: 2.5 hrs/week.',
    impactLabel: 'Conflict Resolved', impactColor: 'green',
  },
  {
    id: 'AI-002', priority: 'Medium', section: 'C102 — Mathura–Palwal',
    issue: 'Signal relay room maintenance (S&T) has 4 pending requests compatible with adjacent track inspection slots.',
    recommendation: 'Bundle S&T relay maintenance with Track Inspection on weekends during low-traffic window (01:00–03:30 hrs). Saves 1 block/week.',
    impactLabel: 'Bundling Opportunity', impactColor: 'blue',
  },
  {
    id: 'AI-003', priority: 'Low', section: 'C104 — Agra–Jhansi',
    issue: 'Ballast tamping requests from Engineering dept. are spread across 6 separate windows over 2 weeks.',
    recommendation: 'Consolidate into 2 extended weekend blocks. Reduces maintenance-induced traffic disruptions by ~40%.',
    impactLabel: 'Optimization', impactColor: 'amber',
  },
];

// ── Optimization Impact (synthetic) ──────────────────────────
const IMPACT_DATA = [
  { metric: 'Total Maintenance Windows', unit: 'windows/month', before: 38, after: 24, improvement: '37% reduction' },
  { metric: 'Avg. Block Duration Used', unit: 'per block', before: '4.2 hrs', after: '2.8 hrs', improvement: '33% more efficient' },
  { metric: 'Traffic Disruptions', unit: 'disruptions/month', before: 14, after: 6, improvement: '57% reduction' },
  { metric: 'Dept. Conflicts Resolved', unit: 'active conflicts', before: 9, after: 1, improvement: '89% resolved' },
  { metric: 'AI Bundling Rate', unit: 'of requests bundled', before: '0%', after: '63%', improvement: 'New capability' },
];

// ── Solved Cases (synthetic) ──────────────────────────────────
const SOLVED_CASES = [
  { id: 'SC-081', section: 'C101', description: 'OHE–Track block overlap resolved via bundling', dept: 'TRD + Civil', resolvedOn: '21 Sep 2026' },
  { id: 'SC-079', section: 'C103', description: 'Signal relay conflict cleared after rescheduling', dept: 'S&T', resolvedOn: '20 Sep 2026' },
  { id: 'SC-076', section: 'C102', description: 'Weekend maintenance window consolidated', dept: 'Civil', resolvedOn: '18 Sep 2026' },
  { id: 'SC-072', section: 'C104', description: 'Multi-department simultaneous block prevented', dept: 'All Depts.', resolvedOn: '15 Sep 2026' },
];

// ── Main Component ────────────────────────────────────────────
export function AdminDashboard() {
  const { requests, conflicts, corridors } = useApp();
  const [activeTab, setActiveTab] = useState('departments');

  const civilReq = requests.filter(r => r.department?.includes('Civil') || r.dept === 'Track' || r.department?.includes('Engineering'));
  const sntReq   = requests.filter(r => r.department?.includes('Signal') || r.dept === 'S&T' || r.department?.includes('Telecom'));
  const trdReq   = requests.filter(r => r.department?.includes('Electrical') || r.dept === 'TRD' || r.department?.includes('Traction'));

  const deptStats = [
    {
      department: 'Engineering / Track & Civil', code: 'CIVIL-ENG', head: 'Chief Track Engineer (CTE)',
      total: civilReq.length,
      pending: civilReq.filter(r => r.status === 'Pending' || r.status === 'Submitted').length,
      approved: civilReq.filter(r => r.status === 'Approved' || r.status === 'Granted').length,
      urgent: civilReq.filter(r => r.urgency === 'High' || r.urgency === 'Critical' || r.priority === 'High').length,
      safetyStatus: 'Normal (Clear)', safetyOk: true, Icon: IconTrack, iconColor: IR.blue,
    },
    {
      department: 'Signal & Telecommunication', code: 'SNT-DIV', head: 'Chief Signal & Telecom Engr. (CSTE)',
      total: sntReq.length,
      pending: sntReq.filter(r => r.status === 'Pending' || r.status === 'Submitted').length,
      approved: sntReq.filter(r => r.status === 'Approved' || r.status === 'Granted').length,
      urgent: sntReq.filter(r => r.urgency === 'High' || r.urgency === 'Critical' || r.priority === 'High').length,
      safetyStatus: 'Interlock Tested', safetyOk: true, Icon: IconSignal, iconColor: IR.green,
    },
    {
      department: 'Electrical Traction & OHE (TRD)', code: 'ELEC-TRD', head: 'Chief Electrical Engineer (CEE)',
      total: trdReq.length,
      pending: trdReq.filter(r => r.status === 'Pending' || r.status === 'Submitted').length,
      approved: trdReq.filter(r => r.status === 'Approved' || r.status === 'Granted').length,
      urgent: trdReq.filter(r => r.urgency === 'High' || r.urgency === 'Critical' || r.priority === 'High').length,
      safetyStatus: 'Power Block Ready', safetyOk: false, Icon: IconTraction, iconColor: IR.amber,
    },
  ];

  const totalPending  = requests.filter(r => r.status === 'Pending' || r.status === 'Submitted').length;
  const totalApproved = requests.filter(r => r.status === 'Approved' || r.status === 'Granted').length;

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });

  const kpiItems = [
    { label: 'Total Requisitions', value: requests.length,  sub: 'All 3 depts.',          valueColor: IR.navy,  Icon: IconReport },
    { label: 'Pending Review',     value: totalPending,     sub: 'Awaiting decision',       valueColor: IR.amber, Icon: IconClock },
    { label: 'Approved / Active',  value: totalApproved,    sub: 'Confirmed blocks',         valueColor: IR.green, Icon: IconCheck },
    { label: 'Active Conflicts',   value: conflicts.length, sub: 'Need synchronization',     valueColor: conflicts.length > 0 ? IR.red : IR.green, Icon: IconWarning },
    { label: 'Monitored Sections', value: corridors.length, sub: 'High-density tracks',      valueColor: IR.blue,  Icon: IconLayers },
    { label: 'AI Recommendations', value: AI_RECOMMENDATIONS.length, sub: 'Advisory pending', valueColor: IR.royal, Icon: IconSparkles },
  ];

  return (
    <div className="space-y-5 font-sans" style={{ color: IR.text }}>

      {/* ── SECTION 1: COMMAND HEADER ──────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        {/* Top blue accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${IR.navy} 0%, ${IR.blue} 50%, ${IR.royal} 100%)` }} />

        <div className="p-5" style={{ borderBottom: `1px solid ${IR.border}` }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded"
                  style={{ background: IR.navy, color: '#FDCC0D' }}
                >
                  Zonal Command HQ
                </span>
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded"
                  style={{ background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }}
                >
                  Ministry of Railways
                </span>
                <span
                  className="px-2 py-0.5 text-[11px] font-semibold rounded"
                  style={{ background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }}
                >
                  ● System Online
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: IR.navy }}>
                Network Operations &amp; Zonal Executive Dashboard
              </h1>
              <p className="text-xs mt-1" style={{ color: IR.sub }}>
                Centralized administrative monitoring · Multi-departmental maintenance requisitions · Sectional performance overview
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs" style={{ color: IR.sub }}>Reporting Zone</div>
              <div className="font-bold" style={{ color: IR.navy }}>Northern Central Zone (HQ-01)</div>
              <div className="text-xs mt-1" style={{ color: IR.sub }}>{today}</div>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          style={{ borderTop: `1px solid ${IR.border}`, borderBottom: `1px solid ${IR.border}` }}
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

      {/* ── SECTION 2: AI PLANNING ─────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.blue }} />
        <SectionHeader
          icon={IconAI}
          title="AI Planning & Recommendations"
          subtitle="System-generated maintenance bundling and conflict resolution suggestions — Read-only monitoring view"
          badge={`${AI_RECOMMENDATIONS.length} Active`}
          accentColor={IR.blue}
        />
        <div className="divide-y" style={{ borderColor: IR.border }}>
          {AI_RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="p-4 transition-colors" style={{ '--hover-bg': IR.palebg }}
              onMouseEnter={e => e.currentTarget.style.background = IR.palebg}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: IR.palebg, color: IR.sub, border: `1px solid ${IR.border}` }}
                    >
                      {rec.id}
                    </span>
                    <PriorityBadge level={rec.priority} />
                    <span className="text-xs font-semibold" style={{ color: IR.text }}>{rec.section}</span>
                  </div>
                  <p className="text-xs mb-2 leading-relaxed" style={{ color: IR.sub }}>
                    <span className="font-semibold" style={{ color: IR.text }}>Issue: </span>{rec.issue}
                  </p>
                  <div
                    className="rounded p-2.5"
                    style={{ background: IR.lightbg, border: `1px solid #BFDBFE` }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: IR.navy }}>
                      <span className="font-bold">AI Suggestion: </span>{rec.recommendation}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
                    style={
                      rec.impactColor === 'green'
                        ? { background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }
                        : rec.impactColor === 'amber'
                        ? { background: '#FFFBEB', color: IR.amber, border: `1px solid #FDE68A` }
                        : { background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }
                    }
                  >
                    {rec.impactLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3" style={{ background: IR.lightbg, borderTop: `1px solid #BFDBFE` }}>
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: IR.blue }}>
            <IconInfo className="w-3.5 h-3.5 shrink-0" />
            AI recommendations are advisory only. Final scheduling decisions are made by the Control Office.
          </p>
        </div>
      </div>

      {/* ── SECTION 3: PERFORMANCE OVERVIEW (TABS) ─────────────── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.royal }} />
        <div
          className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ background: IR.palebg, borderBottom: `1px solid ${IR.border}` }}
        >
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: IR.text }}>Performance Overview</h2>
            <p className="text-xs mt-0.5" style={{ color: IR.sub }}>Departmental requisitions and corridor maintenance load</p>
          </div>
          <div className="flex rounded overflow-hidden text-xs font-semibold" style={{ border: `1px solid ${IR.border}` }}>
            {['departments', 'corridors'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 capitalize transition-colors"
                style={
                  activeTab === tab
                    ? { background: IR.blue, color: 'white' }
                    : { background: 'white', color: IR.sub }
                }
              >
                {tab === 'departments' ? 'Departments' : 'Corridors'}
              </button>
            ))}
          </div>
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr style={{ background: IR.navy }}>
                  {['Department', 'Code', 'Departmental Head', 'Total', 'Pending', 'Approved', 'Critical', 'Safety Status'].map(h => (
                    <th
                      key={h}
                      className="p-3.5 font-bold text-[10px] uppercase tracking-wider"
                      style={{ color: '#FDCC0D', borderRight: `1px solid rgba(255,255,255,0.1)`, whiteSpace: 'nowrap' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptStats.map((dept, i) => (
                  <tr
                    key={dept.code}
                    style={{ background: i % 2 === 0 ? 'white' : IR.palebg, borderBottom: `1px solid ${IR.border}` }}
                  >
                    <td className="p-3.5" style={{ borderRight: `1px solid ${IR.border}` }}>
                      <div className="flex items-center gap-2">
                        <dept.Icon className="w-4 h-4 shrink-0" style={{ color: dept.iconColor }} />
                        <span className="font-bold" style={{ color: IR.navy }}>{dept.department}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-xs" style={{ color: IR.sub, borderRight: `1px solid ${IR.border}` }}>{dept.code}</td>
                    <td className="p-3.5 text-xs" style={{ color: IR.text, borderRight: `1px solid ${IR.border}` }}>{dept.head}</td>
                    <td className="p-3.5 text-center font-black" style={{ color: IR.navy, borderRight: `1px solid ${IR.border}` }}>{dept.total}</td>
                    <td className="p-3.5 text-center font-semibold" style={{ color: IR.amber, borderRight: `1px solid ${IR.border}` }}>{dept.pending}</td>
                    <td className="p-3.5 text-center font-semibold" style={{ color: IR.green, borderRight: `1px solid ${IR.border}` }}>{dept.approved}</td>
                    <td className="p-3.5 text-center font-semibold" style={{ color: IR.red, borderRight: `1px solid ${IR.border}` }}>{dept.urgent}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={
                          dept.safetyOk
                            ? { background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }
                            : { background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` }
                        }
                      >
                        {dept.safetyStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Corridors Tab */}
        {activeTab === 'corridors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr style={{ background: IR.navy }}>
                  {['Corridor Code', 'Section Name', 'Track Type', 'Block Requests', 'Maintenance Load', 'Status'].map(h => (
                    <th
                      key={h}
                      className="p-3.5 font-bold text-[10px] uppercase tracking-wider"
                      style={{ color: '#FDCC0D', borderRight: `1px solid rgba(255,255,255,0.1)` }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corridors.map((c, i) => {
                  const sec = requests.filter(r => r.sectionId === c.id || r.section === c.name || (r.section && r.section.includes(c.code)));
                  const loadLevel = sec.length > 3 ? 'Heavy Load' : sec.length > 1 ? 'Moderate Load' : 'Normal Flow';
                  const loadStyle =
                    loadLevel === 'Heavy Load'
                      ? { background: '#FEF2F2', color: IR.red, border: `1px solid #FECACA` }
                      : loadLevel === 'Moderate Load'
                      ? { background: '#FFFBEB', color: IR.amber, border: `1px solid #FDE68A` }
                      : { background: IR.lightbg, color: IR.blue, border: `1px solid #BFDBFE` };

                  return (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : IR.palebg, borderBottom: `1px solid ${IR.border}` }}>
                      <td className="p-3.5 font-bold font-mono" style={{ color: IR.blue, borderRight: `1px solid ${IR.border}` }}>{c.code}</td>
                      <td className="p-3.5 font-medium" style={{ color: IR.navy, borderRight: `1px solid ${IR.border}` }}>{c.name}</td>
                      <td className="p-3.5" style={{ color: IR.sub, borderRight: `1px solid ${IR.border}` }}>{c.tracks || 'Double Electrified'}</td>
                      <td className="p-3.5 text-center font-bold" style={{ color: IR.navy, borderRight: `1px solid ${IR.border}` }}>{sec.length}</td>
                      <td className="p-3.5 text-center" style={{ borderRight: `1px solid ${IR.border}` }}>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={loadStyle}>{loadLevel}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: IR.palebg, color: IR.sub, border: `1px solid ${IR.border}` }}>
                          Active Monitoring
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SECTION 4: ALERTS & RECENT LOG ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Conflicts */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
          <div style={{ height: 3, background: conflicts.length > 0 ? IR.red : IR.green }} />
          <SectionHeader
            icon={IconWarning}
            title={`Active Conflicts (${conflicts.length})`}
            subtitle="Timetable overlaps requiring synchronization"
            badge={conflicts.length > 0 ? 'Action Required' : 'All Clear'}
            accentColor={conflicts.length > 0 ? IR.red : IR.green}
          />
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {conflicts.length === 0 ? (
              <div
                className="p-6 text-center rounded text-xs"
                style={{ border: `1px dashed ${IR.border}`, color: IR.sub }}
              >
                <IconCheck className="w-6 h-6 mx-auto mb-2" style={{ color: IR.green }} />
                No active timetable or possession conflicts detected.
              </div>
            ) : (
              conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-3.5 rounded space-y-1.5"
                  style={{ background: '#FEF2F2', border: `1px solid #FECACA`, borderLeft: `3px solid ${IR.red}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: IR.red }}>
                      {conflict.severity || 'Overlap Conflict'}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'white', border: `1px solid ${IR.border}`, color: IR.sub }}>
                      {conflict.section || 'Corridor C1'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: IR.navy }}>{conflict.message || conflict.title}</div>
                  <div className="text-xs" style={{ color: IR.sub }}>{conflict.detail || conflict.description}</div>
                  {conflict.recommendation && (
                    <div className="text-xs p-2 rounded mt-1" style={{ background: IR.lightbg, border: `1px solid #BFDBFE`, color: IR.navy }}>
                      <strong>Resolution Note:</strong> {conflict.recommendation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Requisitions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
          <div style={{ height: 3, background: IR.blue }} />
          <SectionHeader
            icon={IconCalendar}
            title="Recent Maintenance Requisitions"
            subtitle="Live feed — latest submissions across all departments"
            badge="Log Feed"
            accentColor={IR.blue}
          />
          <div className="max-h-80 overflow-y-auto">
            {requests.slice(0, 8).map((req, i) => (
              <div
                key={req.id}
                className="p-3.5 flex items-center justify-between gap-3 transition-colors"
                style={{
                  background: i % 2 === 0 ? 'white' : IR.palebg,
                  borderBottom: `1px solid ${IR.border}`,
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs truncate" style={{ color: IR.navy }}>{req.workType || req.title}</span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <div className="text-[11px] flex flex-wrap items-center gap-1.5" style={{ color: IR.sub }}>
                    <span className="font-medium" style={{ color: IR.text }}>{req.section}</span>
                    <span>·</span>
                    <span>{req.department}</span>
                    <span>·</span>
                    <span>{req.durationHours || req.duration}h window</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono block" style={{ color: IR.sub }}>{req.requestedTime || req.time}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: IR.blue }}>{req.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: SOLVED CASES & EMPLOYEE OVERVIEW ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Solved Cases */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
          <div style={{ height: 3, background: IR.green }} />
          <SectionHeader
            icon={IconCheck}
            title="Solved Cases"
            subtitle="Recently resolved conflicts and bundled maintenance windows"
            badge={`${SOLVED_CASES.length} Resolved`}
            accentColor={IR.green}
          />
          <div>
            {SOLVED_CASES.map((sc, i) => (
              <div
                key={sc.id}
                className="p-3.5 transition-colors"
                style={{
                  background: i % 2 === 0 ? 'white' : IR.palebg,
                  borderBottom: `1px solid ${IR.border}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: IR.palebg, color: IR.sub, border: `1px solid ${IR.border}` }}
                      >
                        {sc.id}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: IR.blue }}>{sc.section}</span>
                    </div>
                    <div className="text-xs font-medium" style={{ color: IR.navy }}>{sc.description}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: IR.sub }}>Dept: {sc.dept}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }}
                    >
                      ✓ Resolved
                    </span>
                    <div className="text-[10px] mt-1" style={{ color: IR.sub }}>{sc.resolvedOn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Overview */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
          <div style={{ height: 3, background: IR.royal }} />
          <SectionHeader
            icon={IconAnalytics}
            title="Employee & System Overview"
            subtitle="Registered users and role assignments across all departments"
            badge="Directory"
            accentColor={IR.royal}
          />
          <div className="p-4 space-y-2">
            {[
              { role: 'Administration (Admin)',       users: 1,  code: 'ADMIN',    color: IR.navy  },
              { role: 'Engineering / Track & Civil',  users: 3,  code: 'CIVIL-ENG', color: IR.blue  },
              { role: 'Signal & Telecommunication',   users: 4,  code: 'SNT-DIV',  color: IR.amber },
              { role: 'Electrical Traction (TRD)',    users: 3,  code: 'ELEC-TRD', color: IR.red   },
              { role: 'Control Office',               users: 2,  code: 'COA',      color: IR.green },
            ].map((emp) => (
              <div
                key={emp.code}
                className="flex items-center justify-between p-3 rounded"
                style={{ background: IR.palebg, border: `1px solid ${IR.border}` }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-8 rounded"
                    style={{ background: emp.color, minWidth: 4 }}
                  />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: IR.navy }}>{emp.role}</div>
                    <div className="text-[10px] font-mono" style={{ color: IR.sub }}>{emp.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black" style={{ color: IR.navy }}>{emp.users}</div>
                  <div className="text-[10px]" style={{ color: IR.sub }}>Registered</div>
                </div>
              </div>
            ))}
            {/* Total row */}
            <div
              className="flex items-center justify-between p-3 rounded mt-1"
              style={{ background: IR.navy }}
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FDCC0D' }}>Total System Users</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>All roles combined</div>
              </div>
              <span className="text-2xl font-black text-white">13</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: OPTIMIZATION IMPACT ─────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${IR.blue}, ${IR.royal})` }} />
        <SectionHeader
          icon={IconSparkles}
          title="AI Optimization Impact — Before vs. After"
          subtitle="Comparative analysis of AI-assisted scheduling versus manual operations (Synthetic benchmark data)"
          badge="Synthetic Data"
          accentColor={IR.blue}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ background: IR.navy }}>
                <th className="p-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ color: '#FDCC0D', borderRight: `1px solid rgba(255,255,255,0.1)` }}>
                  Performance Metric
                </th>
                <th className="p-3.5 text-center" style={{ borderRight: `1px solid rgba(255,255,255,0.1)` }}>
                  <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px]" style={{ background: '#FEF2F2', color: IR.red }}>
                    BEFORE (Manual)
                  </span>
                </th>
                <th className="p-3.5 text-center" style={{ borderRight: `1px solid rgba(255,255,255,0.1)` }}>
                  <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px]" style={{ background: '#F0FDF4', color: IR.green }}>
                    AFTER (AI-Assisted)
                  </span>
                </th>
                <th className="p-3.5 text-center">
                  <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: '#FDCC0D' }}>Improvement</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {IMPACT_DATA.map((row, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? 'white' : IR.palebg, borderBottom: `1px solid ${IR.border}` }}
                >
                  <td className="p-3.5 font-medium" style={{ color: IR.navy, borderRight: `1px solid ${IR.border}` }}>
                    <div>{row.metric}</div>
                    <div className="text-[10px] font-normal" style={{ color: IR.sub }}>{row.unit}</div>
                  </td>
                  <td className="p-3.5 text-center font-bold" style={{ color: IR.red, borderRight: `1px solid ${IR.border}` }}>{row.before}</td>
                  <td className="p-3.5 text-center font-bold" style={{ color: IR.green, borderRight: `1px solid ${IR.border}` }}>{row.after}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className="px-2.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: '#F0FDF4', color: IR.green, border: `1px solid #BBF7D0` }}
                    >
                      {row.improvement}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3" style={{ background: '#FFFBEB', borderTop: `1px solid #FDE68A` }}>
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#92400E' }}>
            <IconWarning className="w-3.5 h-3.5 shrink-0" />
            <strong>Note:</strong> &quot;Before&quot; values represent a synthetic benchmark scenario. &quot;After&quot; values reflect projected outcomes with AI-assisted scheduling enabled.
          </p>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;

import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { CorridorTimeline } from '../../components/charts/CorridorTimeline.jsx';
import { IconClock, IconAI, IconLayers, IconCheck, IconInfo, IconSparkles } from '../../components/icons/Icons.jsx';
import { PASSENGER_TRAINS, GOODS_TRAINS, BLOCK_WINDOWS, BEFORE_AFTER } from '../../data/demoData.js';

// ── IR Palette constants (matching Admin & Control Office dashboards) ──
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

const OPERATIONAL_IMPACT_METRICS = [
  {
    parameter: 'Total Track Possession Blocks',
    scope: 'Monthly Network Occupancy',
    before: '32 separate departmental blocks',
    after: '21 synchronized shadow blocks',
    improvement: '34.4% Reduction',
    direction: 'down',
    benefit: 'Eliminates duplicate line possessions by bundling Track, S&T, and TRD activities simultaneously.',
  },
  {
    parameter: 'Cumulative Possession Hours',
    scope: 'Weekly Line Closure Duration',
    before: '68 block-hours / week',
    after: '46 block-hours / week',
    improvement: '22 Hours Restored (32.4%)',
    direction: 'down',
    benefit: 'Restores valuable line capacity to revenue train running without compromising asset maintenance.',
  },
  {
    parameter: 'Average Block Utilization',
    scope: 'Capacity Utilization Index',
    before: '61% block utilization',
    after: '93% block utilization',
    improvement: '+32.0% Efficiency Gain',
    direction: 'up',
    benefit: 'High-density concurrent execution ensures full usage of every granted track possession window.',
  },
  {
    parameter: 'Unused / Wasted Window Time',
    scope: 'Productivity Loss Reduction',
    before: '22% idle possession (15h lost)',
    after: '7% reserve buffer (3h reserve)',
    improvement: '68.2% Waste Eliminated',
    direction: 'down',
    benefit: 'Machine telemetry & gang dispatch synchronization prevents idle track time between work crews.',
  },
  {
    parameter: 'Timetable Interlocking Conflicts',
    scope: 'Train Overlaps & Safety Risks',
    before: '11 train overlaps detected',
    after: '3 minor overlaps (0 express detentions)',
    improvement: '72.7% Conflict Clearance',
    direction: 'down',
    benefit: 'Zero punctuality loss for Rajdhani, Shatabdi, and Vande Bharat express train movements.',
  },
  {
    parameter: 'Inter-Departmental Coordination',
    scope: 'Administrative Requisition Latency',
    before: '48 hours manual paper exchange',
    after: 'Instant automated AI alignment',
    improvement: 'Real-Time Synchronization',
    direction: 'up',
    benefit: 'Instant digital alignment replaces multi-day memo exchanges between P-Way, S&T, and TRD controllers.',
  },
];

export function CorridorScheduleView() {
  const { corridors } = useApp();
  const [selectedCorridor, setSelectedCorridor] = useState(corridors[0]?.code || 'C101');
  const [activeTab, setActiveTab] = useState('timeline');

  const allTrains = [...PASSENGER_TRAINS, ...GOODS_TRAINS];

  return (
    <div className="space-y-5 font-sans" style={{ color: IR.text }}>
      {/* ── Command Header ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${IR.navy} 0%, ${IR.blue} 50%, ${IR.royal} 100%)` }} />

        <div className="p-5" style={{ borderBottom: `1px solid ${IR.border}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
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
                  Corridor Visualizer
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: IR.navy }}>
                Corridor Timetable &amp; Line Block Possession Timeline
              </h1>
              <p className="text-xs mt-1" style={{ color: IR.sub }}>
                Visualizing passenger &amp; goods train density curves alongside maintenance block possessions across trunk corridors
              </p>
            </div>

            {/* Corridor Selector Pill */}
            <div
              className="flex items-center gap-1.5 p-1 rounded-lg border"
              style={{ background: IR.palebg, borderColor: IR.border }}
            >
              {['C101', 'C102', 'C103', 'C104'].map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedCorridor(code)}
                  className="px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer"
                  style={
                    selectedCorridor === code
                      ? { background: IR.navy, color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                      : { color: IR.sub, background: 'transparent' }
                  }
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Corridor Summary Card Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: `1px solid ${IR.border}` }}>
          <div className="p-4 border-r" style={{ borderColor: IR.border, background: 'white' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: IR.sub }}>
              Active Corridor
            </span>
            <div className="text-lg font-black mt-1" style={{ color: IR.navy }}>
              Corridor {selectedCorridor}
            </div>
            <div className="text-xs mt-0.5" style={{ color: IR.sub }}>
              Double Line Electrified · High Density Trunk
            </div>
          </div>

          <div className="p-4 border-r" style={{ borderColor: IR.border, background: IR.palebg }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: IR.sub }}>
              Daily Timetable Movements
            </span>
            <div className="text-lg font-black mt-1" style={{ color: IR.blue }}>
              {allTrains.filter((t) => t.corridor === selectedCorridor).length} Trains Scheduled
            </div>
            <div className="text-xs mt-0.5" style={{ color: IR.sub }}>
              {PASSENGER_TRAINS.filter((t) => t.corridor === selectedCorridor).length} Passenger ·{' '}
              {GOODS_TRAINS.filter((t) => t.corridor === selectedCorridor).length} Goods
            </div>
          </div>

          <div className="p-4" style={{ background: 'white' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: IR.sub }}>
              Block Windows Available
            </span>
            <div className="text-lg font-black mt-1" style={{ color: IR.green }}>
              {BLOCK_WINDOWS.filter((b) => b.corridor === selectedCorridor && b.status === 'Available').length} Windows Open
            </div>
            <div className="text-xs mt-0.5" style={{ color: IR.sub }}>
              Shadow windows during non-peak headway gaps
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs & View Container ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: `1px solid ${IR.border}` }}>
        <div style={{ height: 3, background: IR.blue }} />

        {/* Tab Headers */}
        <div
          className="flex border-b gap-6 text-sm font-bold px-5 pt-3"
          style={{ background: IR.palebg, borderColor: IR.border }}
        >
          <button
            onClick={() => setActiveTab('timeline')}
            className="pb-3 border-b-2 transition cursor-pointer flex items-center gap-2"
            style={
              activeTab === 'timeline'
                ? { borderColor: IR.blue, color: IR.blue }
                : { borderColor: 'transparent', color: IR.sub }
            }
          >
            <IconClock className="w-4 h-4" /> Corridor Timeline
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className="pb-3 border-b-2 transition cursor-pointer flex items-center gap-2"
            style={
              activeTab === 'comparison'
                ? { borderColor: IR.blue, color: IR.blue }
                : { borderColor: 'transparent', color: IR.sub }
            }
          >
            <IconAI className="w-4 h-4" /> Before vs AI Optimized Comparison
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5">
          {activeTab === 'timeline' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: IR.border }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: IR.text }}>
                  Corridor Timeline: Hours 10:00 to 18:00
                </span>
                <span className="text-xs" style={{ color: IR.sub }}>
                  Hover blocks or train slots to inspect pathing
                </span>
              </div>
              <CorridorTimeline
                trains={allTrains}
                blocks={BLOCK_WINDOWS}
                corridors={['C101', 'C102', 'C103', 'C104']}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Section Intro */}
              <div className="pb-3 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2" style={{ borderColor: IR.border }}>
                <div>
                  <h3 className="text-base font-black tracking-tight" style={{ color: IR.navy }}>
                    Operational Impact — Before vs AI Synchronized Optimization
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: IR.sub }}>
                    Quantified sectional efficiency gains comparing uncoordinated departmental possessions against synchronized AI shadow bundling
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 text-xs font-bold rounded shrink-0"
                  style={{ background: '#F0FDF4', color: IR.green, border: '1px solid #BBF7D0' }}
                >
                  ✓ High Operational Benefit
                </span>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border text-center" style={{ background: IR.palebg, borderColor: IR.border }}>
                  <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Total Possession Blocks</div>
                  <div className="text-xl font-black mt-1" style={{ color: IR.navy }}>32 → 21</div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: IR.green }}>↓ 34.4% Fewer Blocks</div>
                </div>

                <div className="p-3.5 rounded-lg border text-center" style={{ background: 'white', borderColor: IR.border }}>
                  <div className="text-[10px] font-bold uppercase" style={{ color: IR.sub }}>Possession Hours Required</div>
                  <div className="text-xl font-black mt-1" style={{ color: IR.blue }}>68h → 46h</div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: IR.green }}>↓ 22 Hours Restored</div>
                </div>

                <div className="p-3.5 rounded-lg border text-center" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <div className="text-[10px] font-bold uppercase" style={{ color: IR.green }}>Average Block Utilization</div>
                  <div className="text-xl font-black mt-1" style={{ color: IR.green }}>61% → 93%</div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: IR.green }}>↑ +32.0% Efficiency Gain</div>
                </div>

                <div className="p-3.5 rounded-lg border text-center" style={{ background: '#FFF5F5', borderColor: '#FECACA' }}>
                  <div className="text-[10px] font-bold uppercase" style={{ color: IR.red }}>Timetable Conflicts</div>
                  <div className="text-xl font-black mt-1" style={{ color: IR.red }}>11 → 3</div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: IR.green }}>↓ 72.7% Overlaps Cleared</div>
                </div>
              </div>

              {/* Comprehensive Bordered Comparison Table */}
              <div className="rounded-lg overflow-hidden border shadow-xs" style={{ borderColor: IR.border }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b text-[11px] uppercase font-bold" style={{ background: IR.palebg, borderColor: IR.border, color: IR.sub }}>
                        <th className="p-3.5 border-r" style={{ borderColor: IR.border, width: '22%' }}>
                          Operational Parameter / Metric
                        </th>
                        <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border, width: '20%' }}>
                          Before Optimization (Manual)
                        </th>
                        <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border, width: '20%' }}>
                          After (RailTech AI Synchronized)
                        </th>
                        <th className="p-3.5 border-r text-center" style={{ borderColor: IR.border, width: '18%' }}>
                          Net Improvement
                        </th>
                        <th className="p-3.5" style={{ width: '20%' }}>
                          Operational Impact &amp; Benefit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: IR.border }}>
                      {OPERATIONAL_IMPACT_METRICS.map((row, index) => (
                        <tr
                          key={row.parameter}
                          className="transition-colors"
                          style={{ background: index % 2 === 0 ? 'white' : IR.palebg }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = IR.lightbg)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? 'white' : IR.palebg)}
                        >
                          {/* Metric / Parameter */}
                          <td className="p-3.5 border-r" style={{ borderColor: IR.border }}>
                            <div className="font-bold text-slate-900" style={{ color: IR.text }}>
                              {row.parameter}
                            </div>
                            <div className="text-[11px] mt-0.5" style={{ color: IR.sub }}>
                              {row.scope}
                            </div>
                          </td>

                          {/* Before */}
                          <td className="p-3.5 border-r text-center font-medium" style={{ borderColor: IR.border, color: '#991B1B' }}>
                            <span className="px-2 py-1 rounded border inline-block" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
                              {row.before}
                            </span>
                          </td>

                          {/* After */}
                          <td className="p-3.5 border-r text-center font-bold" style={{ borderColor: IR.border, color: IR.navy }}>
                            <span className="px-2.5 py-1 rounded border inline-flex items-center gap-1.5" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: IR.green }}>
                              <span>✓</span>
                              <span>{row.after}</span>
                            </span>
                          </td>

                          {/* Net Improvement */}
                          <td className="p-3.5 border-r text-center" style={{ borderColor: IR.border }}>
                            <span
                              className="px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider border inline-block"
                              style={{ background: '#F0FDF4', color: IR.green, borderColor: '#BBF7D0' }}
                            >
                              {row.direction === 'down' ? '↓ ' : '↑ '}
                              {row.improvement}
                            </span>
                          </td>

                          {/* Benefit */}
                          <td className="p-3.5" style={{ color: IR.sub }}>
                            <p className="leading-snug text-[11px]">
                              {row.benefit}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Explanatory Footnote Bar */}
                <div className="p-3 flex items-center justify-between border-t text-[11px]" style={{ background: IR.lightbg, borderColor: '#BFDBFE', color: IR.blue }}>
                  <div className="flex items-center gap-2">
                    <IconInfo className="w-4 h-4 shrink-0" />
                    <span>Based on synthetic divisional timetable simulation across high-density corridors C101–C104.</span>
                  </div>
                  <span className="font-semibold hidden sm:inline" style={{ color: IR.navy }}>
                    RailTech Multi-Objective Optimization Engine
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CorridorScheduleView;

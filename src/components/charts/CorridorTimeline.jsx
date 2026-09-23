// ============================================================
// CORRIDOR TIMELINE — Pure SVG interactive timeline
// ============================================================
import { useState } from 'react';

const HOURS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const START_HOUR = 10;
const TOTAL_HOURS = 8;

const COLORS = {
  passenger:  { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  goods:      { fill: '#fef9c3', stroke: '#ca8a04', text: '#713f12' },
  available:  { fill: '#dcfce7', stroke: '#16a34a', text: '#166534' },
  reserved:   { fill: '#fef3c7', stroke: '#d97706', text: '#92400e' },
  active:     { fill: '#fed7aa', stroke: '#ea580c', text: '#7c2d12' },
  conflict:   { fill: '#fee2e2', stroke: '#ef4444', text: '#991b1b' },
  maintenance:{ fill: '#ede9fe', stroke: '#7c3aed', text: '#4c1d95' },
};

function timeToFraction(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return ((h + m / 60) - START_HOUR) / TOTAL_HOURS;
}

export function CorridorTimeline({ trains = [], blocks = [], corridors = ['C101','C102','C103','C104'], onBlockClick }) {
  const [hovered, setHovered] = useState(null);

  const ROW_H = 44;
  const LABEL_W = 60;
  const TOP_PAD = 28;
  const svgH = TOP_PAD + corridors.length * ROW_H + 8;

  return (
    <div className="rt-timeline-scroll" style={{ minWidth: 650 }}>
      <svg
        viewBox={`0 0 820 ${svgH}`}
        width="100%"
        style={{ display: 'block', minWidth: 650 }}
        role="img"
        aria-label="Corridor Timeline"
      >
        {/* Hour columns */}
        {HOURS.map((h, i) => {
          const x = LABEL_W + i * ((820 - LABEL_W) / (HOURS.length - 1));
          return (
            <g key={h}>
              <line x1={x} y1={TOP_PAD - 8} x2={x} y2={svgH - 4} stroke="#f1f5f9" strokeWidth="1"/>
              <text x={x} y={TOP_PAD - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">{h}</text>
            </g>
          );
        })}

        {/* Rows */}
        {corridors.map((corridor, ri) => {
          const y = TOP_PAD + ri * ROW_H;
          const barY = y + 8;
          const barH = ROW_H - 16;
          const barW = 820 - LABEL_W - 4;

          // filter items for this corridor
          const cTrains = trains.filter(t => t.corridor === corridor);
          const cBlocks = blocks.filter(b => b.corridor === corridor);

          return (
            <g key={corridor}>
              {/* Row background */}
              <rect x={0} y={y} width={820} height={ROW_H} fill={ri % 2 === 0 ? '#fafafa' : '#fff'}/>
              {/* Corridor label */}
              <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="#374151">{corridor}</text>

              {/* Base bar */}
              <rect x={LABEL_W} y={barY} width={barW} height={barH} rx="3" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="0.5"/>

              {/* Block windows */}
              {cBlocks.map(block => {
                const type = block.status === 'Available' ? 'available'
                  : block.status === 'Reserved' ? 'reserved'
                  : block.status === 'Active' ? 'active'
                  : block.status === 'Conflict' ? 'conflict'
                  : 'maintenance';
                const col = COLORS[type];
                const fx = LABEL_W + timeToFraction(block.start) * barW;
                const fw = timeToFraction(block.end) * barW - timeToFraction(block.start) * barW;
                return (
                  <g key={block.id} style={{ cursor: 'pointer' }}
                    onClick={() => onBlockClick && onBlockClick(block)}
                    onMouseEnter={() => setHovered(block.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <rect x={fx} y={barY + 1} width={Math.max(fw, 4)} height={barH - 2} rx="3"
                      fill={col.fill} stroke={hovered === block.id ? col.stroke : col.stroke}
                      strokeWidth={hovered === block.id ? 1.5 : 0.8}
                    />
                    {fw > 30 && (
                      <text x={fx + fw / 2} y={barY + barH / 2 + 4} textAnchor="middle" fontSize="9" fill={col.text} fontWeight="500">
                        {block.status}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Trains */}
              {cTrains.map(train => {
                const type = train.type === 'Passenger' ? 'passenger' : 'goods';
                const col = COLORS[type];
                const fx = LABEL_W + timeToFraction(train.start) * barW;
                const fw = timeToFraction(train.end) * barW - timeToFraction(train.start) * barW;
                const trainBarY = type === 'passenger' ? barY + 1 : barY + barH / 2;
                const trainBarH = (barH - 2) / 2;
                return (
                  <g key={train.id} style={{ cursor: 'default' }}
                    onMouseEnter={() => setHovered(train.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <rect x={fx} y={trainBarY} width={Math.max(fw, 4)} height={trainBarH - 1} rx="2"
                      fill={col.fill} stroke={col.stroke} strokeWidth="0.8"
                    />
                    {fw > 24 && (
                      <text x={fx + 3} y={trainBarY + trainBarH / 2 + 3} fontSize="8" fill={col.text}>
                        {train.id}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend */}
        {[
          { label: 'Passenger', color: COLORS.passenger },
          { label: 'Goods', color: COLORS.goods },
          { label: 'Available Block', color: COLORS.available },
          { label: 'Reserved', color: COLORS.reserved },
          { label: 'Conflict', color: COLORS.conflict },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(${LABEL_W + i * 130}, ${svgH - 0})`}>
            <rect x={0} y={0} width={10} height={10} rx="2" fill={item.color.fill} stroke={item.color.stroke} strokeWidth="0.8"/>
            <text x={14} y={9} fontSize="9" fill="#6b7280">{item.label}</text>
          </g>
        ))}
      </svg>
      {/* Legend row below */}
      <div className="flex flex-wrap gap-4 mt-3 px-1">
        {[
          { label: 'Passenger Train', color: '#dbeafe', stroke: '#3b82f6' },
          { label: 'Goods Train', color: '#fef9c3', stroke: '#ca8a04' },
          { label: 'Available Block', color: '#dcfce7', stroke: '#16a34a' },
          { label: 'Reserved Block', color: '#fef3c7', stroke: '#d97706' },
          { label: 'Conflict', color: '#fee2e2', stroke: '#ef4444' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div style={{ width: 12, height: 10, background: item.color, border: `1px solid ${item.stroke}`, borderRadius: 2 }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Before / After Comparison SVG
export function BeforeAfterComparison({ before, after }) {
  const metrics = [
    { label: 'Total Blocks', bVal: before.blocks, aVal: after.blocks, lower: true },
    { label: 'Block-Hours', bVal: before.blockHours, aVal: after.blockHours, lower: true },
    { label: 'Unused Time', bVal: `${before.unusedPercent}%`, aVal: `${after.unusedPercent}%`, lower: true },
    { label: 'Conflicts', bVal: before.conflicts, aVal: after.conflicts, lower: true },
    { label: 'Avg Utilization', bVal: `${before.avgUtilization}%`, aVal: `${after.avgUtilization}%`, lower: false },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pb-1 border-b border-gray-100">
        <span>Metric</span>
        <span className="text-center">Before</span>
        <span className="text-center" style={{ color: '#1e4aa8' }}>After (RailTech)</span>
      </div>
      {metrics.map(m => {
        const improved = m.lower
          ? (parseFloat(m.aVal) < parseFloat(m.bVal))
          : (parseFloat(m.aVal) > parseFloat(m.bVal));
        return (
          <div key={m.label} className="grid grid-cols-3 gap-2 items-center text-sm py-1">
            <span className="text-gray-600 font-medium">{m.label}</span>
            <span className="text-center font-semibold text-gray-700">{m.bVal}</span>
            <span className="text-center font-bold flex items-center justify-center gap-1"
              style={{ color: improved ? '#166534' : '#991b1b' }}>
              {m.aVal}
              <span className="text-[10px]">{improved ? '↓' : '↑'}</span>
            </span>
          </div>
        );
      })}
      <div className="text-[10px] text-gray-400 mt-2 italic">
        Illustrative results based on synthetic demo data.
      </div>
    </div>
  );
}

// Multi-Department Bundle Visual
export function MultideptBundleCard({ departments = [], block, utilization = 100 }) {
  return (
    <div className="rt-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Before</div>
          <div className="space-y-1.5">
            {departments.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-[11px] font-medium text-gray-600 w-28 truncate">{d.name}</div>
                <div style={{
                  height: 20,
                  width: 80,
                  background: '#dbeafe',
                  border: '1px solid #3b82f6',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  color: '#1e40af',
                  fontWeight: 600,
                }}>
                  {d.duration} min
                </div>
                <div className="text-[10px] text-gray-400">→ Block</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center mx-3 text-gray-300">
          <div className="text-2xl font-light">→</div>
        </div>

        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">After</div>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '2px solid #1e4aa8',
            borderRadius: 8,
            padding: '12px',
          }}>
            <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide mb-1">One Coordinated Block</div>
            {block && (
              <>
                <div className="text-sm font-bold text-navy-900">{block.corridor}</div>
                <div className="text-xs text-blue-700">{block.start} – {block.end}</div>
                <div className="text-[10px] text-blue-600 mt-1">{departments.map(d => d.name).join(' + ')}</div>
                <div className="text-[10px] font-semibold text-green-700 mt-1">Utilization: {utilization}%</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-navy-800">{departments.length}</div>
          <div className="text-[10px] text-gray-500">Depts</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-navy-800">{departments.length}</div>
          <div className="text-[10px] text-gray-500">Activities</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-navy-800">1</div>
          <div className="text-[10px] text-gray-500">Block</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{utilization}%</div>
          <div className="text-[10px] text-gray-500">Utilization</div>
        </div>
      </div>
    </div>
  );
}

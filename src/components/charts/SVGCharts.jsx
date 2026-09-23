// ============================================================
// RAILTECH SVG CHARTS — Reusable data visualization components
// Pure SVG, no external chart libraries
// ============================================================

// ---- Utility ----
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

// ---- SVG Line Chart ----
export function SVGLineChart({
  data = [],
  width = 400,
  height = 120,
  color = '#1e4aa8',
  color2 = '#27ae60',
  label = '',
  label2 = '',
  yMin,
  yMax,
  className = '',
}) {
  if (!data.length) return null;
  const pad = { top: 10, right: 16, bottom: 24, left: 32 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const allValues = data.flatMap(d => [d.value, d.value2].filter(v => v !== undefined));
  const dataMin = yMin ?? Math.min(...allValues);
  const dataMax = yMax ?? Math.max(...allValues);
  const range = dataMax - dataMin || 1;

  function toX(i) { return pad.left + (i / (data.length - 1)) * W; }
  function toY(v) { return pad.top + H - ((v - dataMin) / range) * H; }

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
  const points2 = data.filter(d => d.value2 !== undefined)
    .map((d, i) => `${toX(i)},${toY(d.value2)}`).join(' ');

  // area fill
  const areaPath = `M${toX(0)},${toY(data[0].value)} ${data.map((d, i) => `L${toX(i)},${toY(d.value)}`).join(' ')} L${toX(data.length - 1)},${pad.top + H} L${toX(0)},${pad.top + H} Z`;

  const ticks = [0, 0.5, 1].map(t => dataMin + t * range);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      className={`overflow-visible ${className}`}
      role="img"
      aria-label={label || 'Line chart'}
    >
      {/* Y-axis ticks */}
      {ticks.map((v, i) => (
        <g key={i}>
          <text
            x={pad.left - 4}
            y={toY(v) + 4}
            textAnchor="end"
            fontSize="9"
            fill="#9ca3af"
          >{Math.round(v)}</text>
          <line x1={pad.left} y1={toY(v)} x2={pad.left + W} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1"/>
        </g>
      ))}
      {/* Area fill */}
      <path d={areaPath} fill={color} fillOpacity="0.08"/>
      {/* Line 1 */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Line 2 (optional) */}
      {points2 && (
        <polyline
          points={points2}
          fill="none"
          stroke={color2}
          strokeWidth="2"
          strokeDasharray="4 2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Data points */}
      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.value)} r="3" fill={color} />
      ))}
      {/* X-axis labels */}
      {data.map((d, i) => (
        i % Math.ceil(data.length / 5) === 0 && (
          <text key={i} x={toX(i)} y={height - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {d.label}
          </text>
        )
      ))}
      {/* Legend */}
      {label && (
        <text x={pad.left} y={10} fontSize="9" fill={color} fontWeight="600">{label}</text>
      )}
      {label2 && (
        <g>
          <line x1={pad.left + 80} y1={6} x2={pad.left + 92} y2={6} stroke={color2} strokeWidth="1.5" strokeDasharray="3 1"/>
          <text x={pad.left + 96} y={10} fontSize="9" fill={color2} fontWeight="600">{label2}</text>
        </g>
      )}
    </svg>
  );
}

// ---- SVG Bar Chart ----
export function SVGBarChart({
  data = [],
  width = 400,
  height = 120,
  colors = ['#1e4aa8', '#27ae60', '#e67e22'],
  className = '',
}) {
  if (!data.length) return null;
  const pad = { top: 10, right: 16, bottom: 28, left: 36 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const allValues = data.flatMap(d => Array.isArray(d.value) ? d.value : [d.value]).filter(v => v !== undefined);
  const maxVal = Math.max(...allValues, 1);

  const barGroupW = W / data.length;
  const barsPerGroup = Array.isArray(data[0]?.value) ? data[0].value.length : 1;
  const barW = Math.min((barGroupW - 8) / barsPerGroup, 24);
  const gap = 3;

  function toY(v) { return pad.top + H - (v / maxVal) * H; }
  function toH(v) { return (v / maxVal) * H; }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      className={`overflow-visible ${className}`}
      role="img"
      aria-label="Bar chart"
    >
      {/* Y grid */}
      {[0, 0.5, 1].map((t, i) => {
        const v = t * maxVal;
        return (
          <g key={i}>
            <text x={pad.left - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{Math.round(v)}</text>
            <line x1={pad.left} y1={toY(v)} x2={pad.left + W} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1"/>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, gi) => {
        const values = Array.isArray(d.value) ? d.value : [d.value];
        const groupX = pad.left + gi * barGroupW + barGroupW / 2;
        const startX = groupX - (barsPerGroup * (barW + gap) - gap) / 2;
        return (
          <g key={gi}>
            {values.map((v, bi) => (
              <g key={bi}>
                <rect
                  x={startX + bi * (barW + gap)}
                  y={toY(v)}
                  width={barW}
                  height={toH(v)}
                  rx="2"
                  fill={colors[bi % colors.length]}
                  fillOpacity="0.85"
                />
                <text
                  x={startX + bi * (barW + gap) + barW / 2}
                  y={toY(v) - 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill={colors[bi % colors.length]}
                >{v}</text>
              </g>
            ))}
            <text x={groupX} y={height - 8} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- SVG Donut Chart ----
export function SVGDonutChart({
  segments = [],
  size = 120,
  strokeWidth = 20,
  className = '',
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cumulative = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Donut chart"
    >
      {segments.map((seg, i) => {
        const fraction = seg.value / total;
        const offset = circumference * (1 - cumulative);
        const dash = circumference * fraction - 2;
        cumulative += fraction;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, dash)} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      {/* center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">Total</text>
    </svg>
  );
}

// ---- Progress Bar ----
export function ProgressBar({ value, max = 100, color = '#1e4aa8', height = 6, className = '' }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <div className={`rt-progress-bar ${className}`} style={{ height }}>
      <div
        className="rt-progress-fill"
        style={{ width: `${pct}%`, background: color, height }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}

// ---- Sparkline ----
export function Sparkline({ data = [], color = '#1e4aa8', width = 80, height = 28 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const toX = i => (i / (data.length - 1)) * width;
  const toY = v => height - ((v - min) / range) * height;
  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

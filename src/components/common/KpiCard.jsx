// KpiCard — metric display card
export function KpiCard({ label, value, delta, deltaLabel, icon, color = 'navy', className = '' }) {
  const colorMap = {
    navy: '#1e4aa8',
    red: '#c0392b',
    green: '#27ae60',
    amber: '#f39c12',
    saffron: '#e67e22',
    gray: '#6b7280',
    purple: '#7c3aed',
  };
  const accent = colorMap[color] || colorMap.navy;

  return (
    <div className={`rt-kpi ${className}`} style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="rt-kpi-label">{label}</div>
          <div className="rt-kpi-value mt-1">{value}</div>
          {(delta !== undefined || deltaLabel) && (
            <div className="rt-kpi-delta mt-1">
              {delta !== undefined && <span style={{ color: delta >= 0 ? '#27ae60' : '#c0392b' }}>
                {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}
              </span>}
              {deltaLabel && <span className="text-gray-400 ml-1">{deltaLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div style={{ color: accent, opacity: 0.6 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

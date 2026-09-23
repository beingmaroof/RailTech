// StatusBadge — renders a styled badge for status/priority values
const STATUS_CLASSES = {
  'Critical': 'badge-critical',
  'High': 'badge-high',
  'Medium': 'badge-medium',
  'Low': 'badge-low',
  'Pending AI Review': 'badge-pending',
  'Pending': 'badge-pending',
  'Scheduled': 'badge-active',
  'In Progress': 'badge-progress',
  'Completed': 'badge-completed',
  'Approved': 'badge-approved',
  'Rejected': 'badge-rejected',
  'Modified': 'badge-modified',
  'AI Recommended': 'badge-ai',
  'Active': 'badge-active',
  'No Conflict': 'badge-completed',
  'Warning': 'badge-high',
  'Attention': 'badge-medium',
  'Needs Review': 'badge-medium',
  'Alternative': 'badge-pending',
  'Not Recommended': 'badge-pending',
  'Available': 'badge-completed',
  'Used': 'badge-active',
  'Reserved': 'badge-medium',
  'On Time': 'badge-completed',
  'Delayed': 'badge-high',
  'AI Options Ready': 'badge-ai',
  'Awaiting Review': 'badge-pending',
  'Modified Window': 'badge-modified',
  'Not Advisable': 'badge-rejected',
  'Pending Review': 'badge-pending',
  'AI Analysis': 'badge-ai',
  'Assigned': 'badge-active',
  'Advisable': 'badge-approved',
  'Best Option': 'badge-ai',
};

export function StatusBadge({ status, className = '' }) {
  const cls = STATUS_CLASSES[status] || 'badge-pending';
  return (
    <span className={`rt-badge ${cls} ${className}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const cls = STATUS_CLASSES[priority] || 'badge-pending';
  return (
    <span className={`rt-badge ${cls} ${className}`}>
      {priority}
    </span>
  );
}

export function RoleBadge({ role, roleLabel }) {
  const colors = {
    admin: 'bg-navy-800 text-white',
    engineering: 'bg-blue-600 text-white',
    snt: 'bg-amber-600 text-white',
    traction: 'bg-orange-600 text-white',
    'control-office': 'bg-green-700 text-white',
  };
  const cls = colors[role] || 'bg-gray-500 text-white';
  return (
    <span className={`rt-badge ${cls}`} style={{ background: undefined }}>
      {roleLabel}
    </span>
  );
}

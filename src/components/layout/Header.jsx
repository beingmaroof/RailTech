import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { RailTechLogo, IconBell, IconMenu, IconClose, IconCheck } from '../icons/Icons.jsx';
import { notificationService } from '../../services/notificationService.js';

const ROLE_LABELS = {
  admin:           'Admin / Management',
  engineering:     'Engineering / Track',
  snt:             'Signal & Telecom',
  traction:        'Traction',
  'control-office': 'Control Office',
};

// Indian Railways palette — role accent colors
const ROLE_COLORS = {
  admin:            '#123A8C',
  engineering:      '#0056B3',
  snt:              '#D88900',
  traction:         '#C62828',
  'control-office': '#16804B',
};

export function Header({ title, subtitle, onMenuToggle }) {
  const { user } = useAuth();
  const { notifications } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  function handleMarkAllRead() {
    notificationService.markAllRead();
    setShowNotifs(false);
  }

  const roleColor = ROLE_COLORS[user?.role] || '#123A8C';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: '#ffffff',
        borderBottom: '1px solid #D9E2EC',
        borderTop: '3px solid #123A8C',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        paddingLeft: 'calc(var(--sidebar-width) + 16px)',
        paddingRight: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      {/* Mobile menu toggle */}
      <button
        className="md:hidden flex-shrink-0 p-1.5 rounded hover:bg-blue-50 transition-colors"
        style={{ color: '#5E6C84' }}
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <IconMenu size={20} />
      </button>

      {/* Title area */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-bold text-sm truncate" style={{ color: '#172B4D' }}>{title}</div>
        )}
        {subtitle && (
          <div className="text-xs truncate hidden sm:block" style={{ color: '#5E6C84' }}>{subtitle}</div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ color: '#5E6C84' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E8F1FF'; e.currentTarget.style.color = '#123A8C'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5E6C84'; }}
            onClick={() => setShowNotifs(v => !v)}
            aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
          >
            <IconBell size={16} />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: '#C62828' }}
                aria-hidden="true"
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ border: '1px solid #D9E2EC', boxShadow: '0 8px 24px rgba(11,31,58,0.15)' }}
              role="dialog"
              aria-label="Notifications"
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: '#D9E2EC', background: '#F4F7FA' }}
              >
                <span className="font-bold text-sm" style={{ color: '#172B4D' }}>Notifications</span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: '#0056B3' }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    style={{ color: '#5E6C84' }}
                  >
                    <IconClose size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: '#5E6C84' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b text-sm transition-colors"
                      style={{
                        borderColor: '#F4F7FA',
                        background: !n.read ? '#E8F1FF' : 'white',
                      }}
                    >
                      <div style={{ color: '#172B4D' }}>{n.message}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#5E6C84' }}>
                        {new Date(n.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6" style={{ background: '#D9E2EC' }} />

        {/* User chip */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: roleColor }}
            aria-hidden="true"
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold leading-tight" style={{ color: '#172B4D' }}>{user?.name}</div>
            <div
              className="text-[10px] font-semibold leading-tight"
              style={{ color: roleColor }}
            >
              {ROLE_LABELS[user?.role] || user?.roleLabel}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

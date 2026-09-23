import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  RailTechLogo, IconDashboard, IconMaintenance, IconTrack, IconAI,
  IconBlock, IconReport, IconAnalytics,
  IconTrain, IconLogout, IconSignal, IconTraction,
} from '../icons/Icons.jsx';

const NAV_BY_ROLE = {
  admin: [
    {
      section: 'Zonal Command HQ',
      items: [
        { to: '/admin/dashboard',  label: 'HQ Executive Dashboard',      icon: IconDashboard },
        { to: '/admin/ai-planning', label: 'AI Block Bundling Engine',   icon: IconAI },
        { to: '/admin/analytics',  label: 'Zonal Performance & Reports', icon: IconAnalytics },
      ],
    },
  ],
  engineering: [
    {
      section: 'Track Maintenance',
      items: [
        { to: '/engineering/dashboard', label: 'Track Maintenance Portal', icon: IconMaintenance },
      ],
    },
  ],
  snt: [
    {
      section: 'Signal & Telecom Operations',
      items: [
        { to: '/snt/dashboard', label: 'Signal & Telecom Department', icon: IconSignal },
      ],
    },
  ],
  traction: [
    {
      section: 'Electrical TRD Operations',
      items: [
        { to: '/traction/dashboard', label: 'Traction Department', icon: IconTraction },
      ],
    },
  ],
  control: [
    {
      section: 'Control Office',
      items: [
        { to: '/control/dashboard', label: 'Operations Dashboard',  icon: IconBlock },
        { to: '/control/schedule',  label: 'Corridor Timeline', icon: IconTrain },
      ],
    },
  ],
};

export function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role || 'admin';
  const navSections = NAV_BY_ROLE[userRole] || NAV_BY_ROLE.admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container — Indian Railways Navy */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out shadow-lg ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: '#0B1F3A' }}
      >
        {/* Brand Header */}
        <div
          className="p-4 flex items-center gap-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <RailTechLogo size={36} textVisible={false} />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-white font-black text-sm tracking-tight">RailTech</span>
            <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: '#FDCC0D' }}>
              Railway Operations
            </span>
          </div>
        </div>

        {/* Role Banner */}
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ background: 'rgba(18,58,140,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
            style={{ background: '#0056B3' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-[11px] font-semibold truncate">{user?.name || 'RailTech User'}</div>
            <div className="text-[9px] font-medium truncate" style={{ color: 'rgba(253,204,13,0.85)' }}>
              {user?.roleLabel || user?.department}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navSections.map((sec, idx) => (
            <div key={sec.section || idx}>
              {sec.section && (
                <div
                  className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {sec.section}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'text-white font-bold'
                            : 'hover:text-white'
                        }`
                      }
                      style={({ isActive }) =>
                        isActive
                          ? { background: '#123A8C', borderLeft: '3px solid #FDCC0D', paddingLeft: '10px' }
                          : { color: 'rgba(255,255,255,0.65)', borderLeft: '3px solid transparent', paddingLeft: '10px' }
                      }
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="p-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)' }}
        >
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: 'rgba(198,40,40,0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(198,40,40,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(198,40,40,0.35)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(198,40,40,0.15)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <IconLogout className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

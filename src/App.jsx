import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppContext.jsx';

import AppShell from './components/layout/AppShell.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AIPlanningWorkspace from './pages/admin/AIPlanningWorkspace.jsx';
import AnalyticsReports from './pages/admin/AnalyticsReports.jsx';
import EngineeringDashboard from './pages/engineering/EngineeringDashboard.jsx';
import ControlOfficeDashboard from './pages/control/ControlOfficeDashboard.jsx';
import CorridorScheduleView from './pages/control/CorridorScheduleView.jsx';
import SntDashboard from './pages/snt/SntDashboard.jsx';
import TractionDashboard from './pages/traction/TractionDashboard.jsx';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating RailTech Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to user's default allowed portal
    if (user.role === 'engineering') return <Navigate to="/engineering/dashboard" replace />;
    if (user.role === 'snt') return <Navigate to="/snt/dashboard" replace />;
    if (user.role === 'traction') return <Navigate to="/traction/dashboard" replace />;
    if (user.role === 'control') return <Navigate to="/control/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

// Index redirect based on role
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'engineering') return <Navigate to="/engineering/dashboard" replace />;
  if (user?.role === 'snt') return <Navigate to="/snt/dashboard" replace />;
  if (user?.role === 'traction') return <Navigate to="/traction/dashboard" replace />;
  if (user?.role === 'control') return <Navigate to="/control/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected App Shell Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ai-planning"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AIPlanningWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsReports />
                </ProtectedRoute>
              }
            />

            {/* Strict Department Portals - Mutually Exclusive */}
            <Route
              path="/engineering/dashboard"
              element={
                <ProtectedRoute allowedRoles={['engineering']}>
                  <EngineeringDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/snt/dashboard"
              element={
                <ProtectedRoute allowedRoles={['snt']}>
                  <SntDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/traction/dashboard"
              element={
                <ProtectedRoute allowedRoles={['traction']}>
                  <TractionDashboard />
                </ProtectedRoute>
              }
            />

            {/* Traffic Control Office Routes */}
            <Route
              path="/control/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'control']}>
                  <ControlOfficeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/control/schedule"
              element={
                <ProtectedRoute allowedRoles={['admin', 'control']}>
                  <CorridorScheduleView />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

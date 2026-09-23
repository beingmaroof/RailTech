import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { ToastContainer } from '../common/Modal.jsx';
import { useApp } from '../../context/AppContext.jsx';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useApp();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100 text-slate-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default AppShell;

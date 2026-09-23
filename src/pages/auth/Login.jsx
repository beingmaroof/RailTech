import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { RailTechLogo, IconLock, IconUser, IconMail, IconWarning, IconCheck, IconClose, IconEye, IconEyeOff } from '../../components/icons/Icons.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export function Login() {
  const navigate = useNavigate();
  const { login, roles, resetPassword } = useAuth();

  // Empty fields by default (no prefilled values)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select your designation/role portal from the dropdown list.');
      return;
    }
    if (!identifier.trim()) {
      setError('Please enter your official username or designation ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const user = login(identifier, password, selectedRole);

      // Route based on role
      if (selectedRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (selectedRole === 'control') {
        navigate('/control/dashboard', { replace: true });
      } else if (selectedRole === 'snt') {
        navigate('/snt/dashboard', { replace: true });
      } else if (selectedRole === 'traction') {
        navigate('/traction/dashboard', { replace: true });
      } else {
        navigate('/engineering/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    const res = resetPassword(forgotInput);
    setForgotSuccess(res.message);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-800 font-sans">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        {/* Logo & Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src="/railtech-logo.png"
            alt="RailTech Logo"
            className="w-36 h-36 object-contain rounded-full shadow-md border-2 border-slate-100 mb-3"
          />
          <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mt-1">
            INTELLIGENT RAILWAY OPERATIONS & MAINTENANCE PLATFORM
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <IconWarning className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Dropdown Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Designation / Role Portal <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="" disabled>-- Select --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Identifier Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Username / Designation ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <IconUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Enter your Username or ID"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotSuccess('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <IconLock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Enter Password (e.g. Admin@railtech#2026)"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Sign Up Redirect Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
          Need official portal access?{' '}
          <Link to="/signup" className="text-blue-700 hover:text-blue-900 font-bold underline ml-1">
            Create Official Account / Sign Up
          </Link>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-6 text-center text-xs text-slate-400">
        RailTech Zonal Platform v1.0 • Railway Operations & Maintenance System
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Official Password"
        size="md"
      >
        <div className="space-y-4 text-slate-700 text-xs">
          <p className="text-slate-600">
            Enter your official email address or phone number to receive a secure password reset link and temporary security code.
          </p>

          {forgotSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium flex items-center gap-2">
              <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{forgotSuccess}</span>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Official Email / Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <IconMail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                    placeholder="user@railway.gov.in or +91 9876543210"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Login;

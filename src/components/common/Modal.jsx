import { useEffect } from 'react';
import { IconClose, IconCheck, IconWarning, IconInfo, IconConflict } from '../icons/Icons.jsx';

// Modal
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const maxWidths = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <div className="rt-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="rt-modal" style={{ maxWidth: maxWidths[size] }}>
        <div className="rt-modal-header">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <IconClose size={18} />
          </button>
        </div>
        <div className="rt-modal-body">{children}</div>
        {footer && <div className="rt-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Drawer
export function Drawer({ open, onClose, title, children, subtitle }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="rt-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div className="rt-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="rt-drawer-header">
          <div>
            <div className="font-semibold text-gray-900 text-sm">{title}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className="rt-drawer-body">{children}</div>
      </div>
    </>
  );
}

// ConfirmationDialog
export function ConfirmationDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', confirmClass = 'rt-btn rt-btn-primary',
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <button className="rt-btn rt-btn-secondary" onClick={onClose}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      }
    >
      {message && <p className="text-sm text-gray-700">{message}</p>}
      {children}
    </Modal>
  );
}

// PageHeader
export function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// LoadingState
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="rt-empty-state">
      <div className="animate-pulse">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" style={{ borderWidth: 3 }} />
      </div>
      <div className="text-sm text-gray-500 mt-2">{message}</div>
    </div>
  );
}

// EmptyState
export function EmptyState({ title = 'No data', message, action }) {
  return (
    <div className="rt-empty-state">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <div className="font-medium text-gray-700">{title}</div>
      {message && <div className="text-sm text-gray-500 max-w-xs">{message}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// Toast (single toast item, used by ToastContainer)
export function ToastItem({ type = 'info', message, onDismiss }) {
  const configs = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', Icon: IconCheck },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', Icon: IconWarning },
    critical: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', Icon: IconConflict },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', Icon: IconInfo },
  };
  const { bg, border, text, Icon } = configs[type] || configs.info;

  return (
    <div className="rt-toast" style={{ background: bg, borderColor: border }} role="alert">
      <span style={{ color: text, flexShrink: 0, marginTop: 1 }}><Icon size={15} /></span>
      <span className="flex-1 text-gray-800 text-[13px]">{message}</span>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <IconClose size={14} />
      </button>
    </div>
  );
}

// ToastContainer
export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="rt-toast-container" aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} type={t.type} message={t.message} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

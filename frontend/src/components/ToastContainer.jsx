import { useToastStore } from '../stores/toastStore';

const ToastContainer = () => {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  const bgColor = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3',
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '90%',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            background: bgColor[t.type] || '#333',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            animation: 'toastIn 0.3s ease-out',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
          }}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;

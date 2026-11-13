const EmptyState = ({ icon = 'fa-box-open', title, description, action }) => (
  <div className="empty-state">
    <i className={`fas ${icon}`}></i>
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action && (
      <button
        onClick={action.onClick}
        style={{
          marginTop: 16, padding: '10px 24px', background: 'var(--primary-color)',
          border: 'none', borderRadius: 20, fontWeight: 600, fontSize: 14,
          color: '#333', cursor: 'pointer'
        }}
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;

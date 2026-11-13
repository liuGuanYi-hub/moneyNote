import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { useCategoryStore } from '../stores/categoryStore';

const UserProfile = () => {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const darkMode = useAppStore(s => s.darkMode);
  const toggleDarkMode = useAppStore(s => s.toggleDarkMode);
  const clearApp = useAppStore(s => s.clear);
  const clearCategories = useCategoryStore(s => s.clear);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCategories();
    clearApp();
    navigate('/login', { replace: true });
  };

  const handleToggleDark = () => {
    toggleDarkMode();
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div id="page-user" className="page">
      <div className="user-header-bg">
        <i className="fas fa-cog" style={{ fontSize: '22px', color: '#333', cursor: 'pointer' }}></i>
      </div>
      <div className="user-card">
        <div className="avatar">
          <img src={user?.avatar || "https://i.pravatar.cc/150?img=12"} alt="Av" style={{ width: '100%', height: '100%' }} />
        </div>
        <div>
          <h3>{user?.nickname || user?.username || '下雨天'}</h3>
          <div style={{ color: 'var(--text-sub)', fontSize: '13px' }}>坚持记账 1 天</div>
        </div>
      </div>
      <div className="menu-list">
        <div className="menu-item" onClick={handleToggleDark}>
          <span><i className={darkMode ? 'fas fa-moon' : 'fas fa-sun'} style={{ color: '#5C6BC0', marginRight: '10px' }}></i>{darkMode ? '夜间模式' : '白天模式'}</span>
          <i className={darkMode ? 'fas fa-toggle-on' : 'fas fa-toggle-off'} style={{ color: darkMode ? '#4CAF50' : '#ccc', fontSize: '24px' }}></i>
        </div>
        <div className="menu-item" onClick={() => navigate('/budgets')}>
          <span><i className="fas fa-wallet" style={{ color: '#2196F3', marginRight: '10px' }}></i>预算管理</span>
          <i className="fas fa-chevron-right" style={{ color: 'var(--text-sub)' }}></i>
        </div>
        <div className="menu-item"><span><i className="fas fa-file-export" style={{ color: '#4CAF50', marginRight: '10px' }}></i>账单导出</span><i className="fas fa-chevron-right" style={{ color: 'var(--text-sub)' }}></i></div>
        <div className="menu-item" onClick={() => navigate('/recycle-bin')}>
          <span><i className="fas fa-trash-alt" style={{ color: '#F44336', marginRight: '10px' }}></i>回收站</span>
          <i className="fas fa-chevron-right" style={{ color: 'var(--text-sub)' }}></i>
        </div>
      </div>
      <div style={{ padding: '0 15px' }}>
        <button className="btn-block" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--danger-color)', marginTop: '40px' }} onClick={handleLogout}>退出登录</button>
      </div>
    </div>
  );
};

export default UserProfile;

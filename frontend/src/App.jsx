import { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { apiFetch } from './services/api';
import './App.css';
import { Login, Register } from './pages/Auth';
import Home from './pages/Home';
import RecordForm from './pages/RecordForm';
import Statistics from './pages/Statistics';
import Discover from './pages/Discover';
import RecycleBin from './pages/RecycleBin';
import EditRecord from './pages/EditRecord';

const UserProfile = ({ onLogout, toggleDarkMode, darkMode, user, onNavigate }) => (
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
        <div style={{ color: '#999', fontSize: '13px' }}>坚持记账 1 天</div>
      </div>
    </div>
    <div className="menu-list">
      <div className="menu-item" onClick={toggleDarkMode}>
        <span><i className={darkMode ? 'fas fa-moon' : 'fas fa-sun'} style={{ color: '#5C6BC0', marginRight: '10px' }}></i>{darkMode ? '夜间模式' : '白天模式'}</span>
        <i className={darkMode ? 'fas fa-toggle-on' : 'fas fa-toggle-off'} style={{ color: darkMode ? '#4CAF50' : '#ccc', fontSize: '24px' }}></i>
      </div>
      <div className="menu-item"><span>我的账本</span><i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i></div>
      <div className="menu-item"><span>账单导出</span><i className="fas fa-file-export" style={{ color: '#ccc' }}></i></div>
      <div className="menu-item" onClick={() => onNavigate('recycle-bin')}><span>回收站</span><i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i></div>
    </div>
    <button className="btn-block" style={{ background: 'white', border: '1px solid #ddd', color: 'red', marginTop: '40px' }} onClick={onLogout}>退出登录</button>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [darkMode, setDarkMode] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const token = authService.getToken();
    const storedUser = authService.getUser();
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
      setCurrentPage('home');
      loadCategories();
    }

    const isDark = authService.getDarkMode();
    setDarkMode(isDark);
    if (isDark) document.body.classList.add('dark-mode');
  }, []);

  const loadCategories = async () => {
    try {
      const expense = await apiFetch('/categories?type=expense', { auth: true });
      const income = await apiFetch('/categories?type=income', { auth: true });
      setCategories({ expense, income });
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentPage('home');
    loadCategories();
  };

  const handleLogout = () => {
    authService.clear();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('login');
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    authService.setDarkMode(next);
    document.body.classList.toggle('dark-mode');
  };

  const triggerRefresh = () => {
    setRefreshSignal(prev => prev + 1);
  };

  const startEdit = (record) => {
    setEditingRecord(record);
    setCurrentPage('edit-record');
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      if (currentPage === 'register') {
        return <Register onBack={() => setCurrentPage('login')} onRegisterSuccess={handleLoginSuccess} />;
      }
      return <Login onLogin={handleLoginSuccess} onNavigateToRegister={() => setCurrentPage('register')} />;
    }

    switch (currentPage) {
      case 'home':
        return <Home
          categories={categories}
          refreshSignal={refreshSignal}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onRecordClick={startEdit}
          onRecordDeleted={triggerRefresh}
        />;
      case 'statistics':
        return <Statistics
          categories={categories}
          currentDate={currentDate}
        />;
      case 'discover': return <Discover categories={categories} currentDate={currentDate} />;
      case 'user':
        return <UserProfile
          onLogout={handleLogout}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          user={user}
          onNavigate={setCurrentPage}
        />;
      case 'record':
        return <RecordForm
          onBack={() => setCurrentPage('home')}
          categories={categories}
          onSuccess={triggerRefresh}
        />;
      case 'recycle-bin':
        return <RecycleBin
          onBack={() => setCurrentPage('user')}
          categories={categories}
          onRestore={triggerRefresh}
        />;
      case 'edit-record':
        return <EditRecord
          onBack={() => setCurrentPage('home')}
          categories={categories}
          record={editingRecord}
          onSuccess={triggerRefresh}
        />;
      default: return <Home categories={categories} refreshSignal={refreshSignal} currentDate={currentDate} onDateChange={setCurrentDate} onRecordClick={startEdit} onRecordDeleted={triggerRefresh} />;
    }
  };

  const showNavBar = isLoggedIn && ['home', 'statistics', 'discover', 'user'].includes(currentPage);

  return (
    <div id="app">
      {renderPage()}

      {showNavBar && (
        <div className="tab-bar" id="nav-bar">
          <div className={`tab-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>
            <i className="fas fa-home"></i><span>明细</span>
          </div>
          <div className={`tab-item ${currentPage === 'statistics' ? 'active' : ''}`} onClick={() => setCurrentPage('statistics')}>
            <i className="fas fa-chart-pie"></i><span>统计</span>
          </div>

          <div className="tab-item-center" onClick={() => setCurrentPage('record')}>
            <div className="add-btn-wrapper"><i className="fas fa-plus"></i></div>
            <span className="center-text">记一笔</span>
          </div>

          <div className={`tab-item ${currentPage === 'discover' ? 'active' : ''}`} onClick={() => setCurrentPage('discover')}>
            <i className="fas fa-compass"></i><span>发现</span>
          </div>
          <div className={`tab-item ${currentPage === 'user' ? 'active' : ''}`} onClick={() => setCurrentPage('user')}>
            <i className="fas fa-user"></i><span>我的</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ToastContainer from '../components/ToastContainer';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showNavBar = ['/', '/statistics', '/discover', '/user'].includes(location.pathname);

  return (
    <div id="app">
      <Outlet />

      {showNavBar && (
        <div className="tab-bar" id="nav-bar">
          <div className={`tab-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
            <i className="fas fa-home"></i><span>明细</span>
          </div>
          <div className={`tab-item ${location.pathname === '/statistics' ? 'active' : ''}`} onClick={() => navigate('/statistics')}>
            <i className="fas fa-chart-pie"></i><span>统计</span>
          </div>

          <div className="tab-item-center" onClick={() => navigate('/record')}>
            <div className="add-btn-wrapper"><i className="fas fa-plus"></i></div>
            <span className="center-text">记一笔</span>
          </div>

          <div className={`tab-item ${location.pathname === '/discover' ? 'active' : ''}`} onClick={() => navigate('/discover')}>
            <i className="fas fa-compass"></i><span>发现</span>
          </div>
          <div className={`tab-item ${location.pathname === '/user' ? 'active' : ''}`} onClick={() => navigate('/user')}>
            <i className="fas fa-user"></i><span>我的</span>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default MainLayout;

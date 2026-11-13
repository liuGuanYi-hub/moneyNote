import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import './App.css';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import { Login, Register } from './pages/Auth';
import Home from './pages/Home';
import RecordForm from './pages/RecordForm';
import Statistics from './pages/Statistics';
import Discover from './pages/Discover';
import RecycleBin from './pages/RecycleBin';
import EditRecord from './pages/EditRecord';
import UserProfile from './pages/UserProfile';
import BudgetPage from './pages/BudgetPage';
import { useAuthStore } from './stores/authStore';
import { useCategoryStore } from './stores/categoryStore';
import { useAppStore } from './stores/appStore';

// 同步读取 localStorage 中的暗黑模式并立即应用，防止白屏闪烁
try {
  const raw = localStorage.getItem('moneyNote-app');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed?.state?.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }
} catch (e) { /* ignore */ }

/** 已登录用户才能访问，否则重定向到 /login */
const AuthGuard = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/** 游客才能访问（登录页），否则重定向到 / */
const GuestGuard = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <Outlet />;
};

function App() {
  const login = useAuthStore(s => s.login);
  const loadCategories = useCategoryStore(s => s.loadCategories);
  const navigate = useNavigate();

  // 等待 Zustand persist hydration 完成
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  useEffect(() => {
    if (!hydrated) {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (isLoggedIn) {
      loadCategories().catch(() => {
        useAuthStore.getState().logout();
        useCategoryStore.getState().clear();
        useAppStore.getState().clear();
        navigate('/login', { replace: true });
      });
    }
  }, []);

  if (!hydrated) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-color)', color: 'var(--text-sub)', flexDirection: 'column', gap: 12
      }}>
        <i className="fas fa-wallet" style={{ fontSize: 40, color: 'var(--primary-color)' }}></i>
        <div style={{ fontSize: 14 }}>记账助手</div>
      </div>
    );
  }

  const handleLoginSuccess = (userData) => {
    const token = useAuthStore.getState().token;
    login(userData, token);
    navigate('/', { replace: true });
    loadCategories().catch(() => {});
  };

  const triggerRefresh = () => {
    useAppStore.getState().triggerRefresh();
  };

  return (
    <Routes>
      {/* 公开 / 游客页面 */}
      <Route element={<GuestGuard />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onRegisterSuccess={handleLoginSuccess} />} />
        </Route>
      </Route>

      {/* 需要登录的页面 */}
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/budgets" element={<BudgetPage />} />
          <Route path="/record" element={<RecordForm onSuccess={triggerRefresh} />} />
          <Route path="/recycle-bin" element={<RecycleBin onRestore={triggerRefresh} />} />
          <Route path="/edit-record/:id" element={<EditRecord onSuccess={triggerRefresh} />} />
        </Route>
      </Route>

      {/* 未匹配路由一律跳转 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(s => s.login);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) return toast.error('请输入账号和密码');
        setLoading(true);
        try {
            const data = await apiFetch('/users/login', { method: 'POST', body: { username, password } });
            login(data.user, data.token);
            onLogin(data.user);
        } catch (e) {
            toast.error(e.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="page-login" className="page-fullscreen" style={{ display: 'flex' }}>
            <div className="auth-container">
                <div className="login-logo">
                    <i className="fas fa-wallet"></i>
                    <h2>记账助手</h2>
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="账号"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        className="form-input"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn-block" onClick={handleLogin} disabled={loading}>
                    {loading ? '登 录 中...' : '登 录'}
                </button>
                <Link to="/register" className="link-text" style={{ textDecoration: 'none' }}>没有账号？点击注册</Link>
            </div>
        </div>
    );
};

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirm: '',
        nickname: ''
    });
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(s => s.login);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async () => {
        const { email, username, password, confirm, nickname } = formData;
        if (!email || !username || !password) return toast.error('请填写相关信息');
        if (password !== confirm) return toast.error('两次密码不一致');

        setLoading(true);
        try {
            const data = await apiFetch('/users/register', {
                method: 'POST',
                body: { email, username, password, nickname: nickname || username }
            });
            login(data.user, data.token);
            toast.success('注册成功，已自动登录');
            onRegisterSuccess(data.user);
        } catch (e) {
            toast.error(e.message || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="page-register" className="page-fullscreen" style={{ display: 'flex' }}>
            <div className="common-header">
                <i className="fas fa-chevron-left back-btn" onClick={() => navigate('/login')}></i>
                <div className="header-title">新用户注册</div>
                <div style={{ width: '25px' }}></div>
            </div>
            <div className="auth-container" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
                <div className="form-group">
                    <input type="text" name="email" className="form-input" placeholder="请输入手机号/邮箱" value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <input type="text" name="username" className="form-input" placeholder="设置用户名" value={formData.username} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <input type="text" name="nickname" className="form-input" placeholder="设置昵称（可选）" value={formData.nickname} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <input type="password" name="password" className="form-input" placeholder="设置密码" value={formData.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <input type="password" name="confirm" className="form-input" placeholder="确认密码" value={formData.confirm} onChange={handleChange} />
                </div>
                <button className="btn-block" onClick={handleRegister} disabled={loading}>
                    {loading ? '注 册 中...' : '立即注册'}
                </button>
            </div>
        </div>
    );
};

export { Login, Register };

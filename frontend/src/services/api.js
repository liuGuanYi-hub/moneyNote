import { authService } from './auth';

const API_BASE = 'http://localhost:8080/api';

export const apiFetch = async (path, { method = 'GET', body, auth = false } = {}) => {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (auth) {
            const token = authService.getToken();
            if (!token) {
                authService.clear();
                // We'll handle redirection in the component layer or with a global event
                throw new Error('未登录，请先登录');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!res.ok) {
            if (res.status === 401) {
                authService.clear();
                throw new Error('登录已过期，请重新登录');
            }
            const errorText = await res.text().catch(() => '');
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `请求失败: ${res.status}`);
            } catch {
                throw new Error(`请求失败: ${res.status} ${res.statusText}`);
            }
        }

        const data = await res.json().catch(() => null);
        if (!data) throw new Error('后端返回不是JSON');
        if (!data.success) throw new Error(data.message || '请求失败');
        return data.data;
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接');
        }
        if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('fetch')) {
            throw new Error('无法连接到服务器，请确保后端运行在 http://localhost:8080 且已启动');
        }
        throw e;
    }
};

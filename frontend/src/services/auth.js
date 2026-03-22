const TOKEN_KEY = 'moneyNote_token';
const USER_KEY = 'moneyNote_user';
const DARK_MODE_KEY = 'moneyNote_darkMode';

export const authService = {
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },
    getUser() {
        const raw = localStorage.getItem(USER_KEY);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },
    setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
    getDarkMode() {
        return localStorage.getItem(DARK_MODE_KEY) === 'on';
    },
    setDarkMode(on) {
        localStorage.setItem(DARK_MODE_KEY, on ? 'on' : 'off');
    }
};

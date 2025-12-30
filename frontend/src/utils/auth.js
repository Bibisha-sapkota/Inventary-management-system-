// Save auth data
export const saveAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Get token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Get user
export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Clear auth
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Check if logged in
export const isLoggedIn = () => {
    return !!getToken();
};
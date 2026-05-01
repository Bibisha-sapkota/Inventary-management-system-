// src/auth.js

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Save authentication data
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get the stored token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get the stored user
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  if (user) {
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Clear authentication data (logout)
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Get user role
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

// Check if user has specific role
export const hasRole = (role) => {
  const userRole = getUserRole();
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  return userRole === role;
};

export default {
  saveAuth,
  getToken,
  getUser,
  isAuthenticated,
  clearAuth,
  getUserRole,
  hasRole,
};
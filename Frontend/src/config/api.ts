// API Configuration
export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`,
    SESSIONS: `${API_BASE_URL}/auth/sessions`,
    REVOKE_SESSION: (id: string) => `${API_BASE_URL}/auth/sessions/${id}/revoke`,
  },
  ADMIN: {
    USERS: `${API_BASE_URL}/admin/users`,
    USER: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
    USER_ROLES: (id: string) => `${API_BASE_URL}/admin/users/${id}/roles`,
    USER_PERMISSIONS: (id: string) => `${API_BASE_URL}/admin/users/${id}/permissions`,
    USER_COPY_ACCESS: (id: string) => `${API_BASE_URL}/admin/users/${id}/copy-access`,
    USER_RESET_PASSWORD: (id: string) => `${API_BASE_URL}/admin/users/${id}/reset-password`,
    USER_ACTIVATE: (id: string) => `${API_BASE_URL}/admin/users/${id}/activate`,
    USER_DEACTIVATE: (id: string) => `${API_BASE_URL}/admin/users/${id}/deactivate`,
    ROLES: `${API_BASE_URL}/admin/roles`,
    ROLE: (id: string) => `${API_BASE_URL}/admin/roles/${id}`,
    ROLE_PERMISSIONS: (id: string) => `${API_BASE_URL}/admin/roles/${id}/permissions`,
    PERMISSIONS: `${API_BASE_URL}/admin/permissions`,
  },
};

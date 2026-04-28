export const USER_STORAGE_KEY = 'user';
export const TOKEN_STORAGE_KEY = 'user_token'; // New: We need to store the API token

/**
 * Get the user profile data from storage
 */
export function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
    } catch {
        return null;
    }
}

// utils/auth.js — add this if not already there
export function getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}
/**
 * Get the API token for Axios headers
 */
export function getStoredToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Save both user data and the token after a successful Laravel login
 */
export function setStoredUser(user, token) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('user_role', user?.role || '');
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
}

/**
 * Wipe everything on logout
 */
export function clearStoredUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('user_role');
}

/**
 * Check if user is an admin based on the role Laravel sent back
 */
export function isAdminUser(user = getStoredUser()) {
    return user?.role === 'admin';
}

/**
 * Check if a token exists (used by your Navigation Guard)
 */
export function isAuthenticated() {
    return Boolean(getStoredToken());
}

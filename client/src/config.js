// Dynamic Configuration for Development and Production
// In production, set VITE_API_URL environment variable
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// Use environment variable in production, or dynamic hostname in development
export const API_BASE_URL = import.meta.env.VITE_API_URL
    || `http://${hostname}:3000/api`;

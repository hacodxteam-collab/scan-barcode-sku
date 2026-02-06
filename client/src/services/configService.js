import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/config`;

export const getConfig = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch config');
        return await response.json();
    } catch (error) {
        console.error('Error fetching config:', error);
        return { logo: null, appName: 'Welcome Back' };
    }
};

export const updateLogo = async (base64String) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: base64String })
    });
    return { logo: base64String };
};

export const updateAppName = async (name) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: name })
    });
    return { appName: name };
};

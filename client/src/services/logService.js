import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/logs`;

// Helper to detect simple device info
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = 'Unknown Device';
    if (/Mobi|Android/i.test(ua)) device = 'Mobile';
    else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';
    else device = 'PC/Desktop';

    // Add browser/OS hint
    if (ua.includes('Win')) device += ' (Windows)';
    else if (ua.includes('Mac')) device += ' (Mac)';
    else if (ua.includes('Linux')) device += ' (Linux)';
    else if (ua.includes('iPhone')) device += ' (iPhone)';
    else if (ua.includes('Android')) device += ' (Android)';

    return device;
};

// Fire and forget (don't block UI)
export const addLog = (actionType, user, details) => {
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
    const device = getDeviceInfo();

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, userName, details, device })
    })
        .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            // alert('DEBUG: Log Saved!'); // Commented out to be less annoying, unless user wants it
        })
        .catch(err => {
            alert('DEBUG ERROR: Failed to save log. ' + err.message);
            console.error('Failed to save log:', err);
        });
};

export const getLogs = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch logs');
        return await response.json();
    } catch (error) {
        console.error('Error fetching logs:', error);
        return [];
    }
};

export const clearLogs = async () => {
    try {
        await fetch(API_URL, { method: 'DELETE' });
        return [];
    } catch (error) {
        console.error('Error clearing logs:', error);
        return [];
    }
};

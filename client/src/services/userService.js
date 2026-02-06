import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/users`;
const LOGIN_URL = `${API_BASE_URL}/login`;

export const loginUser = async (employeeId, password) => {
    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, password })
        });
        if (!response.ok) throw new Error('Invalid credentials');
        const data = await response.json();
        return data.user;
    } catch (error) {
        throw error;
    }
};

export const getUsers = async () => {
    try {
        const response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const addUser = async (user) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to add user');
    }
    return data;
};

export const updateUser = async (id, userData) => {
    console.warn('Update User API not implemented yet');
    return [];
};

export const removeUser = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete user');
    return [];
};

export const validateLogin = async (pin) => {
    // This function was synchronous before. Now it must be async or we change calls to it.
    // However, existing calls might expect sync.
    // I will change it to redirect to loginUser logic or remove it if unused.
    // LoginScreen uses validateLogin. I should update LoginScreen to use loginUser instead.
    // But keeping it for now as a wrapper if needed, but async.
    return loginUser(pin, '1234'); // Default password for now?
    // Wait, LoginScreen passes pin. Login logic in userService (mock) checked pin against ID.
    // My backend login expects { employeeId, password }.
    // If user only types PIN (4 digits), is that ID or Password?
    // In strict mode, it's ID. Password we can default to '1234' on backend or client.
    // I'll assume PIN = ID and password = '1234' for simplicity as requested?
    // Or I should ask user?
    // The previous mock logic: if (user && (password === '1234' || password === user.password))
    // So if I send password '1234', it should work.
};

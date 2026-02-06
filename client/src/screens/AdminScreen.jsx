import React, { useState, useEffect } from 'react';
import UserManager from './UserManager';
import ProductManager from './ProductManager';
import LogViewer from './LogViewer';
import './AdminScreen.css';

import AlertPopup from '../components/AlertPopup';
import { getConfig, updateLogo, updateAppName } from '../services/configService';

const AdminScreen = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'products', 'logs', 'settings'
    const [logo, setLogo] = useState(null);
    const [appName, setAppName] = useState('Welcome Back');

    useEffect(() => {
        const loadConfig = async () => {
            const config = await getConfig();
            setLogo(config.logo);
            setAppName(config.appName);
        };
        loadConfig();
    }, []);

    // Custom Popup State
    const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

    const showPopup = (message, type = 'success') => {
        setPopup({ show: true, message, type });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            await updateLogo(base64);
            setLogo(base64);
            showPopup('Logo updated successfully!');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        if (window.confirm('Remove custom logo?')) {
            updateLogo(null);
            setLogo(null);
            showPopup('Logo removed.');
        }
    };

    const handleAppNameChange = (e) => {
        setAppName(e.target.value);
    };

    const saveAppName = () => {
        updateAppName(appName);
        showPopup('App Name updated!');
    };

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            {/* Header ... */}
            <header className="app-header">
                <h1>ADMIN PANEL</h1>
                <button
                    className="btn-secondary"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={onLogout}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    EXIT
                </button>
            </header>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Employees
                </button>
                <button
                    className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Manage Products
                </button>
                <button
                    className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Activity Logs
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'users' && <UserManager user={user} />}
                {activeTab === 'products' && <ProductManager user={user} />}
                {activeTab === 'logs' && <LogViewer />}
                {activeTab === 'settings' && (
                    <div className="card">
                        <h3>General Settings</h3>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>App Logo</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    border: '2px dashed #ccc',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    background: '#f9f9f9'
                                }}>
                                    {logo ? (
                                        <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ color: '#ccc' }}>No Logo</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="logo-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleLogoUpload}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="btn btn-primary"
                                        style={{ cursor: 'pointer', textAlign: 'center', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        Upload New Logo
                                    </label>
                                    {logo && (
                                        <button
                                            className="btn-secondary"
                                            onClick={handleRemoveLogo}
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            Remove Logo
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                Recommended size: 200x200px. PNG or JPG.
                            </p>
                        </div>

                        <div className="form-group" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Welcome Title</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={appName}
                                    onChange={handleAppNameChange}
                                    placeholder="Enter title (e.g. Welcome Back)"
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <button className="btn btn-primary" onClick={saveAppName}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {popup.show && (
                <AlertPopup
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup({ ...popup, show: false })}
                />
            )}
        </div>
    );
};

export default AdminScreen;

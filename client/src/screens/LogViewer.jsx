import React, { useState, useEffect } from 'react';
import { getLogs, clearLogs } from '../services/logService';
import ConfirmPopup from '../components/ConfirmPopup';
import './LogViewer.css';

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({
        type: 'ALL',
        user: '',
        startDate: '',
        endDate: ''
    });
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await getLogs();
            if (Array.isArray(data)) setLogs(data);
        };
        fetchLogs();

        // Auto refresh every 5s
        const interval = setInterval(() => {
            if (!filters.user) fetchLogs();
        }, 5000);
        return () => clearInterval(interval);
    }, [filters.user]);

    const handleClearClick = () => {
        if (logs.length > 0) {
            setShowConfirm(true);
        }
    };

    const confirmClear = async () => {
        await clearLogs();
        setLogs([]);
        setShowConfirm(false);
    };

    const filteredLogs = logs.filter(log => {
        const matchesType = filters.type === 'ALL' || log.type === filters.type;
        const matchesUser = filters.user === '' || log.user.toLowerCase().includes(filters.user.toLowerCase());

        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        let matchesDate = true;
        if (filters.startDate) matchesDate = matchesDate && logDate >= filters.startDate;
        if (filters.endDate) matchesDate = matchesDate && logDate <= filters.endDate;

        return matchesType && matchesUser && matchesDate;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const getBadgeClass = (type) => {
        switch (type) {
            case 'LOGIN': return 'badge-info';
            case 'SCAN_FOUND': return 'badge-success';
            case 'SCAN_NOT_FOUND': return 'badge-error';
            case 'ADMIN': return 'badge-warning';
            default: return 'badge-default';
        }
    };

    return (
        <div className="log-viewer">
            <div className="log-controls">
                {/* ... existing controls ... */}
                <div className="filter-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>From:</span>
                        <input
                            type="date"
                            className="filter-input"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>To:</span>
                        <input
                            type="date"
                            className="filter-input"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>

                    <select
                        className="filter-input"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="ALL">All Types</option>
                        <option value="LOGIN">Login</option>
                        <option value="SCAN_FOUND">Scan (Success)</option>
                        <option value="SCAN_NOT_FOUND">Scan (Failed)</option>
                        <option value="ADMIN">Admin Action</option>
                    </select>

                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Search User..."
                        value={filters.user}
                        onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                    />
                    {/* Reset Button */}
                    {(filters.startDate || filters.endDate || filters.type !== 'ALL' || filters.user) && (
                        <button
                            className="btn-secondary btn-sm"
                            onClick={() => setFilters({ type: 'ALL', user: '', startDate: '', endDate: '' })}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <path d="M3 3v5h5"></path>
                            </svg>
                            Reset
                        </button>
                    )}
                </div>

                <button
                    className="btn-secondary btn-sm"
                    onClick={handleClearClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={logs.length === 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Clear Logs
                </button>
            </div>

            <div className="table-responsive log-table-container">
                <table className="user-table log-table">
                    <thead>
                        <tr>
                            <th style={{ width: '16%' }}>Time</th>
                            <th style={{ width: '14%' }}>Type</th>
                            <th style={{ width: '18%' }}>Device</th>
                            <th style={{ width: '12%' }}>User</th>
                            <th style={{ width: '40%' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLogs.map(log => {
                            // Parse device info for cleaner display
                            const deviceInfo = log.device || '-';
                            const deviceParts = deviceInfo.split(' | IP:');
                            const deviceType = deviceParts[0] || '-';
                            const deviceIp = deviceParts[1]?.trim() || '';

                            return (
                                <tr key={log.id}>
                                    <td className="text-secondary">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${getBadgeClass(log.type)}`}>
                                            {log.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="device-cell">
                                            <span className="device-type">{deviceType}</span>
                                            {deviceIp && <span className="device-ip">{deviceIp}</span>}
                                        </div>
                                    </td>
                                    <td className="font-medium">{log.user}</td>
                                    <td className="text-sm">{log.details}</td>
                                </tr>
                            );
                        })}
                        {filteredLogs.length === 0 && (
                            <tr><td colSpan="5" className="empty-text">No activity logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        className="btn-secondary btn-sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn-secondary btn-sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {showConfirm && (
                <ConfirmPopup
                    title="Clear All Logs"
                    message="Are you sure you want to delete all activity logs? This action cannot be undone."
                    onConfirm={confirmClear}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
};

export default LogViewer;

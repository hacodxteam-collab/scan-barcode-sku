import React, { useState, useRef, useEffect } from 'react';
import { useScanDetection } from '../hooks/useScanDetection';
// import { searchProduct } from '../services/mockData'; // REMOVED
import { getProducts, findProductByBarcode } from '../services/productService';
import ResultPopup from '../components/ResultPopup';
import { addLog } from '../services/logService';
import './ScanScreen.css';

const ScanScreen = ({ user, onLogout }) => {
    const [lastBarcode, setLastBarcode] = useState('');
    const [scanResult, setScanResult] = useState(null); // { found: bool, ... }
    const [history, setHistory] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [products, setProducts] = useState([]);

    // Load products on mount
    useEffect(() => {
        const load = async () => {
            const data = await getProducts();
            setProducts(data);
        };
        load();
    }, []);

    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);
    const inputRef = useRef(null);

    const handleScan = async (barcode) => {
        if (!barcode) return;

        // Clear input FIRST to prevent old barcode concatenation
        setInputValue('');

        // Normalize
        const cleanBarcode = barcode.trim();
        setLastBarcode(cleanBarcode);

        // Lookup (Client-side against loaded products for speed)
        try {
            const product = findProductByBarcode(products, cleanBarcode);
            const found = !!product;
            const result = {
                found,
                itemCode: found ? product.itemCode : cleanBarcode,
                itemName: found ? product.itemName : 'Unknown Item',
                barcode: cleanBarcode
            };

            setScanResult(result);

            // Log activity
            if (found) {
                addLog('SCAN_FOUND', user, `Scanned: ${result.itemName} (${result.itemCode})`);
            } else {
                addLog('SCAN_NOT_FOUND', user, `Barcode not found: ${cleanBarcode}`);
            }

            // Add to history
            const newHistoryItem = {
                time: new Date().toLocaleTimeString(),
                barcode: cleanBarcode,
                found: found,
                itemName: found ? product.itemName : 'N/A'
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
        } catch (err) {
            console.error(err);
        }
    };

    // Global listener
    useScanDetection({
        onScan: handleScan
    });

    // Manual Input handler
    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleScan(inputValue);
    };

    const closePopup = () => {
        setScanResult(null);
        setInputValue('');
        // Refocus input for continuous scanning (inputMode="none" prevents keyboard)
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="scan-screen container">
            <header className="app-header">
                <div>
                    <h1>SCAN SKU</h1>
                    <small style={{ color: 'var(--color-text-secondary)' }}>Hello, {user?.firstName} {user?.lastName}</small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="connection-status">
                        <span className={`dot ${isOnline ? 'online' : 'offline'}`}></span>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </div>
                    <button
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={onLogout}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        LOGOUT
                    </button>
                </div>
            </header>

            <div className="scan-area card">
                <label className="input-label">Scan or Type Barcode</label>
                <form onSubmit={handleManualSubmit} className="input-group">
                    <input
                        ref={inputRef}
                        type="text"
                        className="scan-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Waiting for scan..."
                        autoFocus
                        autoComplete="off"
                    />
                    <button type="submit" className="btn btn-primary scan-btn">
                        SCAN
                    </button>
                </form>
            </div>

            <div className="history-section">
                <h3>Recent Scans</h3>
                <div className="history-list">
                    {history.length === 0 ? (
                        <p className="empty-text">No recent scans</p>
                    ) : (
                        history.map((item, idx) => (
                            <div key={idx} className={`history-item ${item.found ? 'found' : 'not-found'}`}>
                                <span className="time">{item.time}</span>
                                <span className="code">{item.barcode}</span>
                                <span className="status">{item.found ? item.itemName : 'NOT FOUND'}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {scanResult && (
                <ResultPopup result={scanResult} onClose={closePopup} />
            )}
        </div>
    );
};

export default ScanScreen;

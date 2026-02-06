import React, { useEffect, useRef } from 'react';
import './ResultPopup.css'; // Reusing base styles for consistency

const AlertPopup = ({ message, type = 'error', onClose }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) buttonRef.current.focus();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onClose();
    };

    const isError = type === 'error';

    return (
        <div className="popup-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div
                className={`popup-content card animate-slide-up ${isError ? 'border-error' : 'border-success'}`}
                onClick={(e) => e.stopPropagation()}
                style={{ paddingBottom: '2rem' }}
            >
                <div className={`status-icon ${isError ? 'bg-error' : 'bg-success'}`}>
                    {isError ? '!' : '✓'}
                </div>

                <h2 className="status-title" style={{ marginBottom: '1rem' }}>
                    {isError ? 'Error' : 'Success'}
                </h2>

                <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    {message}
                </p>

                <button
                    ref={buttonRef}
                    className={`btn ${isError ? 'btn-error' : 'btn-primary'}`}
                    onClick={onClose}
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
};

export default AlertPopup;

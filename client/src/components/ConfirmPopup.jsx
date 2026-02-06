import React, { useEffect, useRef } from 'react';
import './ResultPopup.css'; // Reusing popup styles

const ConfirmPopup = ({ title, message, onConfirm, onCancel, confirmText = 'CONFIRM', isDestructive = false }) => {
    const confirmBtnRef = useRef(null);

    useEffect(() => {
        if (confirmBtnRef.current) confirmBtnRef.current.focus();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel();
    };

    return (
        <div className="popup-overlay" onClick={onCancel} onKeyDown={handleKeyDown}>
            <div
                className="popup-content card animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ paddingBottom: '2rem', maxWidth: '400px' }}
            >
                <div className="status-icon bg-warning" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                    ?
                </div>

                <h2 className="status-title" style={{ marginBottom: '1rem' }}>
                    {title || 'Confirmation'}
                </h2>

                <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    {message}
                </p>

                <div className="form-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={onCancel}
                        style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                    >
                        CANCEL
                    </button>
                    <button
                        ref={confirmBtnRef}
                        className="btn btn-primary"
                        onClick={onConfirm}
                        style={{
                            width: 'auto',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: isDestructive ? '#ef4444' : 'var(--color-primary)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;

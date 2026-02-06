import React from 'react';
import './ResultPopup.css';

const ResultPopup = ({ result, onClose }) => {
    const isFound = result.found;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div
                className={`popup-content card animate-slide-up ${isFound ? 'border-success' : 'border-error'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`status-icon ${isFound ? 'bg-success' : 'bg-error'}`}>
                    {isFound ? '✓' : '✕'}
                </div>

                <h2 className="status-title">
                    {isFound ? 'Product Found' : 'Product Not Found'}
                </h2>

                <div className="barcode-display">
                    {result.barcode}
                </div>

                {isFound ? (
                    <div className="product-details">
                        <div className="detail-item">
                            <span className="label">Item Code</span>
                            <span className="value">{result.itemCode}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Name</span>
                            <span className="value highlight">{result.itemName}</span>
                        </div>
                    </div>
                ) : (
                    <p className="error-message">
                        This barcode is not registered in the system.
                    </p>
                )}

                <button
                    className={`btn ${isFound ? 'btn-primary' : 'btn-error'}`}
                    onClick={onClose}
                >
                    {isFound ? 'OK (Scan Next)' : 'Close'}
                </button>
            </div>
        </div>
    );
};

export default ResultPopup;

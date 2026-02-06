import { useEffect, useRef } from 'react';

/**
 * Listens for barcode scanner input (keyboard emulation).
 * Scanners typically type characters very fast (<50ms) followed by 'Enter'.
 * 
 * @param {Object} options
 * @param {Function} options.onScan - Callback with scanned barcode string
 * @param {number} options.minStrLength - Minimum length to trigger scan (default 3)
 * @param {number} options.timeOut - Max time between keystrokes to be considered part of scan (ms)
 */
export const useScanDetection = ({ onScan, minStrLength = 3, timeOut = 100 }) => {
    const buffer = useRef('');
    const lastKeyTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const char = e.key;
            const now = Date.now();

            // If significant gap, reset buffer (it was likely manual interaction or noise)
            if (now - lastKeyTime.current > timeOut && buffer.current.length > 0) {
                buffer.current = '';
            }

            lastKeyTime.current = now;

            if (char === 'Enter') {
                if (buffer.current.length >= minStrLength) {
                    e.preventDefault(); // Prevent default enter behavior if it looks like a scan
                    onScan(buffer.current);
                    buffer.current = '';
                }
                return;
            }

            // Append printable characters
            if (char.length === 1) {
                buffer.current += char;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan, minStrLength, timeOut]);
};


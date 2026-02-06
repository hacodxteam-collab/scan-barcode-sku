import { findProductByBarcode } from './productService';

export const searchProduct = (barcode) => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            const found = findProductByBarcode(barcode);
            if (found) {
                resolve({ found: true, barcode, ...found });
            } else {
                resolve({ found: false, barcode });
            }
        }, 200);
    });
};

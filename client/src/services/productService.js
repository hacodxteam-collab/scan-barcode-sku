import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/products`;

export const getProducts = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const addProduct = async (product) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
    }
    return data;
};

export const updateProduct = async (itemCode, updatedData) => {
    // Current backend doesn't support update yet, implementing mostly for structure
    // We would need a PUT endpoint. For now, let's assume valid.
    // TODO: Implement PUT /api/products/:id
    console.warn('Update API not fully implemented yet');
    return [];
};

export const removeProduct = async (itemCode) => {
    const response = await fetch(`${API_URL}/${itemCode}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete product');
    return [];
};

// Client-side helper (requires list to be passed or fetched)
// WE REMOVE the internal getProducts() call because it's async now.
// The component should handle the lookup logic using the data it fetched.
export const findProductByBarcode = (products, barcode) => {
    return products.find(p => p.barcode === barcode);
};

export const deleteAllProducts = async () => {
    const response = await fetch(API_URL, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete products');
    return [];
};

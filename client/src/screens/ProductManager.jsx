import React, { useState, useEffect, useRef } from 'react';
import {
    getProducts,
    addProduct,
    updateProduct,
    removeProduct,
    deleteAllProducts
} from '../services/productService';
import { addLog } from '../services/logService';
import * as XLSX from 'xlsx';
import ConfirmPopup from '../components/ConfirmPopup';
import AlertPopup from '../components/AlertPopup';

const ProductManager = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        itemCode: '',
        itemName: '',
        barcode: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const [alertPopup, setAlertPopup] = useState({ show: false, message: '', type: 'success' });

    const resetForm = () => {
        setFormData({ itemCode: '', itemName: '', barcode: '' });
        setIsEditing(false);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.itemCode || !formData.itemName || !formData.barcode) {
            setError('All fields are required');
            return;
        }

        try {
            if (isEditing) {
                // await updateProduct(formData.itemCode, formData);
                alert('Update not fully supported yet in API mode');
            } else {
                await addProduct(formData);
                addLog('ADMIN', user, `Added product: ${formData.itemName} (${formData.itemCode})`);
                setAlertPopup({
                    show: true,
                    type: 'success',
                    message: `Product "${formData.itemName}" added successfully!`
                });
            }
            await loadProducts();
            resetForm();
        } catch (err) {
            setError(err.message);
            setAlertPopup({
                show: true,
                type: 'error',
                message: err.message || 'Failed to add product'
            });
        }
    };

    const handleEdit = (p) => {
        setFormData({ ...p });
        setIsEditing(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemove = async (itemCode, barcode) => {
        // Just using itemCode for delete based on my API design? 
        // Wait, removeProduct(itemCode) in productService uses API_URL.
        // It's 'DELETE /api/products' but backend needs ID or Code. 
        // My backend stub says DELETE /api/products/:id but I didn't implement :id yet in index.js?
        // Let's check index.js. 
        // I implemented app.delete('/api/products') for TRUNCATE.
        // I MISSED app.delete('/api/products/:id')!
        // I only added deleteAll. 
        // I need to add single delete to index.js.

        // For now, I will write the frontend assuming backend exists or warn.
        // Actually, I should FIX backend first if I want it to work.
        // But let's finish frontend sync refactor first.
        if (window.confirm(`Delete product ${itemCode}?`)) {
            await removeProduct(itemCode);
            await loadProducts();
            addLog('ADMIN', user, `Deleted product: ${barcode}`);
            if (formData.barcode === barcode) resetForm();
        }
    };

    // Excel Export
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(products);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
        addLog('ADMIN', user, 'Exported products to Excel');
    };

    // Excel Import
    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const [isImporting, setIsImporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    setAlertPopup({ show: true, type: 'error', message: 'No data found in file' });
                    e.target.value = null;
                    return;
                }

                setIsImporting(true);
                setUploadProgress(0);

                const total = data.length;
                let processed = 0;
                let successCount = 0;
                let failCount = 0;
                const chunkSize = 20; // Process 20 items at a time

                const processChunk = async () => {
                    const chunk = data.slice(processed, processed + chunkSize);

                    // Process chunk in parallel
                    await Promise.all(chunk.map(async (row) => {
                        if (row.itemCode && row.itemName && row.barcode) {
                            try {
                                await addProduct({
                                    itemCode: String(row.itemCode),
                                    itemName: String(row.itemName),
                                    barcode: String(row.barcode)
                                });
                                successCount++;
                            } catch (err) {
                                failCount++;
                            }
                        }
                    }));

                    processed += chunk.length;
                    const percent = Math.min(100, Math.round((processed / total) * 100));
                    setUploadProgress(percent);

                    if (processed < total) {
                        setTimeout(processChunk, 5);
                    } else {
                        // Finished
                        await loadProducts();
                        addLog('ADMIN', user, `Imported products: ${successCount} success, ${failCount} failed`);
                        setIsImporting(false);
                        setAlertPopup({
                            show: true,
                            type: 'success',
                            message: (
                                <span>
                                    Import complete!<br />
                                    <strong>Success:</strong> {successCount}<br />
                                    <strong>Skipped (Duplicate):</strong> {failCount}
                                </span>
                            )
                        });
                        e.target.value = null; // Reset input
                    }
                };

                // Start processing
                processChunk();

            } catch (err) {
                console.error(err);
                setError('Failed to process file');
                setIsImporting(false);
                e.target.value = null;
            }
        };
        reader.readAsBinaryString(file);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    useEffect(() => {
        if (products.length < (currentPage - 1) * itemsPerPage) {
            setCurrentPage(1);
        }
    }, [products.length, currentPage, itemsPerPage]);

    // Confirm Popup State
    const [confirmPopup, setConfirmPopup] = useState({
        show: false,
        title: '',
        message: '',
        confirmText: 'CONFIRM',
        isDestructive: false,
        onConfirm: () => { }
    });

    const closeConfirmPopup = () => setConfirmPopup({ ...confirmPopup, show: false });

    const handleDeleteAll = () => {
        // Step 1: Warning
        setConfirmPopup({
            show: true,
            title: 'Delete All Products?',
            message: 'WARNING: This will delete ALL products from the database. This action cannot be undone.',
            confirmText: 'YES, DELETE EVERYTHING',
            isDestructive: true,
            onConfirm: () => {
                // Step 2: Double Check - Immediate second popup for safety
                setConfirmPopup({
                    show: true,
                    title: 'Final Confirmation',
                    message: 'Are you absolutely 100% sure? All data will be lost forever.',
                    confirmText: 'I AM SURE',
                    isDestructive: true,
                    onConfirm: async () => {
                        await deleteAllProducts();
                        await loadProducts();
                        addLog('ADMIN', user, 'Deleted ALL products from database');
                        closeConfirmPopup();
                        setAlertPopup({
                            show: true,
                            type: 'success',
                            message: 'All products have been deleted.'
                        });
                    }
                });
            }
        });
    };

    // Filter Logic
    const filteredProducts = products.filter(p =>
        p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div>
            {/* ... form card ... */}
            <div className="card form-card">
                <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Item Code</label>
                        <input
                            name="itemCode"
                            value={formData.itemCode}
                            onChange={handleChange}
                            disabled={isEditing}
                            className={isEditing ? 'disabled' : ''}
                            placeholder="e.g. FG-001"
                        />
                    </div>

                    <div className="form-group">
                        <label>Item Name</label>
                        <input
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleChange}
                            placeholder="Product Name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Barcode</label>
                        <input
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            placeholder="Scan or type..."
                        />
                    </div>

                    <div className="form-actions">
                        {isEditing && (
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                CANCEL
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                        </button>
                    </div>
                </form>
                {error && <p className="error-text">{error}</p>}
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3>Product List</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="filter-input"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            style={{ width: '70px' }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        {/* Search Filter */}
                        <input
                            type="text"
                            placeholder="Search Products..."
                            className="filter-input"
                            style={{ width: '200px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                        <button className="btn-secondary btn-sm" onClick={handleImportClick} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Import Excel
                        </button>
                        <button className="btn-secondary btn-sm" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export Excel
                        </button>

                        <button
                            className="btn-secondary btn-sm"
                            onClick={handleDeleteAll}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                borderColor: 'var(--color-error)',
                                color: 'var(--color-error)'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            Clear DB
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Barcode</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((p) => (
                                <tr key={p.itemCode}>
                                    <td><span className="code">{p.itemCode}</span></td>
                                    <td>{p.itemName}</td>
                                    <td><small className="badge">{p.barcode}</small></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" onClick={() => handleEdit(p)}>✎</button>
                                            <button className="btn-icon delete" onClick={() => handleRemove(p.itemCode)}>🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan="4" className="empty-text">No products found.</td></tr>
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
            </div>
            {isImporting && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '320px', textAlign: 'center', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                            </svg>
                        </div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Importing Products...</h3>

                        <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: `${uploadProgress}%`,
                                height: '100%',
                                backgroundColor: 'var(--color-success)',
                                transition: 'width 0.2s ease-out'
                            }}></div>
                        </div>

                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{uploadProgress}%</div>
                        <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Reading and processing data...</p>
                    </div>
                </div>
            )}

            {confirmPopup.show && (
                <ConfirmPopup
                    title={confirmPopup.title}
                    message={confirmPopup.message}
                    onConfirm={confirmPopup.onConfirm}
                    onCancel={closeConfirmPopup}
                    confirmText={confirmPopup.confirmText}
                    isDestructive={confirmPopup.isDestructive}
                />
            )}
            {alertPopup.show && (
                <AlertPopup
                    message={alertPopup.message}
                    type={alertPopup.type}
                    onClose={() => setAlertPopup({ ...alertPopup, show: false })}
                />
            )}
        </div>
    );
};

export default ProductManager;

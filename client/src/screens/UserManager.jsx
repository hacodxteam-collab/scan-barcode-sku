import React, { useState, useEffect } from 'react';
import { getUsers, addUser, removeUser, updateUser } from '../services/userService';
import { addLog } from '../services/logService';
import AlertPopup from '../components/AlertPopup';

const DEPARTMENTS = ['Warehouse', 'Logistics', 'Sales', 'IT', 'HR', 'Accounting'];
const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Miss'];

const UserManager = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        title: 'Mr.',
        firstName: '',
        lastName: '',
        department: 'Warehouse'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [alertPopup, setAlertPopup] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            title: 'Mr.',
            firstName: '',
            lastName: '',
            department: 'Warehouse'
        });
        setIsEditing(false);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.id.length !== 4) {
            setError('ID must be 4 digits');
            return;
        }
        if (!formData.firstName || !formData.lastName) {
            setError('Name is required');
            return;
        }

        try {
            if (isEditing) {
                await updateUser(formData.id, formData);
                addLog('ADMIN', user, `Updated employee: ${formData.firstName} ${formData.lastName} (${formData.id})`);
                setAlertPopup({
                    show: true,
                    type: 'success',
                    message: `Employee "${formData.firstName} ${formData.lastName}" updated successfully!`
                });
            } else {
                await addUser(formData);
                addLog('ADMIN', user, `Added employee: ${formData.firstName} ${formData.lastName} (${formData.id})`);
                setAlertPopup({
                    show: true,
                    type: 'success',
                    message: `Employee "${formData.firstName} ${formData.lastName}" added successfully!`
                });
            }
            await loadUsers();
            resetForm();
        } catch (err) {
            setError(err.message);
            setAlertPopup({
                show: true,
                type: 'error',
                message: err.message || 'Failed to save employee'
            });
        }
    };

    const handleEdit = (user) => {
        setFormData({
            id: user.id || user.employee_id, // Handle backend vs frontend mismatch if any
            title: user.title || 'Mr.',
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            department: user.department || 'Warehouse'
        });
        setIsEditing(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemove = async (id) => {
        if (window.confirm(`Delete user ${id}?`)) {
            await removeUser(id);
            await loadUsers();
            if (formData.id === id) resetForm();
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, departmentFilter, itemsPerPage]);

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.id.includes(searchTerm) ||
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'ALL' || u.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div>
            {/* ... form card ... */}
            <div className="card form-card">
                <h3>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>ID (4 Digits)</label>
                        <input
                            name="id"
                            type="text"
                            value={formData.id}
                            onChange={(e) => handleChange({ target: { name: 'id', value: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) } })}
                            inputMode="numeric"
                            disabled={isEditing}
                            className={isEditing ? 'disabled' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <select name="title" value={formData.title} onChange={handleChange}>
                            {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>First Name</label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Last Name</label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Department</label>
                        <select name="department" value={formData.department} onChange={handleChange}>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="form-actions">
                        {isEditing && (
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                CANCEL
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'UPDATE USER' : 'ADD USER'}
                        </button>
                    </div>
                </form>
                {error && <p className="error-text">{error}</p>}
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3>Employee List</h3>
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
                        <select
                            className="filter-input"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="ALL">All Departments</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Search Employees..."
                            className="filter-input"
                            style={{ width: '200px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Dept</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((u) => (
                                <tr key={u.id}>
                                    <td><span className="code">{u.id}</span></td>
                                    <td>{u.title} {u.firstName} {u.lastName}</td>
                                    <td><span className="badge">{u.department}</span></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" onClick={() => handleEdit(u)}>
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleRemove(u.id)}>
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-text">No employees found.</td>
                                </tr>
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

export default UserManager;

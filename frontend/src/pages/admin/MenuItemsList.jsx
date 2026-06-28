import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import AdminNavbar from '../../components/AdminNavbar';

const CATEGORIES = ['all', 'coffee', 'breakfast', 'lunch', 'pastries'];

const MenuItemsList = () => {
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchItems = useCallback(async () => {
        try {
            const params = category !== 'all' ? { category } : {};
            const { data } = await api.get('/menu', { params });
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const toggleAvailable = async (item) => {
        try {
            await api.put(`/menu/${item._id}`, { available: !item.available });
            setItems(prev => prev.map(i =>
                i._id === item._id ? { ...i, available: !i.available } : i
            ));
        } catch (err) {
            alert('Failed to update availability');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this menu item?')) return;
        try {
            await api.delete(`/menu/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <AdminNavbar />
            <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.25rem', color: '#7C2D12' }}>Menu Items</h1>
                        <p style={{ margin: 0, color: '#6b7280' }}>Manage your cafe menu</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/menu/new')}
                        style={{ background: '#7C2D12', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        + Add Menu Item
                    </button>
                </div>

                {/* Category filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #7C2D12',
                                background: category === cat ? '#7C2D12' : 'white',
                                color: category === cat ? 'white' : '#7C2D12',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? <p>Loading...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                {['Item', 'Category', 'Price', 'Available', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {items.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <p style={{ margin: 0, fontWeight: '600' }}>{item.name}</p>
                                        {item.description && <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{item.description}</p>}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', textTransform: 'capitalize', color: '#374151' }}>{item.category}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>${item.price.toFixed(2)}</td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {/* Toggle switch */}
                                        <div
                                            onClick={() => toggleAvailable(item)}
                                            style={{
                                                width: '44px', height: '24px', borderRadius: '12px',
                                                background: item.available ? '#A0522D' : '#d1d5db',
                                                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                                            }}>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                                position: 'absolute', top: '3px',
                                                left: item.available ? '23px' : '3px',
                                                transition: 'left 0.2s',
                                            }} />
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <button
                                            onClick={() => navigate(`/admin/menu/${item._id}/edit`)}
                                            style={{ background: 'none', border: 'none', color: '#A0522D', cursor: 'pointer', fontWeight: '600', marginRight: '1rem' }}>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: '600' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {items.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No menu items found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuItemsList;
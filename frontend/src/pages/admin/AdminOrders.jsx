import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import AdminNavbar from '../../components/AdminNavbar';
import StatusBadge from '../../components/StatusBadge';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <AdminNavbar />
            <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ color: '#7C2D12', marginBottom: '1.5rem' }}>All Orders</h1>

                {loading ? <p>Loading...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                {['Order', 'Staff', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map(order => (
                                <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>#{order.orderNumber}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>{order.createdBy?.name}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>{order.items.length}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>${order.totalPrice.toFixed(2)}</td>
                                    <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={order.status} /></td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {order.status === 'ready' && (
                                                <button
                                                    onClick={() => handleStatusChange(order._id, 'completed')}
                                                    style={{ background: '#16A34A', color: 'white', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                                    Complete
                                                </button>
                                            )}
                                            {['submitted', 'queued'].includes(order.status) && (
                                                <button
                                                    onClick={() => handleStatusChange(order._id, 'cancelled')}
                                                    style={{ background: 'white', color: '#DC2626', border: '1px solid #DC2626', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                style={{ background: 'none', color: '#A0522D', border: 'none', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No orders yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
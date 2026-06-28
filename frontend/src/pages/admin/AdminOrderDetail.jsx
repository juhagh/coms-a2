import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import AdminNavbar from '../../components/AdminNavbar';
import StatusBadge from '../../components/StatusBadge';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const navigate = useNavigate();

    const fetchOrder = useCallback(async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    const handleAction = async (newStatus) => {
        try {
            setActing(true);
            await api.put(`/orders/${id}/status`, { status: newStatus });
            await fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order');
        } finally {
            setActing(false);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', background: '#FAF7F2' }}><AdminNavbar /><div style={{ padding: '2rem' }}>Loading...</div></div>;
    if (!order) return <div style={{ minHeight: '100vh', background: '#FAF7F2' }}><AdminNavbar /><div style={{ padding: '2rem' }}>Order not found.</div></div>;

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <AdminNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <button onClick={() => navigate('/admin/orders')}
                        style={{ background: 'none', border: 'none', color: '#A0522D', cursor: 'pointer', marginBottom: '0.5rem', padding: 0, fontSize: '0.9rem' }}>
                    ← Back to Orders
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Order #{order.orderNumber}</h1>
                    <StatusBadge status={order.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Items ({order.items.length})</h3>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <span style={{ fontWeight: '500' }}>{item.name} × {item.quantity}</span>
                                <span style={{ color: '#A0522D', fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        {order.notes && (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Notes</p>
                                <p style={{ margin: 0 }}>{order.notes}</p>
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Details</h3>
                        <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Staff</p>
                        <p style={{ margin: '0 0 0.75rem', fontWeight: '500' }}>{order.createdBy?.name}</p>
                        <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Placed</p>
                        <p style={{ margin: '0 0 1.5rem', fontWeight: '500' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                                <span>Total</span>
                                <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {order.status === 'ready' && (
                                <button onClick={() => handleAction('completed')} disabled={acting}
                                        style={{ width: '100%', background: '#16A34A', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Mark Completed ✓
                                </button>
                            )}
                            {['queued', 'submitted'].includes(order.status) && (
                                <button onClick={() => handleAction('cancelled')} disabled={acting}
                                        style={{ width: '100%', background: 'white', color: '#DC2626', border: '1px solid #DC2626', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
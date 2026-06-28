import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import StatusBadge from '../../components/StatusBadge';
import StaffNavbar from '../../components/StaffNavbar';

const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
};

const OrderDetail = () => {
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
            if (newStatus === 'cancelled') navigate('/staff/orders');
            else await fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order');
        } finally {
            setActing(false);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', background: '#FAF7F2' }}><StaffNavbar /><div style={{ padding: '2rem' }}>Loading...</div></div>;
    if (!order) return <div style={{ minHeight: '100vh', background: '#FAF7F2' }}><StaffNavbar /><div style={{ padding: '2rem' }}>Order not found.</div></div>;

    const subtotal = order.totalPrice;
    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;
    const canCancel = ['queued', 'submitted'].includes(order.status);
    // const canStart = order.status === 'queued';
    const canComplete = order.status === 'ready';

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <StaffNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <button onClick={() => navigate('/staff/orders')}
                        style={{ background: 'none', border: 'none', color: '#A0522D', cursor: 'pointer', marginBottom: '0.5rem', padding: 0, fontSize: '0.9rem' }}>
                    ← Back to Active Orders
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Order #{order.orderNumber}</h1>
                    <StatusBadge status={order.status} />
                </div>
                <p style={{ color: '#6b7280', marginBottom: '2rem', marginTop: '-1.5rem' }}>
                    Placed {timeAgo(order.createdAt)} · Walk-in customer
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Left — items + notes */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Items ({order.items.length})</h3>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    {/*<div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '6px', flexShrink: 0 }} />*/}
                                    {item.image
                                        ? <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                                        : <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '6px' }} />
                                    }
                                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                                </div>
                                <span style={{ color: '#6b7280' }}>x {item.quantity}</span>
                            </div>
                        ))}
                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem', fontWeight: '700' }}>Order notes</h3>
                            <p style={{ margin: 0, color: order.notes ? '#374151' : '#9ca3af', fontStyle: order.notes ? 'normal' : 'italic' }}>
                                {order.notes || 'No special instructions'}
                            </p>
                        </div>
                    </div>

                    {/* Right — order details + actions */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Details</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Customer</p>
                            <p style={{ margin: '0 0 0.75rem', fontWeight: '500' }}>Walk-in</p>
                            <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Placed</p>
                            <p style={{ margin: 0, fontWeight: '500' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
{/*
                            {canStart && (
                                <button onClick={() => handleAction('preparing')} disabled={acting}
                                        style={{ width: '100%', background: '#A0522D', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Start →
                                </button>
                            )}
*/}
                            {canComplete && (
                                <button onClick={() => handleAction('completed')} disabled={acting}
                                        style={{ width: '100%', background: '#16A34A', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Picked Up ✓
                                </button>
                            )}
                            {canCancel && (
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

export default OrderDetail;
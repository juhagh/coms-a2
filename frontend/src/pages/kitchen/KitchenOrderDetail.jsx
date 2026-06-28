import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import KitchenNavbar from '../../components/KitchenNavbar';
import StatusBadge from '../../components/StatusBadge';

const KitchenOrderDetail = () => {
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
            if (newStatus === 'cancelled') navigate('/kitchen/queue');
            else await fetchOrder();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order');
        } finally {
            setActing(false);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', background: '#FAF7F2' }}><KitchenNavbar /><div style={{ padding: '2rem' }}>Loading...</div></div>;
    if (!order) return <div style={{ minHeight: '100vh', background: '#FAF7F2' }}><KitchenNavbar /><div style={{ padding: '2rem' }}>Order not found.</div></div>;

    const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
    const canStart = order.status === 'queued';
    const canMarkReady = order.status === 'preparing';
    const canCancel = ['queued', 'preparing'].includes(order.status);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <KitchenNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <button onClick={() => navigate('/kitchen/queue')}
                        style={{ background: 'none', border: 'none', color: '#A0522D', cursor: 'pointer', marginBottom: '0.5rem', padding: 0, fontSize: '0.9rem' }}>
                    ← Back to Queue
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Order #{order.orderNumber}</h1>
                    <StatusBadge status={order.status} />
                </div>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Placed {elapsed} minute{elapsed !== 1 ? 's' : ''} ago · Walk-in customer
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Left */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Items ({order.items.length})</h3>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    {/*<div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '6px' }} />*/}
                                    {item.image
                                        ? <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
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

                    {/* Right */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Details</h3>
                        <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Customer</p>
                        <p style={{ margin: '0 0 0.75rem', fontWeight: '500' }}>Walk-in</p>
                        <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Placed</p>
                        <p style={{ margin: '0 0 0.75rem', fontWeight: '500' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>Time elapsed</p>
                        <p style={{ margin: '0 0 1.5rem', fontWeight: '700', fontSize: '1.1rem' }}>{elapsed} minute{elapsed !== 1 ? 's' : ''}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {canStart && (
                                <button onClick={() => handleAction('preparing')} disabled={acting}
                                        style={{ width: '100%', background: '#A0522D', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Start →
                                </button>
                            )}
                            {canMarkReady && (
                                <button onClick={() => handleAction('ready')} disabled={acting}
                                        style={{ width: '100%', background: '#A0522D', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Mark Ready →
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

export default KitchenOrderDetail;
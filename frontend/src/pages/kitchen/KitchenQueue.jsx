import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import KitchenNavbar from '../../components/KitchenNavbar';

const COLUMNS = [
    { status: 'queued',    label: 'NEW',       accent: '#2563EB' },
    { status: 'preparing', label: 'PREPARING', accent: '#B45309' },
    { status: 'ready',     label: 'READY',     accent: '#16A34A' },
];

const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
};

const KitchenQueue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.filter(o => ['queued', 'preparing', 'ready'].includes(o.status)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleStatusChange = async (e, orderId, newStatus) => {
        e.stopPropagation();
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const ordersForColumn = (status) => orders.filter(o => o.status === status);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <KitchenNavbar />
            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: '700' }}>Kitchen Queue</h1>
                        <p style={{ margin: 0, color: '#6b7280' }}>Welcome, {orders.length > 0 ? '' : ''}Marcus.</p>
                    </div>
                    <button onClick={fetchOrders}
                            style={{ background: 'white', border: '1px solid #d1d5db', color: '#6b7280', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        ↻ Refresh
                    </button>
                </div>

                {loading ? <p>Loading orders...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {COLUMNS.map(col => (
                            <div key={col.status} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem' }}>
                                {/* Column header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `2px solid ${col.accent}` }}>
                                    <span style={{ color: col.accent, fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{col.label}</span>
                                    <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: '12px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
                                        {ordersForColumn(col.status).length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {ordersForColumn(col.status).length === 0 ? (
                                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>No orders</p>
                                    ) : ordersForColumn(col.status).map(order => {
                                        const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
                                        const isUrgent = elapsed >= 15;
                                        return (
                                            <div key={order._id}
                                                 onClick={() => navigate(`/kitchen/orders/${order._id}`)}
                                                 style={{
                                                     borderRadius: '10px', border: '1px solid #e5e7eb',
                                                     borderLeft: `4px solid ${isUrgent ? '#DC2626' : col.accent}`,
                                                     padding: '1rem', cursor: 'pointer', background: '#fafafa',
                                                 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '700' }}>Order #{order.orderNumber}</span>
                                                    <span style={{ fontSize: '0.8rem', color: isUrgent ? '#DC2626' : '#6b7280', fontWeight: isUrgent ? '700' : '400' }}>
                                                        {timeAgo(order.createdAt)} {isUrgent ? '⚠️' : ''}
                                                    </span>
                                                </div>
                                                <ul style={{ margin: '0 0 0.75rem', padding: '0 0 0 1.1rem' }}>
                                                    {order.items.map((item, i) => (
                                                        <li key={i} style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.15rem' }}>{item.name}</li>
                                                    ))}
                                                </ul>
                                                {order.notes && (
                                                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#B45309', fontStyle: 'italic' }}>📝 {order.notes}</p>
                                                )}
                                                {/*{getNextStatus(order.status) && (
                                                    <button
                                                        onClick={(e) => handleStatusChange(e, order._id, getNextStatus(order.status))}
                                                        style={{ width: '100%', background: '#A0522D', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                        {getActionLabel(order.status)}
                                                    </button>
                                                )}
                                                {order.status === 'ready' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/kitchen/orders/${order._id}`); }}
                                                        style={{ width: '100%', background: 'white', color: '#A0522D', border: '1px solid #A0522D', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                        Picked Up
                                                    </button>
                                                )}*/}
                                                {/* Action buttons */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    {order.status === 'queued' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleStatusChange(e, order._id, 'preparing')}
                                                                style={{ width: '100%', background: '#A0522D', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                Start →
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleStatusChange(e, order._id, 'cancelled')}
                                                                style={{ width: '100%', background: 'white', color: '#DC2626', border: '1px solid #DC2626', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <button
                                                            onClick={(e) => handleStatusChange(e, order._id, 'ready')}
                                                            style={{ width: '100%', background: '#A0522D', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                            Mark Ready →
                                                        </button>
                                                    )}
                                                    {order.status === 'ready' && (
                                                        <button
                                                            onClick={(e) => handleStatusChange(e, order._id, 'completed')}
                                                            style={{ width: '100%', background: '#16A34A', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                            Picked Up ✓
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenQueue;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import StatusBadge from '../../components/StatusBadge';
import StaffNavbar from '../../components/StaffNavbar';

const FILTERS = ['all', 'queued', 'preparing', 'ready'];

const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
};

const ActiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.filter(o => !['completed', 'cancelled'].includes(o.status)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order');
        }
    };

    const getAction = (order) => {
        if (order.status === 'ready') return { label: 'Picked Up', next: 'completed' };
        return null;
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <StaffNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                {/*<h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.25rem' }}>Active Orders</h1>*/}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Active Orders</h1>
                    <button onClick={fetchOrders}
                            style={{ background: 'white', border: '1px solid #d1d5db', color: '#6b7280', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        ↻ Refresh
                    </button>
                </div>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Track submitted, preparing, and ready orders.</p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '0.4rem 1rem', borderRadius: '20px',
                            border: '1px solid #A0522D',
                            background: filter === f ? '#A0522D' : 'white',
                            color: filter === f ? 'white' : '#A0522D',
                            cursor: 'pointer', textTransform: 'capitalize',
                        }}>
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? <p>Loading orders...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                {['Order #', 'Items', 'Status', 'Time', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No orders found.</td></tr>
                            ) : filtered.map(order => {
                                const action = getAction(order);
                                return (
                                    <tr key={order._id}
                                        onClick={() => navigate(`/staff/orders/${order._id}`)}
                                        style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>#{order.orderNumber}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>
                                            {order.items.map(i => i.name).join(', ')}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={order.status} /></td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontSize: '0.85rem' }}>{timeAgo(order.createdAt)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }} onClick={e => e.stopPropagation()}>
                                            {action && (
                                                <button onClick={() => handleAction(order._id, action.next)}
                                                        style={{ background: '#A0522D', color: 'white', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                                                    {action.label}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveOrders;
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import StatusBadge from '../../components/StatusBadge';
import api from '../../axiosConfig';

const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
};

const StaffDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        api.get('/orders').then(r => setOrders(r.data)).catch(console.error);
    }, []);

    const today = new Date().toDateString();
    const active = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
    const readyForPickup = orders.filter(o => o.status === 'ready');
    const completedToday = orders.filter(o =>
        o.status === 'completed' && new Date(o.updatedAt).toDateString() === today
    );
    const recent = orders.slice(0, 3);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <StaffNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: '700' }}>Dashboard</h1>
                        <p style={{ margin: 0, color: '#6b7280' }}>Welcome back, {user?.name}.</p>
                    </div>
                    <button onClick={() => navigate('/staff/menu')}
                            style={{ background: '#A0522D', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
                        + New Order
                    </button>
                </div>

                {/* Stats cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Active Orders', value: active.length, color: '#A0522D' },
                        { label: 'Ready for pickup', value: readyForPickup.length, color: '#16A34A' },
                        { label: 'Completed today', value: completedToday.length, color: '#374151' },
                    ].map(card => (
                        <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                            <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>{card.label}</p>
                            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Recent orders */}
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Recent Orders</h2>
                {recent.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>No orders yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {recent.map(order => (
                            <div key={order._id}
                                 onClick={() => navigate(`/staff/orders/${order._id}`)}
                                 style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '700' }}>Order #{order.orderNumber}</span>
                                    <StatusBadge status={order.status} />
                                </div>
                                <p style={{ margin: '0 0 0.75rem', color: '#6b7280', fontSize: '0.8rem' }}>{timeAgo(order.createdAt)}</p>
                                <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '0 0 0.75rem' }} />
                                <ul style={{ margin: 0, padding: '0 0 0 1.1rem' }}>
                                    {order.items.map((item, i) => (
                                        <li key={i} style={{ color: '#374151', fontSize: '0.875rem' }}>{item.name}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
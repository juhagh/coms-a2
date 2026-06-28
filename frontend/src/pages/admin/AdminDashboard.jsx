import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/AdminNavbar';
import StatusBadge from '../../components/StatusBadge';
import api from '../../axiosConfig';

const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/orders'), api.get('/menu')])
            .then(([o, m]) => { setOrders(o.data); setMenuItems(m.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const today = new Date().toDateString();
    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const revenueToday = ordersToday.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0);
    const activeItems = menuItems.filter(i => i.available).length;
    const recent = orders.slice(0, 5);

    const avgPrepTime = (() => {
        const completed = orders.filter(o => o.status === 'completed');
        if (completed.length === 0) return '—';
        const avg = completed.reduce((sum, o) => {
            return sum + (new Date(o.updatedAt) - new Date(o.createdAt));
        }, 0) / completed.length;
        const mins = Math.round(avg / 60000);
        return `${mins} min`;
    })();

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <AdminNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: '700' }}>Admin Dashboard</h1>
                <p style={{ margin: '0 0 2rem', color: '#6b7280' }}>{greeting()}, {user?.name}.</p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Orders today', value: ordersToday.length, color: '#374151' },
                        { label: 'Revenue today', value: `$${revenueToday.toFixed(0)}`, color: '#374151' },
                        { label: 'Active items', value: `${activeItems} / ${menuItems.length}`, color: '#374151' },
                        { label: 'Avg prep time', value: avgPrepTime, color: '#374151' },
                        // { label: 'Avg prep time', value: '—', color: '#374151' },
                    ].map(card => (
                        <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                            <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>{card.label}</p>
                            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Recent activity */}
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Recent Activity</h2>
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                {loading ? (
                                    <tr><td style={{ padding: '2rem', color: '#6b7280' }}>Loading...</td></tr>
                                ) : recent.map(order => (
                                    <tr key={order._id}
                                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                                        style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600', width: '100px' }}>Order #{order.orderNumber}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#6b7280' }}>{order.createdBy?.name || 'Walk-in'}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>${order.totalPrice.toFixed(2)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={order.status} /></td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontSize: '0.85rem' }}>{timeAgo(order.createdAt)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Quick Actions</h2>
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { label: '+ Add Menu Item', path: '/admin/menu/new', primary: true },
                                { label: 'View Menu', path: '/admin/menu', primary: false },
                                { label: 'View All Orders', path: '/admin/orders', primary: false },
                            ].map(action => (
                                <button key={action.path} onClick={() => navigate(action.path)}
                                        style={{
                                            width: '100%', padding: '0.75rem',
                                            background: action.primary ? '#A0522D' : 'white',
                                            color: action.primary ? 'white' : '#A0522D',
                                            border: action.primary ? 'none' : '1px solid #A0522D',
                                            borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                                        }}>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
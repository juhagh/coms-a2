import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import KitchenNavbar from '../../components/KitchenNavbar';

const KitchenCompleted = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompleted = async () => {
            try {
                const { data } = await api.get('/orders');
                const today = new Date().toDateString();
                setOrders(data.filter(o =>
                    o.status === 'completed' &&
                    new Date(o.updatedAt).toDateString() === today
                ));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompleted();
    }, []);

    const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <KitchenNavbar />
            <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.25rem' }}>Completed Today</h1>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Orders completed during today's service.</p>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Orders completed', value: orders.length, color: '#16A34A' },
                        { label: 'Items served', value: totalItems, color: '#A0522D' },
                    ].map(card => (
                        <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                            <p style={{ margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.85rem' }}>{card.label}</p>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {loading ? <p>Loading...</p> : orders.length === 0 ? (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No completed orders yet today.</p>
                ) : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                {['Order #', 'Items', 'Total', 'Completed'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map(order => (
                                <tr key={order._id}
                                    onClick={() => navigate(`/kitchen/orders/${order._id}`)}
                                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                    <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>#{order.orderNumber}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>{order.items.map(i => i.name).join(', ')}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>${order.totalPrice.toFixed(2)}</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                        {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenCompleted;
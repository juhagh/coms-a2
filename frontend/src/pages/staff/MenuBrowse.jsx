import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import { useCart } from '../../context/CartContext';
import StaffNavbar from '../../components/StaffNavbar';

const CATEGORIES = ['all', 'coffee', 'breakfast', 'lunch', 'pastries'];

const MenuBrowse = () => {
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const { cart, addToCart, total } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const params = category !== 'all' ? { category } : {};
                const { data } = await api.get('/menu', { params });
                setItems(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [category]);

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: cartCount > 0 ? '80px' : '0' }}>
            <StaffNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' }}>Menu</h1>

                {/* Category filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)} style={{
                            padding: '0.4rem 1rem', borderRadius: '20px',
                            border: '1px solid #A0522D',
                            background: category === cat ? '#A0522D' : 'white',
                            color: category === cat ? 'white' : '#A0522D',
                            cursor: 'pointer', textTransform: 'capitalize',
                        }}>
                            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Menu grid */}
                {loading ? <p>Loading menu...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {items.filter(i => i.available).map(item => (
                            <div key={item._id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                {/* Image placeholder */}
                                {/*<div style={{ width: '100%', height: '120px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '0.75rem' }} />*/}
                                {item.image
                                    ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                                    : <div style={{ width: '100%', height: '120px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '0.75rem' }} />
                                }
                                <p style={{ fontWeight: '600', margin: '0 0 0.25rem', fontSize: '1rem' }}>{item.name}</p>
                                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 0.75rem', flex: 1 }}>{item.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>${item.price.toFixed(2)}</span>
                                    <button onClick={() => addToCart(item)} style={{
                                        background: 'white', color: '#374151',
                                        border: '1px solid #d1d5db', padding: '0.35rem 0.9rem',
                                        borderRadius: '8px', cursor: 'pointer', fontWeight: '500',
                                    }}>
                                        + Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fixed cart bar at bottom */}
            {cartCount > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: 'white', borderTop: '1px solid #e5e7eb',
                    padding: '1rem 2rem', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
                }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>
                        Current order: {cartCount} item{cartCount !== 1 ? 's' : ''} · ${total.toFixed(2)}
                    </span>
                    <button onClick={() => navigate('/staff/cart')} style={{
                        background: '#A0522D', color: 'white', border: 'none',
                        padding: '0.6rem 1.5rem', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: '600',
                    }}>
                        Review Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuBrowse;
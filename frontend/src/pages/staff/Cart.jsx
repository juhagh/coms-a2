import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../axiosConfig';
import { useState } from 'react';
import StaffNavbar from '../../components/StaffNavbar';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
    const [notes, setNotes] = useState('');
    const [customerType, setCustomerType] = useState('walkin');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const getCustomerLabel = () => {
        if (customerType === 'table') return `Table ${tableNumber || '?'}`;
        if (customerType === 'named') return customerName || 'Named customer';
        return 'Walk-in customer';
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await api.post('/orders', {
                items: cart.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
                notes,
                customer: getCustomerLabel(),
            });
            clearCart();
            navigate('/staff/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <StaffNavbar />
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>Your cart is empty.</p>
                <button onClick={() => navigate('/staff/menu')}
                        style={{ color: '#A0522D', background: 'none', border: '1px solid #A0522D', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                    Browse Menu
                </button>
            </div>
        </div>
    );

    const subtotal = total;
    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;

    const selectStyle = {
        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
        border: '1px solid #d1d5db', fontSize: '0.95rem',
        boxSizing: 'border-box', background: 'white',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
            <StaffNavbar />
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <button onClick={() => navigate('/staff/menu')}
                        style={{ background: 'none', border: 'none', color: '#A0522D', cursor: 'pointer', marginBottom: '0.5rem', padding: 0, fontSize: '0.9rem' }}>
                    ← Back to Menu
                </button>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.25rem' }}>Review Order</h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Confirm items before submitting</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Left — items + notes */}
                    <div>
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Items ({cart.length})</h3>
                            {cart.map(item => (
                                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                                    {/*<div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', flexShrink: 0 }} />*/}
                                    {item.image
                                        ? <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                        : <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', flexShrink: 0 }} />
                                    }
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: '600' }}>{item.name}</p>
                                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{item.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', background: 'white', fontSize: '1rem' }}>−</button>
                                        <span style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', background: 'white', fontSize: '1rem' }}>+</button>
                                    </div>
                                    <span style={{ width: '60px', textAlign: 'right', fontWeight: '500' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                    <button onClick={() => removeFromCart(item._id)}
                                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.75rem', fontWeight: '700' }}>Order notes (optional)</h3>
                            <textarea
                                placeholder="e.g. Allergy notes, prep preferences..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    {/* Right — order details */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontWeight: '700' }}>Order Details</h3>

                        {/* Customer type */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500', color: '#374151', fontSize: '0.9rem' }}>Customer</label>
                            <select value={customerType} onChange={e => setCustomerType(e.target.value)} style={selectStyle}>
                                <option value="walkin">Walk-in customer</option>
                                <option value="table">Table number</option>
                                <option value="named">Named customer</option>
                            </select>
                        </div>

                        {customerType === 'table' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500', color: '#374151', fontSize: '0.9rem' }}>Table number</label>
                                <input
                                    type="number" min="1" value={tableNumber}
                                    onChange={e => setTableNumber(e.target.value)}
                                    placeholder="e.g. 3"
                                    style={selectStyle}
                                />
                            </div>
                        )}

                        {customerType === 'named' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500', color: '#374151', fontSize: '0.9rem' }}>Customer name</label>
                                <input
                                    type="text" value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="e.g. Juha"
                                    style={selectStyle}
                                />
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#6b7280' }}>
                                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#6b7280' }}>
                                <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={handleSubmit} disabled={submitting} style={{
                            marginTop: '1.5rem', width: '100%', background: '#A0522D',
                            color: 'white', border: 'none', padding: '0.875rem',
                            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                        }}>
                            {submitting ? 'Placing order...' : 'Submit Order →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
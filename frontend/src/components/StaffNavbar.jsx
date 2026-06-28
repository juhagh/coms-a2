import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavUserBadge from './NavUserBadge';

const StaffNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const links = [
        { label: 'Dashboard', path: '/staff/dashboard' },
        { label: 'New Order', path: '/staff/menu' },
        { label: 'Active Orders', path: '/staff/orders' },
    ];

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <nav style={{
            background: 'white', borderBottom: '1px solid #e5e7eb',
            padding: '0 1.5rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', height: '56px',
        }}>
            <span style={{ color: '#A0522D', fontWeight: '700', fontSize: '1.1rem' }}>☕ Cafe POS</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                {links.map(link => (
                    <button key={link.path} onClick={() => navigate(link.path)} style={{
                        background: 'none', border: 'none',
                        color: location.pathname === link.path ? '#A0522D' : '#6b7280',
                        fontWeight: location.pathname === link.path ? '600' : '400',
                        cursor: 'pointer', fontSize: '0.95rem',
                        borderBottom: location.pathname === link.path ? '2px solid #A0522D' : '2px solid transparent',
                        paddingBottom: '2px',
                    }}>
                        {link.label}
                    </button>
                ))}
            </div>
            <NavUserBadge name={user?.name} role={user?.role} onLogout={handleLogout} light />
        </nav>
    );
};

export default StaffNavbar;
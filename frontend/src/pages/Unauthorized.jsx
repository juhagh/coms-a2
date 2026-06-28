import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to view this page.</p>
            <button onClick={handleLogout}>Back to Login</button>
        </div>
    );
};

export default Unauthorized;
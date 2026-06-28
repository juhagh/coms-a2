const NavUserBadge = ({ name, role, onLogout, light = false }) => {
    const textColor = light ? '#374151' : 'white';
    const borderColor = light ? '#d1d5db' : 'rgba(255,255,255,0.5)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: textColor }}>{name}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: light ? '#6b7280' : 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{role}</p>
            </div>
            <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: light ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: textColor, fontWeight: '700', fontSize: '0.9rem',
            }}>
                {name?.charAt(0).toUpperCase()}
            </div>
            <button
                onClick={onLogout}
                style={{
                    background: 'none', border: `1px solid ${borderColor}`,
                    color: textColor, padding: '0.3rem 0.75rem',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                }}>
                Logout
            </button>
        </div>
    );
};

export default NavUserBadge;
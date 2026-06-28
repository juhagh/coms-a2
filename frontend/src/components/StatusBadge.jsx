const STATUS_STYLES = {
    draft:      { background: '#F3F4F6', color: '#6B7280' },
    submitted:  { background: '#DBEAFE', color: '#2563EB' },
    queued:     { background: '#DBEAFE', color: '#2563EB' },
    preparing:  { background: '#FEF3C7', color: '#B45309' },
    ready:      { background: '#DCFCE7', color: '#16A34A' },
    completed:  { background: '#F3F4F6', color: '#6B7280' },
    cancelled:  { background: '#FEE2E2', color: '#DC2626' },
};

const StatusBadge = ({ status }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
    return (
        <span style={{
            ...style,
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'capitalize',
        }}>
            {status}
        </span>
    );
};

export default StatusBadge;
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '80vh', padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1>Compassionate Home Health & Hospice</h1>
            <p>Temporary landing page for navigation testing.</p>

            <button onClick={() => navigate('/home-health')}>Home Health</button>
            <button onClick={() => navigate('/hospice')}>Hospice</button>
            <button onClick={() => navigate('/locations')}>Locations</button>
            <button onClick={() => navigate('/schedule')}>Schedule</button>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/portal')}>Portal</button>
            <button onClick={() => navigate('/admin')}>Admin</button>
        </div>
    );
}

export default LandingPage;
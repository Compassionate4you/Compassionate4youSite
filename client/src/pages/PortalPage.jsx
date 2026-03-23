import { useState } from 'react';
import './styles/portal.css';

function PortalPage() {
    const [visitCount, setVisitCount] = useState(1);

    return (
        <div>
            {/* DT-59: User Dashboard / Welcome page */}
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">Customer Portal</div>
                        <div className="navbar-subtitle">Welcome, John Doe</div>
                    </div>
                </div>
                <div className="navbar-right">
                    <button>Home</button>
                    {/* DT-64: Logout button takes user to Login page */}
                    <button>Logout</button>
                </div>
            </div>

            <div className="content">
                <div className="welcome-banner">
                    <h1>Welcome back, John Doe!</h1>
                    <p>Manage your appointments and health care information</p>
                </div>

                <div className="cards-row">
                    {/* DT-61: Takes user to Schedule an Appointment page */}
                    <div className="card">
                        <h3>Schedule Appointment</h3>
                        <p>Book a new home health or hospice appointment</p>
                    </div>

                    {/* DT-60: Upcoming Visits counter */}
                    <div className="card">
                        <h3>Upcoming Visits</h3>
                        <div className="visit-number">{visitCount}</div>
                        <p>Confirmed appointments</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PortalPage;
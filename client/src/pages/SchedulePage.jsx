import { useState } from 'react';
import './styles/portal.css';

function SchedulePage() {
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <div>
            {/* DT-61: Schedule an Appointment page */}
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
                    <button>Logout</button>
                </div>
            </div>

            <div className="content">
                <button className="back-btn">← Back to Dashboard</button>

                <div className="section-box">
                    <h2>Schedule an Appointment</h2>
                    <p className="desc">Please provide your details and preferred appointment time.</p>

                    <div className="field">
                        <label>Full Name</label>
                        <input type="text" placeholder="John Doe" />
                    </div>
                    <div className="field">
                        <label>Phone Number</label>
                        <input type="text" placeholder="(555) 123-4567" />
                    </div>
                    <div className="field">
                        <label>Email Address</label>
                        <input type="email" placeholder="you@example.com" />
                    </div>
                    <div className="field">
                        <label>Service Type</label>
                        <select>
                            <option>Select a service</option>
                            <option>Home Health</option>
                            <option>Hospice Care</option>
                            <option>General Consultation</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Preferred Date</label>
                        <input type="date" />
                    </div>
                    <div className="field">
                        <label>Additional Notes</label>
                        <textarea placeholder="Any symptoms, concerns, or requests..."></textarea>
                    </div>

                    <button className="btn-primary" onClick={() => setShowSuccess(true)}>Confirm Appointment</button>
                    <button className="btn-secondary">Cancel</button>

                    {showSuccess && (
                        <div className="success-msg">
                            Appointment request submitted! We will confirm your visit shortly.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
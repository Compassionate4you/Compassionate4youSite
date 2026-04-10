import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/portal.css';

function PortalPage() {
    const { t } = useTranslation();
    const [visitCount, setVisitCount] = useState(1);

    // DT-62: My Appointments list
  const [appointments, setAppointments] = useState([
    { service: 'Home Health', date: 'March 5, 2026', time: '10:00 AM - 11:00 AM', provider: 'Nurse Johnson', status: 'Confirmed' },
    { service: 'Home Health', date: 'March 12, 2026', time: '2:00 PM - 3:00 PM', provider: 'TBD', status: 'Pending' },
  ]);
 
  const navigate = useNavigate();
 
  // DT-62: Cancel an appointment row
  function cancelAppointment(index) {
    const updated = appointments.filter((_, i) => i !== index);
    setAppointments(updated);
  }

    return (
        <div>
            {/* DT-59: User Dashboard / Welcome page */}
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">{t('portal.title')}</div>
                        <div className="navbar-subtitle">{t('portal.welcome')}</div>
                    </div>
                </div>
                <div className="navbar-right">
                    <button>{t('nav.home')}</button>
                    {/* DT-64: Logout button takes user to Login page */}
                    <button>{t('nav.logout')}</button>
                </div>
            </div>

            <div className="content">
                <div className="welcome-banner">
                    <h1>{t('portal.welcomeBanner')}</h1>
                    <p>{t('portal.welcomeSubtitle')}</p>
                </div>

                <div className="cards-row">
                    {/* DT-61: Takes user to Schedule an Appointment page */}
                    <div className="card" onClick={() => navigate('/schedule')}>
                        <h3>{t('portal.scheduleCard')}</h3>
                        <p>{t('portal.scheduleCardDesc')}</p>
                    </div>

                    {/* DT-60: Upcoming Visits counter */}
                    <div className="card">
                        <h3>{t('portal.upcomingVisits')}</h3>
                        <div className="visit-number">{visitCount}</div>
                        <p>{t('portal.confirmedAppointments')}</p>
                    </div>
                </div>

            {/* DT-62: My Appointments Table */}
            <div className="section-box">
                <h2>My Appointments</h2>
                <p className="desc">View and Manage Your Scheduled Appointments</p>
                <table>
                    <thead>
                        <tr>
                            <th>Service Type</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appt,index)=> (
                            <tr key={index}>
                                <td>{appt.service}</td>
                                <td>{appt.date}</td>
                                <td>{appt.time}</td>
                                <td>{appt.provider}</td>
                                <td>
                                    <span className={appt.status === 'Confirmed' ? 'badge badge-confirmed' : 'badge badge-pending'}>
                                        {appt.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-reschedule" onClick={() => navigate('/schedule')}>Reschedule</button>
                                    <button className="btn-cancel-appt" onClick={() => cancelAppointment(index)}>Cancel</button>
                                </td>
                               </tr>
                            ))} 
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default PortalPage;
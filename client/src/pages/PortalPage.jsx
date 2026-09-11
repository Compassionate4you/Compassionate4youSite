import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/portal.css';
import { Plus, Calendar, Settings, Pencil, Trash2 } from 'lucide-react';

function PortalPage() {
    const { t } = useTranslation();
    const [visitCount, setVisitCount] = useState(1);
    const saved = JSON.parse(localStorage.getItem('profileSettings') || '{}');


    // Profile Settings modal open and close state
    const[showProfile, setShowProfile]=useState(false);
    //Active tab inside profile settings
    const[activeTab,setActiveTab]=useState('personal');
    //Personal information Tab
    const[fullName, setFullName]=useState(saved.fullName || 'John Doe');
    const[email,setEmail]=useState(saved.email || 'customer@example.com');
    const[phone,setPhone]=useState(saved.phone || '(555) 123-4567');
    const[address,setAddress]=useState(saved.address || '123 Main St');
    const[city,setCity]=useState(saved.city || 'Sacramento');
    const[state,setState]=useState(saved.state || 'California');
    const[zip,setZip]=useState(saved.zip || '95819');
    const[emergencyName,setEmergencyName]=useState(saved.emergencyName || 'Jane Doe');
    const[emergencyPhone,setEmergencyPhone]=useState(saved.emergencyPhone || '(555) 987-6543');
    //Preferences Tab
    const[emailNotif,setEmailNotif]=useState(saved.emailNotif ?? true);
    const[smsNotif,setSmsNotif]=useState(saved.smsNotif ?? false);
    const[preferredContact,setPreferredContact]=useState(saved.preferredContact || 'email');
    //Security Tab
    const[currentPassword,setCurrentPassword]=useState('');
    const[newPassword,setNewPassword]=useState('');
    const[twoFactor,setTwoFactor]=useState(saved.twoFactor ?? false);
    //DT-66: track which appointment tab is active (upcoming or past)
    const[apptTab, setApptTab]=useState('upcoming');


    // DT-144: mock appointments with a date near today so upcoming notification logic can trigger
  const [appointments, setAppointments] = useState([
    { service: 'Home Health', date: 'September 13, 2026', time: '10:00 AM - 11:00 AM', provider: 'Nurse Johnson', status: 'Confirmed' },
    { service: 'Home Health', date: 'September 20, 2026', time: '2:00 PM - 3:00 PM', provider: 'TBD', status: 'Pending' },
    // DT-66: mock past appointments for testing the Past tab
    { service: 'Home Health', date: 'August 15, 2026', time: '10:00 AM - 11:00 AM', provider: 'Nurse Johnson', status: 'Confirmed' },
    { service: 'Hospice', date: 'July 22, 2026', time: '2:00 PM - 3:00 PM', provider: 'Nurse Patel', status: 'Confirmed' },
    { service: 'Home Health', date: 'June 30, 2026', time: '9:00 AM - 10:00 AM', provider: 'Nurse Johnson', status: 'Pending' },
  ]);
 
  const navigate = useNavigate();
 
  // DT-62: Cancel an appointment row
  function cancelAppointment(apptToCancel) {
    const updated = appointments.map((a) => a === apptToCancel ? { ...a, status: 'Cancelled' } : a);
    setAppointments(updated);

    if (apptToCancel.status === 'Confirmed'){
        setVisitCount(visitCount - 1);
    }
}
    function handleSave(){
        localStorage.setItem('profileSettings',JSON.stringify({
            fullName, email, phone, address, city, state, zip,
            emergencyName, emergencyPhone,
            emailNotif, smsNotif, preferredContact,
            twoFactor
        }));
        alert('Changes saved!');
        setShowProfile(false);
}


    // DT-144 (361): determine which appointments fall within the next 48 hours
    function getUpcomingAppointments() {
        const now = new Date();
        return appointments.find((appt) => {
            if(appt.status !== 'Confirmed') return false;
            // appt.time looks like "10:00 AM - 11:00 AM"; we only need the start time
            const startTime = appt.time.split(' - ')[0]; //
            const apptDateTime = new Date(`${appt.date} ${startTime}`); // Combine date and time into a single Date object

            const hoursUntil=(apptDateTime-now)/(1000*60*60);
            return hoursUntil>0&&hoursUntil<=48;
        });
    }

    // DT-66(346): Split appointments into past vs upcoming based on date
    function isPastAppt(appt){
        if(appt.status==='Cancelled') return true; // Cancelled appointments are considered past

        const apptDate=new Date(appt.date);
        const today=new Date();
        today.setHours(0,0,0,0); // Set to midnight for accurate comparison
        return apptDate<today;
    }

    const upcomingAppt=getUpcomingAppointments();

    return (
        <div>
            {/* DT-59: User Dashboard / Welcome page */}
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">{t('portal.title')}</div>
                        <div className="navbar-subtitle">Welcome, {fullName}
                        {/* DT-144: show upcoming appointment notification*/}
                        {upcomingAppt && (
                            <span className="notification-icon"
                                title={`Upcoming: ${upcomingAppt.service} — ${upcomingAppt.date} at ${upcomingAppt.time.split(' - ')[0]}`}
                            >
                                🔔
                                <span className="notification-badge">!</span>
                        </span>
                    )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="welcome-banner">
                    <h1>{t('portal.welcomeBanner')}</h1>
                    <p>{t('portal.welcomeSubtitle')}</p>
                </div>

                <div className="cards-row">
                    {/* DT-61: Takes user to Schedule an Appointment page */}
                    {/* DT-149: icon badge for upcoming appointment */}
                    <div className="card" onClick={() => navigate('/schedule')}>
                        <div className="card-icon card-icon-blue">
                            <Plus size={20}/>
                        </div>
                        <h3>{t('portal.scheduleCard')}</h3>
                        <p>{t('portal.scheduleCardDesc')}</p>
                    </div>

                    {/* DT-60: Upcoming Visits counter */}
                    <div className="card">
                        <div className="card-icon card-icon-green">
                            <Calendar size={20}/>
                        </div>
                        <h3>{t('portal.upcomingVisits')}</h3>
                        <div className="visit-number">{visitCount}</div>
                        <p>{t('portal.confirmedAppointments')}</p>
                    </div>

                {/*Profile Settings Card - opens modal*/}
                <div className="card" onClick={()=>setShowProfile(true)}>
                    <div className="card-icon card-icon-purple">
                        <Settings size={20}/>
                    </div>
                    <h3>Profile Settings</h3>
                    <p>Update your contact information and preferences</p>
                </div>

            </div>

            {/* DT-62: My Appointments Table */}
            <div className="section-box">
                <h2>My Appointments</h2>
                <p className="desc">View and Manage Your Scheduled Appointments</p>

                {/* DT-66 (347): tabs to switch between upcoming and past appointments */}
                <div className="tabs">
                    <button className={apptTab === 'upcoming' ? 'tab active-tab' : 'tab'} onClick={()=>setApptTab('upcoming')}>Upcoming</button>
                    <button className={apptTab === 'past' ? 'tab active-tab' : 'tab'} onClick={()=>setApptTab('past')}>Past</button>
                </div>
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
                        {appointments.filter((appt) => apptTab==='past' ? isPastAppt(appt) : !isPastAppt(appt)).map((appt,index)=> (
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
                                    {apptTab==='past' ? (
                                        <span className={appt.status==='Cancelled' ? 'badge badge-confirmed': 'badge badge-pending'}>
                                            {appt.status==='Cancelled' ? 'Cancelled' : 'Completed'}
                                        </span>
                                    ) : (
                                        <>
                                    <button className="btn-reschedule" onClick={() => navigate('/schedule')} title="Reschedule"> <Pencil size={16}/> </button>
                                    <button className="btn-cancel-appt" onClick={() => cancelAppointment(appt)} title="Cancel"> <Trash2 size={16}/> </button>
                                    </>
                             )}
                                </td>
                            </tr>
                        ))} 
                    </tbody>
                </table>
            </div>
        </div>

        {/* DT-63: Profile Settings Modal */}
            {showProfile && (
                <div className="modal-overlay">
                    <div className="modal">
                        {/*Modal header*/}
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Profile Settings</h2>
                                <p className="modal-subtitle">Update your contact information and preferences</p>
                            </div>
                            <button className="modal-close" onClick={()=>setShowProfile(false)}>x</button>
                        </div>
                        {/* Tabs Navigation */}
                        <div className="tabs">
                            <button className={activeTab === 'personal' ? 'tab active-tab' : 'tab'} onClick={()=>setActiveTab('personal')}>Personal Info</button>
                            <button className={activeTab === 'preferences' ? 'tab active-tab' : 'tab'} onClick={()=>setActiveTab('preferences')}>Preferences</button>
                            <button className={activeTab === 'security' ? 'tab active-tab' : 'tab'} onClick={()=>setActiveTab('security')}>Security</button>
                        </div>
                        {/* Tab Content */}
                        <div className="modal-body">
                            {/*Personal Info Tab*/}
                            {activeTab === 'personal' && (
                                <div>
                                    <h3 className="section-heading">Contact Information</h3>
                                    <div className="form-row-two">
                                        <div className="field">
                                            <label>Full Name *</label>
                                            <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)}/>
                                        </div>
                                        <div className="field">
                                            <label>Email Address *</label>
                                            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                                        </div>
                                    </div>
                                    <div className="form-row-two">
                                        <div className="field">
                                            <label> Phone Number *</label>
                                            <input type="text" value={phone} onChange={(e)=>setPhone(e.target.value)}/>
                                        </div>
                                        <div className="field">
                                            <label>Street Address</label>
                                            <input type="text" value={address} onChange={(e)=>setAddress(e.target.value)}/>
                                        </div>
                                    </div>
                                    <div className="form-row-three">
                                        <div className="field">
                                            <label>City</label>
                                            <input type="text" value={city} onChange={(e)=>setCity(e.target.value)}/>
                                        </div>
                                        <div className="field">
                                            <label>State</label>
                                            <input type="text" value={state} onChange={(e)=>setState(e.target.value)}/>
                                        </div>
                                        <div className="field">
                                            <label>ZIP Code *</label>
                                            <input type="text" value={zip} onChange={(e)=>setZip(e.target.value)}/>
                                        </div>
                                    </div>

                                    <h3 className="section-heading">Emergency Contact</h3>
                                    <div className="form-row-two">
                                        <div className="field">
                                            <label>Emergency Contact Name</label>
                                            <input type="text" value={emergencyName} onChange={(e)=>setEmergencyName(e.target.value)}/>
                                        </div>
                                        <div className="field">
                                            <label>Emergency Contact Phone</label>
                                            <input type="text" value={emergencyPhone} onChange={(e)=>setEmergencyPhone(e.target.value)}/>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div>
                                    <h3 className="section-heading">Notification Settings</h3>
                                    <div className="field">
                                        <label className="checkbox-label">
                                            <input type="checkbox" checked={emailNotif} onChange={(e)=>setEmailNotif(e.target.checked)}/>Email Notifications</label>
                                    </div>
                                    <div className="field">
                                        <label className="checkbox-label">
                                            <input type="checkbox" checked={smsNotif} onChange={(e)=>setSmsNotif(e.target.checked)}/>SMS Notifications</label>
                                    </div>

                                    <h3 className="section-heading">Communication Preferences</h3>
                                    <div className="field">
                                        <label>Preferred Contact Method</label>
                                        <select value={preferredContact} onChange={(e)=>setPreferredContact(e.target.value)}>
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="sms">SMS</option>
                                        </select>
                                    </div>
                                 </div>
                            )}

                            {/* Security Tab*/}
                            {activeTab === 'security' && (
                                <div>
                                    <h3 className="section-heading">Account Security</h3>
                                    <div className="field">
                                        <label>Current Passwords</label>
                                        <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} placeholder="Enter current password"/>
                                    </div>
                                    <div className="field">
                                        <label>New Password</label>
                                        <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Enter new password"/>
                                    </div>
                                    <div className="field">
                                        <label className="checkbox-label">
                                        <input type="checkbox" checked={twoFactor} onChange={(e)=>setTwoFactor(e.target.checked)}/>Enable Two-Factor Authentication</label>
                                    </div>

                                    <h3 className="section-heading">Active Sessions</h3>
                                    <p className="session-desc">Manage devices where you are currently logged in</p>
                                    <div className="session-item">
                                        <div>
                                            <div className="session-device">Chrome on Windows</div>
                                            <div className="session-location">Sacramento, CA - Active Now</div>
                                        </div>
                                        <button className="btn-cancel-appt">Log Out</button>
                                    </div>
                                    <div className="session-item">
                                        <div>
                                            <div className="session-device">Safari on iPhone</div>
                                            <div className="session-location">Sacramento, CA - 2 hours ago</div>
                                        </div>
                                        <button className="btn-cancel-appt">Log Out</button>
                                    </div>
                                </div>
                            )}

                        </div>
                        {/*Modal Footer*/}
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={()=>setShowProfile(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PortalPage;
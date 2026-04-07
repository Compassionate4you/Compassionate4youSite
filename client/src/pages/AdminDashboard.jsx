import React, { useState } from "react";
//import css - Chnage name later
//import "./CSS-Compassionate-Appointments.css"; 

const AdminDashboard = () => {
  const [tab, setTab] = useState("appointments");
//placeholder, not funtion, after schedule
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: "John Doe",
      service: "Home Health",
      date: "March 5, 2026",
      time: "10:00 AM",
      provider: "Nurse Johnson",
      status: "Confirmed",
    },
    {
      id: 2,
      name: "Mary Smith",
      service: "Hospice",
      date: "March 5, 2026",
      time: "2:00 PM",
      provider: "TBD",
      status: "Pending",
    },
    {
      id: 3,
      name: "Robert Williams",
      service: "Home Health",
      date: "March 6, 2026",
      time: "9:00 AM",
      provider: "Therapist Davis",
      status: "Confirmed",
    },
  ]);

  const confirmAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Confirmed" } : a))
    );
  };

  const rejectAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a))
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="topbar">
        <div className="logo">CH</div>
        <div className="header-text">
          <h1>Admin Dashboard</h1>
          <p>Welcome, Admin User</p>
        </div>
        <div className="top-actions">
          <button>Home</button>
          <button>Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        <button
          className={tab === "appointments" ? "active" : ""}
          onClick={() => setTab("appointments")}
        >
          Appointments
        </button>
        <button
          className={tab === "content" ? "active" : ""}
          onClick={() => setTab("content")}
        >
          Content
        </button>
        <button
          className={tab === "locations" ? "active" : ""}
          onClick={() => setTab("locations")}
        >
          Locations
        </button>
        <button
          className={tab === "accounts" ? "active" : ""}
          onClick={() => setTab("accounts")}
        >
          Accounts
        </button>
      </nav>

      <main className="content">
        {/* Appointments Tab */}
        {tab === "appointments" && (
          <>
            {/* Appointment Management */}
            <section className="appointments">
              <div className="appointments-header">
                <div>
                  <h2>Appointment Management</h2>
                  <p>View and manage all patient appointments</p>
                </div>
                <div className="controls">
                  <input type="text" placeholder="Search patients..." />
                  <select>
                    <option>All Services</option>
                    <option>Home Health</option>
                    <option>Hospice</option>
                  </select>
                </div>
              </div>

              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{a.service}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>{a.provider}</td>
                      <td>
                        <span
                          className={`status ${
                            a.status.toLowerCase() === "confirmed"
                              ? "confirmed"
                              : a.status.toLowerCase() === "pending"
                              ? "pending"
                              : "rejected"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <button className="reschedule">Reschedule</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Appointment Reminder */}
            <section className="appointments" style={{ marginTop: "20px" }}>
              <h2>Appointment Reminder</h2>
              <p>Upcoming appointments requiring confirmation</p>

              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter((a) => a.status === "Pending")
                    .map((a) => (
                      <tr key={a.id}>
                        <td>{a.name}</td>
                        <td>{a.service}</td>
                        <td>{a.date}</td>
                        <td>
                          <span className="status pending">{a.status}</span>
                        </td>
                        <td>
                          <button
                            className="confirm"
                            onClick={() => confirmAppointment(a.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="reject"
                            onClick={() => rejectAppointment(a.id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {/* Other Tabs */}
        {tab === "content" && <h2>Content Page</h2>}
        {tab === "locations" && <h2>Locations Page</h2>}
        {tab === "accounts" && <h2>Accounts Page</h2>}
      </main>
    </div>
  );
};

export default AdminDashboard;

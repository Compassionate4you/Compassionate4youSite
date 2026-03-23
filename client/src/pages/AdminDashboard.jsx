import React, { useState } from "react";
// Remember to "Import CSS here."

const AdminDashboard = () => {
  const [tab, setTab] = useState("appointments");

  const appointments = [
    { name: "John Doe", service: "Home Health", date: "March 5", status: "Confirmed" },
    { name: "Mary Smith", service: "Hospice", date: "March 5", status: "Pending" },
    { name: "Robert Williams", service: "Home Health", date: "March 6", status: "Confirmed" },
  ];

  return (
    <div>
      {/* Top bar */}
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

      {/* Tabs Navigation */}
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

      {/* Content */}
      <main className="content">
        {/* Appointments Tab */}
        {tab === "appointments" && (
          <div>
            <h2>Appointments</h2>

            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={i}>
                    <td>{a.name}</td>
                    <td>{a.service}</td>
                    <td>{a.date}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Content Tab */}
        {tab === "content" && <h2>Content Page (coming soon)</h2>}

        {/* Locations Tab */}
        {tab === "locations" && <h2>Locations Page (coming soon)</h2>}

        {/* Accounts Tab */}
        {tab === "accounts" && <h2>Accounts Page (coming soon)</h2>}
      </main>
    </div>
  );
};

export default AdminDashboard;

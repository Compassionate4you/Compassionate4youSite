import React, { useState } from "react";

const AdminDashboard = () => {
  const [tab, setTab] = useState("appointments");

  const appointments = [
    { name: "John Doe", service: "Home Health", date: "March 5", status: "Confirmed" },
    { name: "Mary Smith", service: "Hospice", date: "March 5", status: "Pending" },
    { name: "Robert Williams", service: "Home Health", date: "March 6", status: "Confirmed" },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin User</p>

      <div style={{ margin: "20px 0" }}>
        <button onClick={() => setTab("appointments")}>Appointments</button>
        <button onClick={() => setTab("content")}>Content</button>
        <button onClick={() => setTab("locations")}>Locations</button>
        <button onClick={() => setTab("accounts")}>Accounts</button>
      </div>

      
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

      {tab === "content" && <h2>Content Page (coming soon)</h2>}
      {tab === "locations" && <h2>Locations Page (coming soon)</h2>}
      {tab === "accounts" && <h2>Accounts Page (coming soon)</h2>}
    </div>
  );
};

export default AdminDashboard;
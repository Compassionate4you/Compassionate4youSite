import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [tab, setTab] = useState("appointments");
    const navigate = useNavigate();

    const appointments = [
        { name: "John Doe", service: "Home Health", date: "March 5", status: "Confirmed" },
        { name: "Mary Smith", service: "Hospice", date: "March 5", status: "Pending" },
        { name: "Robert Williams", service: "Home Health", date: "March 6", status: "Confirmed" },
    ];

    const accounts = [
        {
        id: 1,
        name: "John Doe",
        birthdate: "Apr 12, 88",
        email: "john.doe@example.com",
        role: "Customer",
        created: "Jan 15, 26",
        status: "Active",
        lastLogin: "Mar 08, 26",
        },
        {
        id: 2,
        name: "Mary Smith",
        birthdate: "Oct 03, 75",
        email: "mary.smith@example.com",
        role: "Customer",
        created: "Feb 10, 26",
        status: "Active",
        lastLogin: "Mar 07, 26",
        },
        {
        id: 3,
        name: "Robert Williams",
        birthdate: "Nov 21, 69",
        email: "robert.will@example.com",
        role: "Customer",
        created: "May 22, 25",
        status: "Inactive",
        lastLogin: "Oct 28, 25",
        },
        {
        id: 4,
        name: "James Cameron",
        birthdate: "Aug 18, 80",
        email: "james.cam@admin.com",
        role: "Admin",
        created: "Sep 01, 25",
        status: "Active",
        lastLogin: "April 08, 26",
        },
        {
        id: 5,
        name: "Michael Brown",
        birthdate: "Sep 16, 75",
        email: "michael.brown@admin.com",
        role: "Admin",
        created: "Jan 26, 26",
        status: "Active",
        lastLogin: "April 01, 26",
        },
    ];

    const contentItems = [
        {
        id: 1,
        title: "Home Page",
        section: "Philosophy",
        updated: "Feb 20, 2026",
        },
        {
        id: 2,
        title: "Home Page",
        section: "2021",
        updated: "Feb 18, 2026",
        },
        {
        id: 3,
        title: "Home Page",
        section: "Specialty Services",
        updated: "Feb 15, 2026",
        },
        {
        id: 4,
        title: "Home Page",
        section: "Contact",
        updated: "Feb 12, 2026",
        },
    ];

    return (
        <div>
            <header className="topbar">
                <div className="logo">CH</div>
                <div className="header-text">
                    <h1>{t('admin.title')}</h1>
                    <p>{t('admin.welcome')}</p>
                </div>
                <div className="top-actions">
                    <button>{t('nav.home')}</button>
                    <button>{t('nav.logout')}</button>
                </div>
            </header>

            <nav className="tabs">
                <button className={tab === "appointments" ? "active" : ""} onClick={() => setTab("appointments")}>
                    {t('admin.tabs.appointments')}
                </button>
                <button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>
                    {t('admin.tabs.content')}
                </button>
                <button className={tab === "locations" ? "active" : ""} onClick={() => setTab("locations")}>
                    {t('admin.tabs.locations')}
                </button>
                <button className={tab === "accounts" ? "active" : ""} onClick={() => setTab("accounts")}>
                    {t('admin.tabs.accounts')}
                </button>
            </nav>

            <main className="content">
                {tab === "appointments" && (
                    <div>
                        <h2>{t('admin.tabs.appointments')}</h2>
                        <table border="1" cellPadding="10">
                            <thead>
                                <tr>
                                    <th>{t('admin.table.patient')}</th>
                                    <th>{t('admin.table.service')}</th>
                                    <th>{t('admin.table.date')}</th>
                                    <th>{t('admin.table.status')}</th>
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
                
                {tab === "accounts" && (
                    <div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <div>
                                <h2>Account Management</h2>
                                    <p>Manage user accounts</p>
                            </div>

                            <button
                                style={{
                                    backgroundColor: "#020617",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                }}
                            >
                                Add Account
                            </button>
                        </div>

                        <table border="1" cellPadding="10">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Birthdate</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account) => (
                                    <tr key={account.id}>
                                        <td>{account.name}</td>
                                        <td>{account.birthdate}</td>
                                        <td>{account.email}</td>
                                        <td>{account.role}</td>
                                        <td>{account.created}</td>
                                        <td>{account.status}</td>
                                        <td>{account.lastLogin}</td>
                                        <td>
                                            <button style={{ marginRight: "8px", cursor: "pointer" }}>
                                                Edit
                                            </button>
                                            <button style={{ cursor: "pointer", color: "red" }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === "content" && (
                    <div>
                        <h2>Content Management</h2>
                        <p>Edit website content, testimonials, and service descriptions</p>

                        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            {contentItems.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        border: "1px solid #ddd",
                                        borderRadius: "12px",
                                        padding: "20px",
                                        background: "#fff",
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: "0 0 6px" }}>{item.title}</h3>
                                        <p style={{ margin: "0 0 6px", color: "#555" }}>{item.section}</p>
                                        <span style={{ color: "#888", fontSize: "14px" }}>
                                            Last updated: {item.updated}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => navigate("/admin/content-editor")}
                                        style={{
                                            backgroundColor: "#020617",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "10px",
                                            padding: "10px 16px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === "locations" && <h2>{t('admin.comingSoon.locations')}</h2>}
            </main>
        </div>
    );
};

export default AdminDashboard;
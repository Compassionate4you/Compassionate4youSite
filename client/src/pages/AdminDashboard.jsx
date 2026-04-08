import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [tab, setTab] = useState("appointments");

    const appointments = [
        { name: "John Doe", service: "Home Health", date: "March 5", status: "Confirmed" },
        { name: "Mary Smith", service: "Hospice", date: "March 5", status: "Pending" },
        { name: "Robert Williams", service: "Home Health", date: "March 6", status: "Confirmed" },
    ];

    const accounts = [
        {id: 1, name: "John Doe" },
        {id: 2, name: "Mary Smith", },
        {id: 3, name: "Robert Williams" },
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
                        <h2>Accounts</h2>

                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                               <tr key={account.id}>
                                 <td>{account.name}</td>
                             </tr>
                          ))}
                      </tbody>
                    </table>
                </div>
                )}

                {tab === "content" && <h2>{t('admin.comingSoon.content')}</h2>}
                {tab === "locations" && <h2>{t('admin.comingSoon.locations')}</h2>}
            </main>
        </div>
    );
};

export default AdminDashboard;
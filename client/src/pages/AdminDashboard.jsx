import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import "../styles/admindashboard.css";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    //General Dashboard state
    const [tab, setTab] = useState("appointments");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    //APPOINTMENT State
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [appointmentPendingDelete, setAppointmentPendingDelete] = useState(null);
    const [appointments, setAppointments] = useState([  //Initial Appointments in React state
        { id: 1, name: "John Doe", service: "Home Health", date: "2026-03-05", status: "Confirmed" },
        { id: 2, name: "Mary Smith", service: "Hospice", date: "2026-03-06", status: "Pending" },
        { id: 3, name: "Robert Williams", service: "Home Health", date: "2026-03-07", status: "Confirmed" },
    ]);

    const [appointmentForm, setAppointmentForm] = useState({    //Appointment Empty Form State
        name: "", service: "", date: "", status: "",
    });

    //APPOINTMENT Handlers
    const handleAppointmentInputChange = (event) => {   //Update Appointment Change
        const { name, value } = event.target;
        setAppointmentForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    // Converts the stored YYYY-MM-DD date into a readable table date.
    const formatAppointmentDate = (date) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
        });
    };

    // Clears all appointment form fields.
    const resetAppointmentForm = () => {
        setAppointmentForm({
            name: "", service: "", date: "", status: "",
        });
    };

    // Opens a blank form for a new appointment.
    const handleOpenAddAppointment = () => {
        resetAppointmentForm();
        setEditingAppointmentId(null);
        setShowAppointmentForm(true);
    };

    // Opens the form with the selected appointment's information.
    const handleEditAppointment = (appointment) => {
        setAppointmentForm({
            name: appointment.name,
            service: appointment.service,
            date: appointment.date,
            status: appointment.status,
        });
        setEditingAppointmentId(appointment.id);
        setShowAppointmentForm(true);
    };

    // Adds a new appointment or saves changes to an existing appointment.
    const handleAddAppointment = (event) => {
        event.preventDefault();

        const patientName = appointmentForm.name.trim();

        if (
            !patientName ||
            !appointmentForm.service ||
            !appointmentForm.date ||
            !appointmentForm.status
        ) {
            return;
        }

        if (editingAppointmentId !== null) {
            setAppointments((currentAppointments) =>
                currentAppointments.map((appointment) =>
                    appointment.id === editingAppointmentId
                        ? {
                            ...appointment,
                            name: patientName,
                            service: appointmentForm.service,
                            date: appointmentForm.date,
                            status: appointmentForm.status,
                        }
                        : appointment
                )
            );
        } else {
            const newAppointment = {
                id: Date.now(),
                name: patientName,
                service: appointmentForm.service,
                date: appointmentForm.date,
                status: appointmentForm.status,
            };

            setAppointments((currentAppointments) => [
                ...currentAppointments,
                newAppointment,
            ]);
        }

        resetAppointmentForm();
        setEditingAppointmentId(null);
        setShowAppointmentForm(false);
    };

    // Opens the Delete confirmation prompt.
    const handleDeleteAppointment = (appointment) => {
        setAppointmentPendingDelete(appointment);
    };

    // Closes the prompt without deleting anything.
    const handleCancelDeleteAppointment = () => {
        setAppointmentPendingDelete(null);
    };

    // Deletes the selected appointment and closes the prompt.
    const handleConfirmDeleteAppointment = () => {
        setAppointments((currentAppointments) =>
            currentAppointments.filter(
                (appointment) =>
                    appointment.id !== appointmentPendingDelete.id
            )
        );

        setAppointmentPendingDelete(null);
    };

    // Discards form changes and returns to the table.
    const handleCancelAppointment = () => {
        resetAppointmentForm();
        setEditingAppointmentId(null);
        setShowAppointmentForm(false);
    };

    //ACCOUNTS state
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [accountPendingDelete, setAccountPendingDelete] = useState(null);
    const [accounts, setAccounts] = useState([      //Accounts now in React State
        {
            id: 1, name: "John Doe", birthdate: "1988-04-12", email: "john.doe@example.com",
            role: "Customer", created: "Jan 15, 26", status: "Active", lastLogin: "Mar 08, 26",},
        {
            id: 2, name: "Mary Smith", birthdate: "1975-10-03", email: "mary.smith@example.com",
            role: "Customer", created: "Feb 10, 26", status: "Active", lastLogin: "Mar 07, 26",},
        {
            id: 3, name: "Robert Williams", birthdate: "1969-11-21", email: "robert.will@example.com",
            role: "Customer", created: "May 22, 25", status: "Inactive", lastLogin: "Oct 28, 25",},
        {
            id: 4, name: "James Cameron", birthdate: "1980-08-18", email: "james.cam@admin.com",
            role: "Admin", created: "Sep 01, 25", status: "Active", lastLogin: "April 08, 26",},
        {
            id: 5, name: "Michael Brown", birthdate: "1975-09-16", email: "michael.brown@admin.com",
            role: "Admin", created: "Jan 26, 26", status: "Active", lastLogin: "April 01, 26",},
    ]);

    const [accountForm, setAccountForm] = useState({
        name: "", birthdate: "", email: "", role: "", status: "",
    });

    //ACCOUNT Handlers
    const handleOpenAddAccount = () => { // Opens a blank form for a new account.
        setAccountForm({
            name: "",
            birthdate: "",
            email: "",
            role: "",
            status: "",
        });
        setEditingAccountId(null);
        setShowAccountForm(true);
    };

    // Clears the Account form and returns to the table.
    const handleCancelAccount = () => {
        setAccountForm({
            name: "",
            birthdate: "",
            email: "",
            role: "",
            status: "",
        });
        setEditingAccountId(null);
        setShowAccountForm(false);
    };

    // Updates the matching Account form property when a field changes.
    const handleAccountInputChange = (event) => {
        const { name, value } = event.target;

        setAccountForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    // Formats YYYY-MM-DD for display in the Accounts table.
    const formatAccountBirthdate = (birthdate) => {
        return new Date(`${birthdate}T00:00:00`).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "2-digit",
                year: "2-digit",
            }
        );
    };

    // Adds a new account or saves changes to an existing account.
    const handleAddAccount = (event) => {
        event.preventDefault();
        const accountName = accountForm.name.trim();
        const accountEmail = accountForm.email.trim().toLowerCase();

        if (
            !accountName ||
            !accountForm.birthdate ||
            !accountEmail ||
            !accountForm.role ||
            !accountForm.status
        ) {
            return;
        }
        if (editingAccountId !== null) {
            setAccounts((currentAccounts) =>
                currentAccounts.map((account) =>
                    account.id === editingAccountId
                        ? {
                            ...account,
                            name: accountName,
                            birthdate: accountForm.birthdate,
                            email: accountEmail,
                            role: accountForm.role,
                            status: accountForm.status,
                        }
                        : account
                )
            );
        } else {
            const createdDate = new Date().toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "2-digit",
                    year: "2-digit",
                }
            );
            const newAccount = {
                id: Date.now(),
                name: accountName,
                birthdate: accountForm.birthdate,
                email: accountEmail,
                role: accountForm.role,
                created: createdDate,
                status: accountForm.status,
                lastLogin: "Never",
            };
            setAccounts((currentAccounts) => [
                ...currentAccounts,
                newAccount,
            ]);
        }
        setAccountForm({
            name: "",
            birthdate: "",
            email: "",
            role: "",
            status: "",
        });
        setEditingAccountId(null);
        setShowAccountForm(false);
    };

    // Opens the form with an existing account's information.
    const handleEditAccount = (account) => {
        setAccountForm({
            name: account.name,
            birthdate: account.birthdate,
            email: account.email,
            role: account.role,
            status: account.status,
        });

        setEditingAccountId(account.id);
        setShowAccountForm(true);
    };

    // Opens the Account deletion confirmation.
    const handleDeleteAccount = (account) => {
        setAccountPendingDelete(account);
    };

    // Closes the prompt without deleting the account.
    const handleCancelDeleteAccount = () => {
        setAccountPendingDelete(null);
    };

    // Deletes the selected account from React state.
    const handleConfirmDeleteAccount = () => {
        setAccounts((currentAccounts) =>
            currentAccounts.filter(
                (account) =>
                    account.id !== accountPendingDelete.id
            )
        );
        setAccountPendingDelete(null);
    };

    //LOCATIONS state
    const [locations, setLocations] = useState([    //Current office location, hardcoded
        {
            id: 1,
            name: "Main Office",
            address: "1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596",
            phone: "(925) 425-7104",
            status: "Active",
        },
    ]);
    
    //CONTENT pages
    const contentItems = [  //Content tab example editable pages
        { id: 1, title: "Home Page", section: "Philosophy", updated: "Feb 20, 2026", },
        { id: 2, title: "Home Page", section: "2021", updated: "Feb 18, 2026", },
        { id: 3, title: "Home Page", section: "Specialty Services", updated: "Feb 15, 2026", },
        { id: 4, title: "Home Page", section: "Contact", updated: "Feb 12, 2026", },
    ];

    return (
        <div>
            <header className="topbar">    {/* Welcome Admin User display */}
                <div className="admin-identity">
                    <div className="admin-avatar">AD</div>
                    <div className="header-text">
                        <h1>{t('admin.title')}</h1>
                        <p>{t('admin.welcome')}</p>
                    </div>
                </div>

                <div className="top-actions">
                    <button
                        type="button"
                        className="logout-button"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        {t('nav.logout')}
                    </button>
                </div>
            </header>

            <nav className="admin-tabs" aria-label="Admin dashboard sections">  {/* Admin Dash tab buttons */}
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

            <main className="content">      {/* All tab information below */}
                {tab === "appointments" && (
                    <div className="admin-table-card">
                        <div className="appointment-section-header">
                            <div>
                                <h2>{t("admin.tabs.appointments")}</h2>
                                <p className="admin-table-description">
                                    View and manage scheduled appointments
                                </p>
                            </div>

                            {!showAppointmentForm && (
                                <button
                                    type="button"
                                    className="admin-add-button"
                                    onClick={handleOpenAddAppointment}
                                >
                                    Add Appointment
                                </button>
                            )}
                        </div>

                        {/*Display either form or table*/}
                        {showAppointmentForm ? (
                            <form
                                className="appointment-form"
                                onSubmit={handleAddAppointment}
                            >
                                <h2>
                                    {editingAppointmentId === null
                                        ? "Add Appointment"
                                        : "Edit Appointment"}
                                </h2>

                                <p className="appointment-form-description">
                                    Complete every field to add an appointment.
                                </p>

                                <div className="appointment-form-grid">
                                    <div className="appointment-form-field">
                                        <label htmlFor="appointment-name">
                                            Patient Name
                                        </label>

                                        <input
                                            id="appointment-name"
                                            name="name"
                                            type="text"
                                            value={appointmentForm.name}
                                            onChange={handleAppointmentInputChange}
                                            placeholder="Enter patient name"
                                            required
                                        />
                                    </div>

                                    <div className="appointment-form-field">
                                        <label htmlFor="appointment-service">
                                            Service
                                        </label>
                                        {/* Admin has drop down menu to select information */}
                                        <select
                                            id="appointment-service"
                                            name="service"
                                            value={appointmentForm.service}
                                            onChange={handleAppointmentInputChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select a service
                                            </option>

                                            <option value="Home Health">
                                                Home Health
                                            </option>

                                            <option value="Hospice">
                                                Hospice
                                            </option>
                                        </select>
                                    </div>

                                    <div className="appointment-form-field">
                                        <label htmlFor="appointment-date">
                                            Date
                                        </label>

                                        <input
                                            id="appointment-date"
                                            name="date"
                                            type="date"
                                            value={appointmentForm.date}
                                            onChange={handleAppointmentInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="appointment-form-field">
                                        <label htmlFor="appointment-status">
                                            Status
                                        </label>

                                        <select
                                            id="appointment-status"
                                            name="status"
                                            value={appointmentForm.status}
                                            onChange={handleAppointmentInputChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select a status
                                            </option>

                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="Confirmed">
                                                Confirmed
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="appointment-form-actions">
                                    <button
                                        type="button"
                                        className="appointment-cancel-button"
                                        onClick={handleCancelAppointment}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="appointment-submit-button"
                                    >
                                        {editingAppointmentId === null
                                            ? "Add Appointment"
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t("admin.table.patient")}</th>
                                        <th>{t("admin.table.service")}</th>
                                        <th>{t("admin.table.date")}</th>
                                        <th>{t("admin.table.status")}</th>
                                        <th className="appointment-actions-heading">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>{appointment.name}</td>
                                            <td>{appointment.service}</td>
                                            <td>
                                                {formatAppointmentDate(appointment.date)}
                                            </td>
                                            <td>
                                                <span
                                                    className={`admin-status admin-status-${appointment.status.toLowerCase()}`}
                                                >
                                                    {appointment.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="appointment-row-actions">
                                                    <button
                                                        type="button"
                                                        className="appointment-edit-button"
                                                        onClick={() =>
                                                            handleEditAppointment(appointment)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="appointment-delete-button"
                                                        onClick={() => handleDeleteAppointment(appointment)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Accounts tab info */}
                {tab === "accounts" && (
                    <div className="admin-table-card">
                        <div className="account-section-header">
                            <div>
                                <h2>Account Management</h2>
                                <p>Manage user accounts</p>
                            </div>

                            {!showAccountForm && (
                                <button
                                    type="button"
                                    className="admin-add-button"
                                    onClick={handleOpenAddAccount}
                                >
                                    Add Account
                                </button>
                            )}
                        </div>

                        {showAccountForm ? (
                            <form
                                className="account-form"
                                onSubmit={handleAddAccount}
                            >
                                <h2>
                                    {editingAccountId === null
                                        ? "Add Account"
                                        : "Edit Account"}
                                </h2>

                                <p className="account-form-description">
                                    Complete every field to create an account.
                                </p>

                                <div className="account-form-grid">
                                    <div className="account-form-field">
                                        <label htmlFor="account-name">
                                            Name
                                        </label>

                                        <input
                                            id="account-name"
                                            name="name"
                                            type="text"
                                            value={accountForm.name}
                                            onChange={handleAccountInputChange}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    <div className="account-form-field">
                                        <label htmlFor="account-birthdate">
                                            Birthdate
                                        </label>

                                        <input
                                            id="account-birthdate"
                                            name="birthdate"
                                            type="date"
                                            value={accountForm.birthdate}
                                            onChange={handleAccountInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="account-form-field account-email-field">
                                        <label htmlFor="account-email">
                                            Email
                                        </label>

                                        <input
                                            id="account-email"
                                            name="email"
                                            type="email"
                                            value={accountForm.email}
                                            onChange={handleAccountInputChange}
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="account-form-field">
                                        <label htmlFor="account-role">
                                            Role
                                        </label>

                                        <select
                                            id="account-role"
                                            name="role"
                                            value={accountForm.role}
                                            onChange={handleAccountInputChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select a role
                                            </option>

                                            <option value="Customer">
                                                Customer
                                            </option>

                                            <option value="Admin">
                                                Admin
                                            </option>
                                        </select>
                                    </div>

                                    <div className="account-form-field">
                                        <label htmlFor="account-status">
                                            Status
                                        </label>

                                        <select
                                            id="account-status"
                                            name="status"
                                            value={accountForm.status}
                                            onChange={handleAccountInputChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select a status
                                            </option>

                                            <option value="Active">
                                                Active
                                            </option>

                                            <option value="Inactive">
                                                Inactive
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="account-form-actions">
                                    <button
                                        type="button"
                                        className="account-cancel-button"
                                        onClick={handleCancelAccount}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="account-submit-button"
                                    >
                                        {editingAccountId === null
                                            ? "Add Account"
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <table className="admin-table admin-accounts-table">
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
                                            <td>{formatAccountBirthdate(account.birthdate)}</td>
                                            <td>{account.email}</td>
                                            <td>{account.role}</td>
                                            <td>{account.created}</td>

                                            <td>
                                                <span
                                                    className={`admin-status admin-status-${account.status.toLowerCase()}`}
                                                >
                                                    {account.status}
                                                </span>
                                            </td>

                                            <td>{account.lastLogin}</td>

                                            <td>
                                                <div className="account-row-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-table-action"
                                                        onClick={() => handleEditAccount(account)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-table-action admin-table-delete"
                                                        onClick={() => handleDeleteAccount(account)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
                {tab === "locations" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div>
                                <h2>Location Management</h2>
                                <p>Manage office locations and contact information</p>
                            </div>
                            <button style={{ backgroundColor: "#020617", color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Add Location
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {locations.map((location) => (
                                <div key={location.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                        <div>
                                            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px" }}>{location.name}</h3>
                                            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {location.address}
                                            </p>
                                            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>Phone: {location.phone}</p>
                                            <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", background: "#dcfce7", color: "#15803d" }}>
                                                {location.status}
                                            </span>
                                        </div>
                                        <button style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            {/* Logout Button confirmation*/}
            {showLogoutConfirm && (
                <div
                    className="logout-modal-overlay"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="logout-modal-title">Confirm Logout</h2>
                        <p>Are you sure you want to log out?</p>
                        <div className="logout-modal-actions">
                            <button
                                type="button"
                                className="logout-no-button"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                No
                            </button>

                            <button
                                type="button"
                                className="logout-yes-button"
                                onClick={() => navigate("/")}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {appointmentPendingDelete && (
                <div
                    className="logout-modal-overlay"
                    onClick={handleCancelDeleteAppointment}
                >
                    <div
                        className="logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-appointment-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="delete-appointment-title">
                            Delete Appointment
                        </h2>

                        <p>
                            Are you sure you want to delete the appointment for{" "}
                            <strong>{appointmentPendingDelete.name}</strong>?
                        </p>

                        <div className="logout-modal-actions">
                            <button
                                type="button"
                                className="logout-no-button"
                                onClick={handleCancelDeleteAppointment}
                            >
                                No
                            </button>

                            <button
                                type="button"
                                className="logout-yes-button"
                                onClick={handleConfirmDeleteAppointment}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Account Deletion modal */}
            {accountPendingDelete && (
                <div
                    className="logout-modal-overlay"
                    onClick={handleCancelDeleteAccount}
                >
                    <div
                        className="logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="delete-account-title">
                            Delete Account
                        </h2>

                        <p>
                            Are you sure you want to delete the account for{" "}
                            <strong>{accountPendingDelete.name}</strong>?
                        </p>

                        <div className="logout-modal-actions">
                            <button
                                type="button"
                                className="logout-no-button"
                                onClick={handleCancelDeleteAccount}
                            >
                                No
                            </button>

                            <button
                                type="button"
                                className="logout-yes-button"
                                onClick={handleConfirmDeleteAccount}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
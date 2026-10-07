import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import "../styles/admindashboard.css";
import AdminHeader from "../components/admin/AdminHeader";
import AdminTabs from "../components/admin/AdminTabs";
import AdminFooter from "../components/admin/AdminFooter";
import ConfirmModal from "../components/admin/ConfirmModal";
import AppointmentsTab from "../components/admin/AppointmentsTab";
import AccountsTab from "../components/admin/AccountsTab";
import LocationsTab from "../components/admin/LocationsTab";
import useAppointments from "../hooks/admin/useAppointments";
import useAccounts from "../hooks/admin/useAccounts";
import useLocations from "../hooks/admin/useLocations";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    //General Dashboard state
    const [tab, setTab] = useState("appointments");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    //For Add Appointment
    const {
        showAppointmentForm,
        editingAppointmentId,
        appointmentPendingDelete,
        appointments,
        appointmentForm,
        handleAppointmentInputChange,
        formatAppointmentDate,
        handleOpenAddAppointment,
        handleEditAppointment,
        handleAddAppointment,
        handleDeleteAppointment,
        handleCancelDeleteAppointment,
        handleConfirmDeleteAppointment,
        handleCancelAppointment,
    } = useAppointments();
    
    //For Add Account
    const {
        showAccountForm,
        editingAccountId,
        accountPendingDelete,
        accounts,
        accountForm,
        handleOpenAddAccount,
        handleCancelAccount,
        handleAccountInputChange,
        formatAccountBirthdate,
        handleAddAccount,
        handleEditAccount,
        handleDeleteAccount,
        handleCancelDeleteAccount,
        handleConfirmDeleteAccount,
    } = useAccounts();
    
    //For Add Location
    const {
        locations,
        editingLocationId,
        editForm,
        showLocationForm,
        locationForm,
        handleEditClick,
        handleEditFormChange,
        handleSaveLocation,
        handleCancelEdit,
        handleLocationFormChange,
        handleOpenAddLocation,
        handleCancelAddLocation,
        handleAddLocation,
    } = useLocations();
    
    return (
        <div className="admin-dashboard-page">
            <AdminHeader
                onLogout={() => setShowLogoutConfirm(true)}
            />
            <AdminTabs
                activeTab={tab}
                onSelectTab={setTab}
                onOpenContent={() => navigate("/admin/content-editor")}
            />

            <main className="content">      {/* All tab information below */}
                {/* Appointments tab links to ../components/admin/AppointmentsTab.jsx */}
                {tab === "appointments" && (
                    <AppointmentsTab
                        showAppointmentForm={showAppointmentForm}
                        editingAppointmentId={editingAppointmentId}
                        appointmentForm={appointmentForm}
                        appointments={appointments}
                        onOpenAddAppointment={handleOpenAddAppointment}
                        onAppointmentInputChange={handleAppointmentInputChange}
                        onSubmitAppointment={handleAddAppointment}
                        onCancelAppointment={handleCancelAppointment}
                        onEditAppointment={handleEditAppointment}
                        onDeleteAppointment={handleDeleteAppointment}
                        formatAppointmentDate={formatAppointmentDate}
                    />
                )}

                {/* Accounts tab links to ../components/admin/AccountsTab.jsx */}
                {tab === "accounts" && (
                    <AccountsTab
                        showAccountForm={showAccountForm}
                        editingAccountId={editingAccountId}
                        accountForm={accountForm}
                        accounts={accounts}
                        onOpenAddAccount={handleOpenAddAccount}
                        onAccountInputChange={handleAccountInputChange}
                        onSubmitAccount={handleAddAccount}
                        onCancelAccount={handleCancelAccount}
                        onEditAccount={handleEditAccount}
                        onDeleteAccount={handleDeleteAccount}
                        formatAccountBirthdate={formatAccountBirthdate}
                    />
                )}

                {/*//DT-492 Content Editor - Preston Ball: Removed the content items from the admin board, and simply 
                directed the user to the content editor page. All editing options are now displayed in the main page. */}

                {/* Location tab linked to ../components/admin/LocationsTab.jsx */}
                {tab === "locations" && (
                    <LocationsTab
                        showLocationForm={showLocationForm}
                        locationForm={locationForm}
                        locations={locations}
                        editingLocationId={editingLocationId}
                        editForm={editForm}
                        onOpenAddLocation={handleOpenAddLocation}
                        onSubmitAddLocation={handleAddLocation}
                        onLocationFormChange={handleLocationFormChange}
                        onCancelAddLocation={handleCancelAddLocation}
                        onEditLocation={handleEditClick}
                        onEditFormChange={handleEditFormChange}
                        onSaveLocation={handleSaveLocation}
                        onCancelEdit={handleCancelEdit}
                    />
                )}
            </main>

            <AdminFooter />

            {/* Logout Confirmation */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                onCancel={() => setShowLogoutConfirm(false)}
                onConfirm={() => navigate("/")}
            />

            {/* Appointment Deletion Confirmation */}
            <ConfirmModal
                isOpen={appointmentPendingDelete !== null}
                title="Delete Appointment"
                message={
                    <>
                        Are you sure you want to delete the appointment for{" "}
                        <strong>{appointmentPendingDelete?.name}</strong>?
                    </>
                }
                onCancel={handleCancelDeleteAppointment}
                onConfirm={handleConfirmDeleteAppointment}
            />

            {/* Account Deletion Confirmation */}
            <ConfirmModal
                isOpen={accountPendingDelete !== null}
                title="Delete Account"
                message={
                    <>
                        Are you sure you want to delete the account for{" "}
                        <strong>{accountPendingDelete?.name}</strong>?
                    </>
                }
                onCancel={handleCancelDeleteAccount}
                onConfirm={handleConfirmDeleteAccount}
            />
        </div>
    );
};

export default AdminDashboard;
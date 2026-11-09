// DT-622 Sprint 8
// Preston Ball
// Admin dashboard integrating Appointments, Content Editor, Locations, and Accounts tabs

import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminTabs from "../components/admin/AdminTabs";
import AdminFooter from "../components/admin/AdminFooter";
import ConfirmModal from "../components/admin/ConfirmModal";
import AppointmentsTab from "../components/admin/AppointmentsTab";
import AccountsTab from "../components/admin/AccountsTab";
import LocationsTab from "../components/admin/LocationsTab";
import ContentEditor from "./ContentEditor";
import useAppointments from "../hooks/admin/useAppointments";
import useAccounts from "../hooks/admin/useAccounts";
import useLocations from "../hooks/admin/useLocations";
import { useAuth } from "../context/AuthContext";
/* Import styling */
import "../styles/admin/admin-dashboard.css";
import "../styles/admin/admin-header.css";
import "../styles/admin/admin-tables.css";
import "../styles/admin/appointments-tab.css";
import "../styles/admin/accounts-tab.css";
import "../styles/admin/locations-tab.css";
import "../styles/admin/admin-footer.css";
import "../styles/admin/admin-modals.css";
import "../styles/admin/admin-dark-mode.css";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, logout } = useAuth();
    
    // General Dashboard state
    const [tab, setTab] = useState(searchParams.get("tab") || "appointments");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    //For Add Appointment
    const {
        showAppointmentForm,
        editingAppointmentId,
        appointmentPendingDelete,
        appointments,
        appointmentForm,
        appointmentsLoading,
        appointmentsError,
        appointmentSubmitting,
        appointmentSubmitError,
        appointmentDeleting,
        appointmentDeleteError,
        handleAppointmentInputChange,
        formatAppointmentDate,
        handleOpenAddAppointment,
        handleEditAppointment,
        handleAddAppointment,
        handleDeleteAppointment,
        handleCancelDeleteAppointment,
        handleConfirmDeleteAppointment,
        handleCancelAppointment,
        // DT-837: appointment history
        appointmentView,
        setAppointmentView,
        currentAppointments,
        historyAppointments,
        historySearch,
        setHistorySearch,
        handleChangeHistoryTag,
        tagSavingId,
        tagError,
    } = useAppointments();
    
    //For Updating Accounts
    const {
        showAccountForm,
        editingAccountId,
        accountPendingDelete,
        showPromoteConfirm,
        handleCancelPromote,
        handleConfirmPromote,
        accounts,
        accountForm,
        handleUpdateAccount,
        handleCancelAccount,
        handleAccountInputChange,
        formatAccountBirthdate,
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
        handleDeleteLocation,
        locationPendingDelete,
        handleCancelDeleteLocation,
        handleConfirmDeleteLocation,
    } = useLocations();
        // DT-755: really sign out (user, test login and server session), then leave the dashboard.
    const handleConfirmLogout = () => {
        localStorage.removeItem("isLoggedIn");
        setShowLogoutConfirm(false);
        navigate("/");
        logout();
    };
    return (
        <div className="admin-dashboard-page">
            <AdminHeader
                adminName={user?.displayName}
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
                        appointmentsLoading={appointmentsLoading}
                        appointmentsError={appointmentsError}
                        appointmentSubmitting={appointmentSubmitting}
                        appointmentSubmitError={appointmentSubmitError}
                        onOpenAddAppointment={handleOpenAddAppointment}
                        onAppointmentInputChange={handleAppointmentInputChange}
                        onSubmitAppointment={handleAddAppointment}
                        onCancelAppointment={handleCancelAppointment}
                        onEditAppointment={handleEditAppointment}
                        onDeleteAppointment={handleDeleteAppointment}
                        formatAppointmentDate={formatAppointmentDate}
                        // DT-837: appointment history
                        appointmentView={appointmentView}
                        onChangeView={setAppointmentView}
                        currentAppointments={currentAppointments}
                        historyAppointments={historyAppointments}
                        historySearch={historySearch}
                        onHistorySearchChange={setHistorySearch}
                        onChangeHistoryTag={handleChangeHistoryTag}
                        tagSavingId={tagSavingId}
                        tagError={tagError}
                    />
                )}

                {/* Accounts tab links to ../components/admin/AccountsTab.jsx */}
                {tab === "accounts" && (
                    <AccountsTab
                        showAccountForm={showAccountForm}
                        accountForm={accountForm}
                        accounts={accounts}
                        onAccountInputChange={handleAccountInputChange}
                        onSubmitAccount={handleUpdateAccount}
                        onCancelAccount={handleCancelAccount}
                        onEditAccount={handleEditAccount}
                        onDeleteAccount={handleDeleteAccount}
                        formatAccountBirthdate={formatAccountBirthdate}
                    />
                )}

                {/* DT-622 Sprint 8 - Preston Ball: Render Content Editor within the admin dashboard */}
                {tab === "content" && (
                    <ContentEditor embedded={true} />
                )}

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
                        onDeleteLocation={handleDeleteLocation}
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
                onConfirm={handleConfirmLogout}
            />

            {/* Appointment Deletion Confirmation */}
            <ConfirmModal
                isOpen={appointmentPendingDelete !== null}
                title="Archive Appointment"
                message={
                    <>
                        {/* DT-837: archiving hides the appointment but keeps it on record */}
                        Archive the appointment for{" "}
                        <strong>
                            {appointmentPendingDelete?.name}
                        </strong>
                        ? It will be hidden from the dashboard but kept in the records.

                        {appointmentDeleteError && (
                            <span className="admin-modal-error" role="alert">
                                {appointmentDeleteError}
                            </span>
                        )}
                    </>
                }
                confirmText={
                    appointmentDeleting ? "Archiving..." : "Archive"
                }
                cancelText="Cancel"
                isConfirming={appointmentDeleting}
                onCancel={handleCancelDeleteAppointment}
                onConfirm={handleConfirmDeleteAppointment}
            />

            {/* DT-825: Confirm before promoting a customer to Admin */}
            <ConfirmModal
                isOpen={showPromoteConfirm}
                title="Change Role to Admin"
                message="Are you sure you want to change this user's role to Admin?"
                confirmText="Confirm"
                cancelText="Cancel"
                onCancel={handleCancelPromote}
                onConfirm={handleConfirmPromote}
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



            {/* Location Deletion Confirmation */}
            <ConfirmModal
                isOpen={locationPendingDelete !== null}
                title="Delete Location"
                message={
                    <>
                        Are you sure you want to delete the location{" "}
                        <strong>{locationPendingDelete?.name}</strong>?
                    </>
                }
                onCancel={handleCancelDeleteLocation}
                onConfirm={handleConfirmDeleteLocation}
            />


        </div>
    );
};

export default AdminDashboard;
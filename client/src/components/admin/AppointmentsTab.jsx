//All Appointments tab code
import { useTranslation } from "react-i18next";
import { HISTORY_TAG_LABELS } from "../../hooks/admin/useAppointments";

function AppointmentsTab({
    showAppointmentForm,
    editingAppointmentId,
    appointmentForm,
    appointments,
    appointmentsLoading,
    appointmentsError,
    appointmentSubmitting,
    appointmentSubmitError,
    //handlers
    onOpenAddAppointment,
    onAppointmentInputChange,
    onSubmitAppointment,
    onCancelAppointment,
    onEditAppointment,
    onDeleteAppointment,
    formatAppointmentDate,
    // DT-837: appointment history
    appointmentView = "current",
    onChangeView,
    currentAppointments = appointments,
    historyAppointments = [],
    historySearch = "",
    onHistorySearchChange,
    onChangeHistoryTag,
    tagSavingId = null,
    tagError = "",
}) {
    const { t } = useTranslation();

    return (
        <div className="admin-table-card">
            <div className="appointment-section-header">
                <div>
                    <h2>{t("admin.tabs.appointments")}</h2>

                    <p className="admin-table-description">
                        View and manage scheduled appointments
                    </p>
                </div>

                {!showAppointmentForm && appointmentView === "current" && (
                    <button
                        type="button"
                        className="admin-add-button"
                        onClick={onOpenAddAppointment}
                    >
                        Add Appointment
                    </button>
                )}
            </div>

            {/* DT-837: Current appointments and History are kept apart. */}
            {!showAppointmentForm && (
                <div className="appointment-view-tabs" role="tablist" aria-label="Appointment lists">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={appointmentView === "current"}
                        className={`appointment-view-tab${appointmentView === "current" ? " appointment-view-tab-active" : ""}`}
                        onClick={() => onChangeView?.("current")}
                    >
                        Current ({currentAppointments.length})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={appointmentView === "history"}
                        className={`appointment-view-tab${appointmentView === "history" ? " appointment-view-tab-active" : ""}`}
                        onClick={() => onChangeView?.("history")}
                    >
                        History
                    </button>
                </div>
            )}

            {/* Display either the appointment form or table */}
            {showAppointmentForm ? (
                <form
                    className="appointment-form"
                    onSubmit={onSubmitAppointment}
                >
                    <h2>
                        {editingAppointmentId === null
                            ? "Add Appointment"
                            : "Edit Appointment"}
                    </h2>

                    <p className="appointment-form-description">
                        Complete required fields. Phone and notes are optional
                    </p>

                    {appointmentSubmitError && (
                        <p className="appointment-form-error" role="alert">
                            {appointmentSubmitError}
                        </p>
                    )}

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
                                onChange={onAppointmentInputChange}
                                placeholder="Enter patient name"
                                readOnly={editingAppointmentId !== null}
                                required
                            />
                        </div>

                        <div className="appointment-form-field">
                            <label htmlFor="appointment-email">
                                Email
                            </label>

                            <input
                                id="appointment-email"
                                name="email"
                                type="email"
                                value={appointmentForm.email}
                                onChange={onAppointmentInputChange}
                                placeholder="Enter patient email"
                                readOnly={editingAppointmentId !== null}
                                required
                            />
                        </div>

                        <div className="appointment-form-field">
                            <label htmlFor="appointment-phone">
                                Phone (optional)
                            </label>

                            <input
                                id="appointment-phone"
                                name="phone"
                                type="tel"
                                value={appointmentForm.phone}
                                onChange={onAppointmentInputChange}
                                placeholder="Enter phone number"
                                readOnly={editingAppointmentId !== null}
                            />
                        </div>

                        <div className="appointment-form-field">
                            <label htmlFor="appointment-service">
                                Service
                            </label>

                            <select
                                id="appointment-service"
                                name="service"
                                value={appointmentForm.service}
                                onChange={onAppointmentInputChange}
                                required
                            >
                                <option value="" disabled>
                                    Select a service
                                </option>

                                <option value="Home Health">
                                    Home Health
                                </option>

                                <option value="Hospice Care">
                                    Hospice Care
                                </option>

                                <option value="Consultation">
                                    Consultation
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
                                onChange={onAppointmentInputChange}
                                required
                            />
                        </div>

                        <div className="appointment-form-field">
                            <label htmlFor="appointment-time">
                                Time
                            </label>

                            <select
                                id="appointment-time"
                                name="timeSlot"
                                value={appointmentForm.timeSlot}
                                onChange={onAppointmentInputChange}
                                required
                            >
                                <option value="" disabled>
                                    Select a time
                                </option>

                                <option value="9:00 AM">9:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="1:00 PM">1:00 PM</option>
                                <option value="2:00 PM">2:00 PM</option>
                                <option value="3:00 PM">3:00 PM</option>
                            </select>
                        </div>

                        <div className="appointment-form-field">
                            <label htmlFor="appointment-status">
                                Status
                            </label>

                            <select
                                id="appointment-status"
                                name="status"
                                value={appointmentForm.status}
                                onChange={onAppointmentInputChange}
                                required
                            >
                                <option value="" disabled>
                                    Select a status
                                </option>

                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="appointment-form-field appointment-form-field-full">
                            <label htmlFor="appointment-notes">
                                Notes (optional)
                            </label>

                            <textarea
                                id="appointment-notes"
                                name="notes"
                                value={appointmentForm.notes}
                                onChange={onAppointmentInputChange}
                                placeholder="Enter appointment notes"
                                rows="4"
                            />
                        </div>

                    </div>

                    <div className="appointment-form-actions">
                        <button
                            type="button"
                            className="appointment-cancel-button"
                            onClick={onCancelAppointment}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="appointment-submit-button"
                            disabled={appointmentSubmitting}
                        >
                            {appointmentSubmitting
                                ? "Saving..."
                                : editingAppointmentId === null
                                ? "Add Appointment"
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
                ) : appointmentsLoading ? (
                    <p className="admin-table-message">
                        Loading appointments...
                    </p>
                ) : appointmentsError ? (
                    <p className="admin-table-error">
                        {appointmentsError}
                    </p>
                ) : appointmentView === "history" ? (
                    <HistoryTable
                        appointments={historyAppointments}
                        search={historySearch}
                        onSearchChange={onHistorySearchChange}
                        onChangeTag={onChangeHistoryTag}
                        onArchive={onDeleteAppointment}
                        tagSavingId={tagSavingId}
                        tagError={tagError}
                        formatAppointmentDate={formatAppointmentDate}
                        t={t}
                    />
                ) : currentAppointments.length === 0 ? (
                    <p className="admin-table-message">
                        No current appointments.
                    </p>
                ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t("admin.table.patient")}</th>
                            <th>{t("admin.table.service")}</th>
                            <th>{t("admin.table.date")}</th>
                            <th>Time</th>
                            <th>{t("admin.table.status")}</th>

                            <th className="appointment-actions-heading">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentAppointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>{appointment.name}</td>
                                <td>{appointment.service}</td>

                                <td>
                                    {formatAppointmentDate(appointment.date)}
                                </td>

                                <td>
                                    {appointment.timeSlot}
                                </td>

                                <td>
                                    <span
                                        className={`admin-status admin-status-${appointment.status.toLowerCase()}`}
                                    >
                                        {appointment.status}
                                    </span>
                                </td>

                                <td className="appointment-actions-cell">
                                    <div className="appointment-row-actions">
                                        <button
                                            type="button"
                                            className="appointment-edit-button"
                                            onClick={() =>
                                                onEditAppointment(appointment)
                                            }
                                        >
                                            Edit
                                        </button>

                                        {/* DT-837: archives instead of deleting */}
                                        <button
                                            type="button"
                                            className="appointment-delete-button"
                                            onClick={() =>
                                                onDeleteAppointment(appointment)
                                            }
                                        >
                                            Archive
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// DT-837: past, cancelled and completed appointments. Admins can only change
// the tag (DT-927) or archive a row; the rest is a record of what happened.
function HistoryTable({
    appointments,
    search,
    onSearchChange,
    onChangeTag,
    onArchive,
    tagSavingId,
    tagError,
    formatAppointmentDate,
    t,
}) {
    return (
        <>
            <div className="appointment-history-toolbar">
                <label htmlFor="appointment-history-search" className="appointment-history-search-label">
                    Search by patient name
                </label>
                <input
                    id="appointment-history-search"
                    type="search"
                    className="appointment-history-search"
                    value={search}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder="Patient name"
                />
            </div>

            {tagError && (
                <p className="admin-table-error" role="alert">
                    {tagError}
                </p>
            )}

            {appointments.length === 0 ? (
                <p className="admin-table-message">
                    {search.trim()
                        ? "No past appointments match that name."
                        : "No past appointments yet."}
                </p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t("admin.table.patient")}</th>
                            <th>{t("admin.table.service")}</th>
                            <th>{t("admin.table.date")}</th>
                            <th>Time</th>
                            <th>Tag</th>
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
                                    {formatAppointmentDate(appointment.date, { withYear: true })}
                                </td>
                                <td>{appointment.timeSlot}</td>
                                <td>
                                    <label
                                        htmlFor={`history-tag-${appointment.id}`}
                                        className="appointment-visually-hidden"
                                    >
                                        Tag for {appointment.name}
                                    </label>
                                    <select
                                        id={`history-tag-${appointment.id}`}
                                        className="appointment-history-tag"
                                        value={appointment.historyTag || ""}
                                        disabled={tagSavingId === appointment.id}
                                        onChange={(event) =>
                                            onChangeTag?.(appointment, event.target.value)
                                        }
                                    >
                                        {!appointment.historyTag && (
                                            <option value="" disabled>
                                                {appointment.status === "Cancelled"
                                                    ? "Cancelled (choose who)"
                                                    : "Choose a tag"}
                                            </option>
                                        )}
                                        {Object.entries(HISTORY_TAG_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="appointment-actions-cell">
                                    <div className="appointment-row-actions">
                                        <button
                                            type="button"
                                            className="appointment-delete-button"
                                            onClick={() => onArchive?.(appointment)}
                                        >
                                            Archive
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

export default AppointmentsTab;
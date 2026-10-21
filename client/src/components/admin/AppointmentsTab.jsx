//All Appointments tab code
import { useTranslation } from "react-i18next";

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

                {!showAppointmentForm && (
                    <button
                        type="button"
                        className="admin-add-button"
                        onClick={onOpenAddAppointment}
                    >
                        Add Appointment
                    </button>
                )}
            </div>

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
                ) : appointments.length === 0 ? (
                    <p className="admin-table-message">
                        No appointments found.
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
                        {appointments.map((appointment) => (
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

                                        <button
                                            type="button"
                                            className="appointment-delete-button"
                                            onClick={() =>
                                                onDeleteAppointment(appointment)
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
    );
}

export default AppointmentsTab;
//Handlers for Add Appointments
import { useEffect, useMemo, useState } from "react";
import { apiGetAllAppointments, apiCreateAdminAppointment, apiUpdateAdminAppointment, apiDeleteAdminAppointment, apiUpdateHistoryTag, } from "../../services/api";

// DT-837 / DT-927: history tags and how they read in the dashboard.
export const HISTORY_TAG_LABELS = {
    COMPLETED: "Completed",
    NO_SHOW: "No show",
    CANCELLED_BY_PATIENT: "Cancelled by patient",
    CANCELLED_BY_STAFF: "Cancelled by staff",
    NOT_CONFIRMED: "Not confirmed",
};

// DT-837: '10:00 AM' -> 600, so times sort in clock order, not as text
// (as text, "10:00 AM" would come before "9:00 AM").
export function slotMinutes(timeSlot) {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(timeSlot || "").trim());
    if (!match) return 0;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    return hours * 60 + Number(match[2]);
}

// DT-837: oldest first; pass -1 for newest first.
export function compareAppointments(first, second, direction = 1) {
    const byDate = first.date.localeCompare(second.date);
    if (byDate !== 0) return byDate * direction;
    return (slotMinutes(first.timeSlot) - slotMinutes(second.timeSlot)) * direction;
}

// Convert backend field names into the names the Admin Dashboard expects.
function formatAppointment(appointment) {
    return {
        ...appointment,
        name: appointment.fullName,
        service: appointment.serviceType,
        // Convert PENDING into Pending, CONFIRMED into Confirmed, etc
        status:
            appointment.status.charAt(0) +
            appointment.status.slice(1).toLowerCase(),
        // DT-837: 'current' or 'history', decided by the server in Pacific time.
        section: appointment.section || "current",
    };
}

function useAppointments() {
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [ appointmentPendingDelete, setAppointmentPendingDelete, ] = useState(null);
    // Removed hard-coded entries to connect backend
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);
    const [appointmentsError, setAppointmentsError] = useState("");
    const [appointmentSubmitting, setAppointmentSubmitting] = useState(false);
    const [appointmentSubmitError, setAppointmentSubmitError] = useState("");
    const [appointmentDeleting, setAppointmentDeleting] = useState(false);
    const [appointmentDeleteError, setAppointmentDeleteError] = useState("");
    // DT-837: which tab is showing, the history search, and tag saving state.
    const [appointmentView, setAppointmentView] = useState("current");
    const [historySearch, setHistorySearch] = useState("");
    const [tagSavingId, setTagSavingId] = useState(null);
    const [tagError, setTagError] = useState("");

    const [appointmentForm, setAppointmentForm] = useState({
    name: "", email: "", phone: "", service: "", date: "", timeSlot: "", status: "", notes: "",
    });

    // Loads all database appointments when the Admin Dashboard opens.
    useEffect(() => {
        let isMounted = true;

        const loadAppointments = async () => {
            try {
                setAppointmentsLoading(true);
                setAppointmentsError("");

                const data = await apiGetAllAppointments();

                if (!isMounted) {
                    return;
                }

                setAppointments(data.appointments.map(formatAppointment));
            } catch (error) {
                if (isMounted) {
                    setAppointmentsError(
                        error.message || "Unable to load appointments."
                    );
                }
            } finally {
                if (isMounted) {
                        setAppointmentsLoading(false);
                }
            }
        };

        loadAppointments();

        return () => {
            isMounted = false;
        };
    }, []);

    // Updates the matching Appointment form field.
    const handleAppointmentInputChange = (event) => {
        const { name, value } = event.target;
        setAppointmentForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    // Converts YYYY-MM-DD into a readable table date.
    // DT-837: history can span years, so it can include the year.
    const formatAppointmentDate = (date, { withYear = false } = {}) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                ...(withYear ? { year: "numeric" } : {}),
            }
        );
    };

    // DT-837: Current is soonest first; History is newest first and can be
    // searched by patient name.
    const currentAppointments = useMemo(
        () => appointments
            .filter((appointment) => appointment.section !== "history")
            .sort((a, b) => compareAppointments(a, b)),
        [appointments]
    );

    const historyAppointments = useMemo(() => {
        const query = historySearch.trim().toLowerCase();
        return appointments
            .filter((appointment) => appointment.section === "history")
            .filter((appointment) => !query || appointment.name.toLowerCase().includes(query))
            .sort((a, b) => compareAppointments(a, b, -1));
    }, [appointments, historySearch]);

    // DT-837 / DT-927: change the tag of an appointment in history.
    const handleChangeHistoryTag = async (appointment, tag) => {
        if (!tag || tag === appointment.historyTag || tagSavingId) {
            return;
        }

        setTagError("");
        setTagSavingId(appointment.id);
        try {
            const data = await apiUpdateHistoryTag(appointment.id, tag);
            const saved = formatAppointment(data.appointment);
            setAppointments((current) =>
                current.map((item) => (item.id === saved.id ? saved : item))
            );
        } catch (error) {
            setTagError(error.message || "Unable to update the tag.");
        } finally {
            setTagSavingId(null);
        }
    };

    // Clears all Appointment form fields.
    const resetAppointmentForm = () => {
        setAppointmentForm({
            name: "", email: "", phone: "", service: "", date: "", timeSlot: "", status: "", notes: "",
        });
    };

    // Opens an empty form for a new Appointment.
    const handleOpenAddAppointment = () => {
        resetAppointmentForm();
        setEditingAppointmentId(null);
        setShowAppointmentForm(true);
        setAppointmentSubmitError("");
    };

    // Opens the form with an existing Appointment's information.
    const handleEditAppointment = (appointment) => {
        setAppointmentSubmitError("");

        setAppointmentForm({
            name: appointment.name,
            email: appointment.email || "",
            phone: appointment.phone || "",
            service: appointment.service,
            date: appointment.date,
            timeSlot: appointment.timeSlot || "",
            status: appointment.status,
            notes: appointment.notes || "",
        });
        setEditingAppointmentId(appointment.id);
        setShowAppointmentForm(true);
    };

    // Creates or updates an appointment through the backend.
    const handleAddAppointment = async (event) => {
        event.preventDefault();

        const patientName = appointmentForm.name.trim();

        if (
            !patientName ||
            !appointmentForm.email.trim() ||
            !appointmentForm.service ||
            !appointmentForm.date ||
            !appointmentForm.timeSlot ||
            !appointmentForm.status
        ) {
            setAppointmentSubmitError(
                "Please complete all required fields."
            );
            return;
        }

        setAppointmentSubmitError("");
        setAppointmentSubmitting(true);

        const appointmentPayload = {
            fullName: patientName,
            email: appointmentForm.email.trim(),
            phone: appointmentForm.phone.trim() || null,
            serviceType: appointmentForm.service,
            date: appointmentForm.date,
            timeSlot: appointmentForm.timeSlot,
            status: appointmentForm.status.toUpperCase(),
            notes: appointmentForm.notes.trim() || null,
        };

        try {
            const data =
                editingAppointmentId !== null
                    ? await apiUpdateAdminAppointment(
                        editingAppointmentId,
                        appointmentPayload
                    )
                    : await apiCreateAdminAppointment(
                      appointmentPayload
                    );

            const formattedAppointment = formatAppointment(data.appointment);

            // DT-837: the Current and History lists sort themselves.
            setAppointments((currentAppointments) =>
                editingAppointmentId !== null
                    ? currentAppointments.map((appointment) =>
                        appointment.id === editingAppointmentId
                            ? formattedAppointment
                            : appointment
                    )
                    : [...currentAppointments, formattedAppointment]
            );

            resetAppointmentForm();
            setEditingAppointmentId(null);
            setShowAppointmentForm(false);
        } catch (error) {
            setAppointmentSubmitError(
                error.message ||
                    (editingAppointmentId !== null
                        ? "Unable to update the appointment."
                        : "Unable to add the appointment.")
            );
        } finally {
            setAppointmentSubmitting(false);
        }
    };

    // Opens the Appointment archive confirmation (DT-837: delete archives).
    const handleDeleteAppointment = (appointment) => {
        setAppointmentDeleteError("");
        setAppointmentPendingDelete(appointment);
    };

    // Closes the archive confirmation without archiving.
    const handleCancelDeleteAppointment = () => {
        if (appointmentDeleting) {
            return;
        }
        setAppointmentDeleteError("");
        setAppointmentPendingDelete(null);
    };

    // DT-837 / DT-924: archives the selected appointment. It is hidden from
    // the dashboard but kept in the database, so history is never lost.
    const handleConfirmDeleteAppointment = async () => {
        if (!appointmentPendingDelete || appointmentDeleting) {
            return;
        }

        try {
            setAppointmentDeleting(true);
            setAppointmentDeleteError("");

            await apiDeleteAdminAppointment(
                appointmentPendingDelete.id
            );

            setAppointments((currentAppointments) =>
                currentAppointments.filter(
                    (appointment) =>
                        appointment.id !==
                        appointmentPendingDelete.id
                )
            );

            setAppointmentPendingDelete(null);
        } catch (error) {
            console.error("Archive appointment failed:", error);

            setAppointmentDeleteError(
                error.message ||
                    "Unable to archive the appointment."
            );
        } finally {
            setAppointmentDeleting(false);
        }
    };

    // Discards form changes and returns to the table.
    const handleCancelAppointment = () => {
        resetAppointmentForm();
        setEditingAppointmentId(null);
        setShowAppointmentForm(false);
        setAppointmentSubmitError("");
    };

    return {
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
    };
}

export default useAppointments;
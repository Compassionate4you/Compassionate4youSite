//Handlers for Add Appointments
import { useEffect, useState } from "react";
import { apiGetAllAppointments, apiCreateAdminAppointment, apiUpdateAdminAppointment, apiDeleteAdminAppointment, } from "../../services/api";

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

                const formattedAppointments = data.appointments.map(
                    (appointment) => ({
                        ...appointment,

                        // Convert backend field names into the names currently expected by the Admin Dashboard
                        name: appointment.fullName,
                        service: appointment.serviceType,

                        // Convert PENDING into Pending, CONFIRMED into Confirmed, etc
                        status:
                            appointment.status.charAt(0) +
                            appointment.status.slice(1).toLowerCase(),
                    })
                );

                setAppointments(formattedAppointments);
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
    const formatAppointmentDate = (date) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
            }
        );
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

            const savedAppointment = data.appointment;

            const formattedAppointment = {
                ...savedAppointment,
                name: savedAppointment.fullName,
                service: savedAppointment.serviceType,
                status:
                    savedAppointment.status.charAt(0) +
                    savedAppointment.status.slice(1).toLowerCase(),
            };

            setAppointments((currentAppointments) => {
                const updatedAppointments =
                    editingAppointmentId !== null
                        ? currentAppointments.map((appointment) =>
                            appointment.id === editingAppointmentId
                                ? formattedAppointment
                                : appointment
                        )
                        : [
                            ...currentAppointments,
                            formattedAppointment,
                        ];

                return updatedAppointments.sort(
                    (firstAppointment, secondAppointment) => {
                        const dateComparison =
                            firstAppointment.date.localeCompare(
                                secondAppointment.date
                            );

                        if (dateComparison !== 0) {
                            return dateComparison;
                        }

                        return firstAppointment.timeSlot.localeCompare(
                            secondAppointment.timeSlot
                        );
                    }
                );
            });

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

    // Opens the Appointment deletion confirmation.
    const handleDeleteAppointment = (appointment) => {
        setAppointmentDeleteError("");
        setAppointmentPendingDelete(appointment);
    };

    // Closes the deletion confirmation without deleting.
    const handleCancelDeleteAppointment = () => {
        if (appointmentDeleting) {
            return;
        }
        setAppointmentDeleteError("");
        setAppointmentPendingDelete(null);
    };

    // Permanently deletes the selected appointment from the database.
    const handleConfirmDeleteAppointment = async () => {
        console.log("Delete confirmation clicked", {
            appointmentPendingDelete,
            appointmentDeleting,
        });

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
            console.error("Delete appointment failed:", error);

            setAppointmentDeleteError(
                error.message ||
                    "Unable to delete the appointment."
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
    };
}

export default useAppointments;
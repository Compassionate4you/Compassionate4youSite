//Handlers for Add Appointments
import { useState } from "react";

function useAppointments() {
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [ appointmentPendingDelete, setAppointmentPendingDelete, ] = useState(null);
    const [appointments, setAppointments] = useState([
        {
            id: 1,
            name: "John Doe",
            service: "Home Health",
            date: "2026-03-05",
            status: "Confirmed",
        },
        {
            id: 2,
            name: "Mary Smith",
            service: "Hospice",
            date: "2026-03-06",
            status: "Pending",
        },
        {
            id: 3,
            name: "Robert Williams",
            service: "Home Health",
            date: "2026-03-07",
            status: "Confirmed",
        },
    ]);

    const [appointmentForm, setAppointmentForm] = useState({
        name: "", service: "", date: "", status: "", 
    });

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
            name: "", service: "", date: "", status: "",
        });
    };

    // Opens an empty form for a new Appointment.
    const handleOpenAddAppointment = () => {
        resetAppointmentForm();
        setEditingAppointmentId(null);
        setShowAppointmentForm(true);
    };

    // Opens the form with an existing Appointment's information.
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

    // Adds a new Appointment or saves an edited Appointment.
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

    // Opens the Appointment deletion confirmation.
    const handleDeleteAppointment = (appointment) => {
        setAppointmentPendingDelete(appointment);
    };

    // Closes the deletion confirmation without deleting.
    const handleCancelDeleteAppointment = () => {
        setAppointmentPendingDelete(null);
    };

    // Deletes the selected Appointment.
    const handleConfirmDeleteAppointment = () => {
        if (!appointmentPendingDelete) {
            return;
        }
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

    return {
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
    };
}

export default useAppointments;
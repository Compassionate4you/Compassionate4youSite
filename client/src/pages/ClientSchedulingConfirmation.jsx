import React from "react";
import "./ClientSchedulingConfirmation.css";

export function ClientSchedulingConfirmation({ appointment }) {
  return (
    <div className="confirmation-container">
      <h2>Appointment Scheduled!</h2>
      <p>Your appointment request has been received. Our team will contact you shortly.</p>

      <div className="appointment-details">
        <h3>Appointment Details</h3>
        <p><strong>Name:</strong> {appointment.fullName}</p>
        <p><strong>Service:</strong> {appointment.serviceType}</p>
        <p><strong>Date:</strong> {appointment.date?.toLocaleDateString()}</p>
        <p><strong>Time:</strong> {appointment.timeSlot}</p>
      </div>

      <button onClick={() => window.location.reload()}>Return to Form</button>
    </div>
  );
}

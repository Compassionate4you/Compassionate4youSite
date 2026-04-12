import React from "react";
import "../styles/scheduling.css";

export function ClientSchedulingConfirmation({ appointment, onReset }) {
  return (
    <div className="content">
      <div className="section-box">
        <h2>Appointment Scheduled!</h2>

        <p className="desc">
          We will contact you shortly.
        </p>

        <p><strong>Name:</strong> {appointment.fullName}</p>
        <p><strong>Date:</strong> {appointment.date.toDateString()}</p>
        <p><strong>Time:</strong> {appointment.timeSlot}</p>

        <button className="btn-primary" onClick={onReset}>
          Schedule Another
        </button>
      </div>
    </div>
  );
}

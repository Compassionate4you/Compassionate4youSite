import React, { useState } from "react";
import { Calendar } from "./Calendar";
import "./schedule.css";
//remember to put calendar in compenents =====================

export function Schedule({ onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceType: "",
    date: null,
    timeSlot: "",
    notes: "",
  });

  const timeSlots = [
    "8:00 AM - 9:00 AM",
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="schedule-container">
      <h1>Schedule an Appointment</h1>
      <form onSubmit={handleSubmit} className="appointment-form">
        <label>
          Full Name *
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />
        </label>

        <label>
          Phone *
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
        </label>

        <label>
          Email *
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </label>

        <label>
          Service *
          <select
            value={formData.serviceType}
            onChange={(e) =>
              setFormData({ ...formData, serviceType: e.target.value })
            }
            required
          >
            <option value="">Select a service</option>
            <option value="home-health">Home Health</option>
            <option value="hospice">Hospice Care</option>
            <option value="consultation">Consultation</option>
          </select>
        </label>

        <label>
          Preferred Date *
          <Calendar
            selected={formData.date}
            onSelect={(date) => setFormData({ ...formData, date })}
          />
        </label>

        {formData.date && (
          <label>
            Time Slot *
            <select
              value={formData.timeSlot}
              onChange={(e) =>
                setFormData({ ...formData, timeSlot: e.target.value })
              }
              required
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Notes
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </label>

        <button
          type="submit"
          disabled={!formData.date || !formData.timeSlot}
        >
          Schedule Appointment
        </button>
      </form>
    </div>
  );
}

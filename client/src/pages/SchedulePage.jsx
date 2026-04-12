import React, { useState } from "react";
import { Calendar } from "../components/Calendar";
import "../styles/portal.css";

function SchedulePage({ onSubmit }) {
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
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.timeSlot) return;
    onSubmit(formData);
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <div className="avatar">CH</div>
          <div>
            <div className="navbar-title">Client Portal</div>
            <div className="navbar-subtitle">Welcome back</div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="section-box">
          <h2>Schedule Appointment</h2>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>Date</label>
              <Calendar
                selected={formData.date}
                onSelect={(date) =>
                  setFormData({ ...formData, date })
                }
              />
            </div>

            {formData.date && (
              <div className="field">
                <label>Time</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeSlot: e.target.value,
                    })
                  }
                >
                  <option value="">Select time</option>
                  {timeSlots.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <button className="btn-primary" type="submit">
              Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;

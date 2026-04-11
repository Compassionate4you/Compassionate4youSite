import React from "react";
import "./schedule.css"; // reuse schedule.css for styling

export function Calendar({ selected, onSelect }) {
  const today = new Date();
  const daysInMonth = 30; // simple 30-day view for demo
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="calendar">
      {days.map((day) => (
        <div
          key={day}
          className={`calendar-day ${selected === day ? "selected" : ""}`}
          onClick={() => onSelect(day)}
        >
          {day}
        </div>
      ))}
    </div>
  );
}

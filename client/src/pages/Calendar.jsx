import React from "react";

export function Calendar({ selected, onSelect }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(i + 1);
    return date;
  });

  return (
    <div className="calendar">
      {days.map((date, i) => {
        const isSelected =
          selected &&
          date.toDateString() === selected.toDateString();

        return (
          <div
            key={i}
            className={`calendar-day ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(date)}
          >
            {date.getDate()}
          </div>
        );
      })}
    </div>
  );
}

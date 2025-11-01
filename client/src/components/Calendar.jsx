import React from "react";

const Calendar = ({
  days = [],
  timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM"], // Default time slots
  mode = "view",
  onAddDate = () => {},
  onReserveDate = () => {},
}) => {
  const handleDateClick = (date) => {
    if (mode === "edit") {
      onAddDate(date);
    } else if (mode === "view") {
      onReserveDate(date);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">
        {mode === "edit" ? "Edit Available Dates" : "Reserve a Date"}
      </h2>
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => (
          <button
            key={index}
            className={`p-2 border rounded ${
              mode === "edit" ? "bg-blue-50 hover:bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => handleDateClick(day)}
          >
            {new Date(day).toLocaleDateString()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;

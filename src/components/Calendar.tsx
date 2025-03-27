"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarComponent: React.FC = () => {
  const [date, setDate] = useState(new Date());

  const onChange = (newDate: Date) => {
    setDate(newDate);
    // Add logic to save availability to Firestore
  };

  return (
    <div>
      <Calendar onChange={onChange} value={date} />
    </div>
  );
};

export default CalendarComponent;
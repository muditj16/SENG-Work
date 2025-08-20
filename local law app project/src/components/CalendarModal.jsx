import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

// Sample events data
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Council Meeting",
    date: new Date(2025, 6, 7), // July 7, 2025
    type: "council",
    description: "Monthly council meeting to discuss community issues",
  },
  {
    id: 2,
    title: "Public Hearing - Zoning Changes",
    date: new Date(2025, 6, 14), // July 14, 2025
    type: "hearing",
    description:
      "Public hearing regarding proposed zoning changes on Main Street",
  },
  {
    id: 3,
    title: "Council Meeting",
    date: new Date(2025, 6, 21), // July 21, 2025
    type: "council",
    description: "Regular council meeting",
  },
  {
    id: 4,
    title: "Public Hearing - Budget Review",
    date: new Date(2025, 6, 28), // July 28, 2025
    type: "hearing",
    description: "Annual budget review and public consultation",
  },
  {
    id: 5,
    title: "Council Meeting",
    date: new Date(2025, 7, 4), // August 4, 2025
    type: "council",
    description: "Monthly council meeting",
  },
  {
    id: 6,
    title: "Public Hearing - Development Proposal",
    date: new Date(2025, 7, 11), // August 11, 2025
    type: "hearing",
    description: "Public hearing for new residential development proposal",
  },
];

function CalendarModal({ onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCouncilEvent, setSelectedCouncilEvent] = useState(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const getEventsForDay = (day) => {
    return SAMPLE_EVENTS.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return SAMPLE_EVENTS.filter((event) => event.date >= today)
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);
  };

  const calendarDays = [];

  dayNames.forEach((day) => {
    calendarDays.push(
      <div key={`header-${day}`} className="calendar-day-header">
        {day}
      </div>
    );
  });

  for (let i = 0; i < firstDayWeekday; i++) {
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const day = prevMonth.getDate() - firstDayWeekday + i + 1;
    calendarDays.push(
      <div key={`prev-${i}`} className="calendar-day other-month">
        <span className="day-number">{day}</span>
      </div>
    );
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear;

    const dayEvents = getEventsForDay(day);

    calendarDays.push(
      <div
        key={`current-${day}`}
        className={`calendar-day current-month ${isToday ? "today" : ""}`}
      >
        <span className="day-number">{day}</span>
        {dayEvents.length > 0 && (
          <div className="event-indicators">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`event-dot ${event.type}`}
                title={event.title}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const totalCells = Math.ceil((calendarDays.length - 7) / 7) * 7 + 7;
  const remainingCells = totalCells - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push(
      <div key={`next-${day}`} className="calendar-day other-month">
        <span className="day-number">{day}</span>
      </div>
    );
  }

  const upcomingEvents = getUpcomingEvents();

  // Council meeting details modal
  const renderCouncilPopup = () =>
    selectedCouncilEvent && (
      <div className="council-modal-overlay">
        <div className="council-detail-modal">
          <div className="law-detail-header">
            <h2 className="law-detail-title">{selectedCouncilEvent.title}</h2>
            <button
              className="calendar-close-btn"
              onClick={() => setSelectedCouncilEvent(null)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
          <div className="law-detail-content">
            <div className="council-meeting-details">
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{selectedCouncilEvent.date.toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">7:00 PM</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">City Hall, 123 Main St.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedCouncilEvent.description}</span>
              </div>
            </div>
            <div className="council-meeting-actions">
              <button 
                className="btn btn-primary"
                onClick={() => { 
                  alert("Reminder set!"); 
                  setSelectedCouncilEvent(null); 
                }}
              >
                Remind me
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => { 
                  window.open("https://www.example.com/council-meeting", "_blank"); 
                  setSelectedCouncilEvent(null); 
                }}
              >
                External link
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="calendar-fullscreen">
      <div className="calendar-fullscreen-header">
        <h1 className="calendar-screen-title">Events Calendar</h1>
        <button className="calendar-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="calendar-fullscreen-content">
        <div className="calendar-section">
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="calendar-month-title">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button className="nav-btn" onClick={() => navigateMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="calendar-fullscreen-grid">{calendarDays}</div>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="event-dot council"></div>
              <span>Council Meeting</span>
            </div>
            <div className="legend-item">
              <div className="event-dot hearing"></div>
              <span>Public Hearing</span>
            </div>
          </div>
        </div>
        <div className="upcoming-events-section">
          <h3 className="upcoming-title">Upcoming Events</h3>
          <div className="upcoming-events-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="upcoming-event-card"
                  onClick={() =>
                    event.type === "council"
                      ? setSelectedCouncilEvent(event)
                      : undefined
                  }
                  style={
                    event.type === "council"
                      ? { cursor: "pointer" }
                      : undefined
                  }
                  title={
                    event.type === "council"
                      ? "Click for meeting details"
                      : undefined
                  }
                >
                  <div className="event-date">
                    <div className="event-day">{event.date.getDate()}</div>
                    <div className="event-month">
                      {monthNames[event.date.getMonth()].substring(0, 3)}
                    </div>
                  </div>
                  <div className="event-details">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-description">{event.description}</p>
                  </div>
                  <div className={`event-type-badge ${event.type}`}>
                    {event.type === "council" ? "Council" : "Hearing"}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                <p>No upcoming events scheduled</p>
              </div>
            )}
          </div>
        </div>
        {renderCouncilPopup()}
      </div>
    </div>
  );
}

export default CalendarModal;
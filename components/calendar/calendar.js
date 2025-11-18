'use client';

import React, { useState, useEffect } from 'react';
import '../styles/Calendar.scss';
import UserProfile from '../../app/session/UserProfile';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventModal, setEventModal] = useState({ open: false, date: null, event: null });
  const [plannedEventsModal, setPlannedEventsModal] = useState(false);

  const formatDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Get storage key based on user email (session-based)
  const getStorageKey = () => {
    const email = UserProfile.getEmail();
    return email ? `calendarEvents_${email}` : 'calendarEvents';
  };

  // Load events from localStorage (session-based, persists across refreshes)
  const loadEvents = () => {
    if (typeof window === 'undefined') return;
    
    const storageKey = getStorageKey();
    const savedEvents = localStorage.getItem(storageKey);
    
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      } catch (e) {
        console.error('Error loading events from session:', e);
        setEvents({});
      }
    } else {
      setEvents({});
    }
  };

  // Save events to localStorage whenever they change (session-based)
  const saveEvents = (eventsToSave) => {
    if (typeof window === 'undefined') return;
    
    const storageKey = getStorageKey();
    if (storageKey && storageKey !== 'calendarEvents') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(eventsToSave));
      } catch (e) {
        console.error('Error saving events to session:', e);
      }
    }
  };

  // Load events on mount and when user changes
  useEffect(() => {
    loadEvents();

    // Reload events when user email changes
    const checkUserChange = () => {
      const email = UserProfile.getEmail();
      const lastEmail = localStorage.getItem('_lastCalendarEmail');
      if (lastEmail !== email) {
        localStorage.setItem('_lastCalendarEmail', email || '');
        loadEvents();
      }
    };

    // Check every 2 seconds for user changes
    const interval = setInterval(checkUserChange, 2000);

    // Also listen for storage changes (when session is restored in another tab)
    const handleStorageChange = (e) => {
      if (e.key === getStorageKey() || e.key === '_lastCalendarEmail') {
        loadEvents();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    // Only save if we have a valid storage key (user is logged in)
    const storageKey = getStorageKey();
    if (storageKey && storageKey !== 'calendarEvents') {
      saveEvents(events);
    }
  }, [events]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Fill remaining cells to make 35 cells (5 rows × 7 columns)
    while (days.length < 35) {
      days.push(null);
    }

    return days;
  };

  const getMonthsInYear = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }

    return months;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateYear = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date) => {
    const key = formatDateKey(date);
    return events[key] || [];
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    setEventModal({ open: true, date, event: null });
  };

  const handleMonthClick = (monthDate) => {
    setCurrentDate(monthDate);
    setViewMode('month');
  };

  const handleSaveEvent = (eventData) => {
    const key = formatDateKey(eventModal.date);
    const updatedEvents = { ...events };
    
    if (eventModal.event && eventModal.event.id) {
      // Update existing event
      const eventIndex = updatedEvents[key]?.findIndex(e => e.id === eventModal.event.id);
      if (eventIndex !== undefined && eventIndex !== -1) {
        updatedEvents[key][eventIndex] = { ...eventModal.event, ...eventData };
      }
    } else {
      // Add new event
      const newEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...eventData
      };
      if (!updatedEvents[key]) {
        updatedEvents[key] = [];
      }
      updatedEvents[key].push(newEvent);
    }

    setEvents(updatedEvents);
    setEventModal({ open: false, date: null, event: null });
  };

  const handleDeleteEvent = (eventId) => {
    const key = formatDateKey(eventModal.date);
    const updatedEvents = { ...events };
    
    if (updatedEvents[key]) {
      updatedEvents[key] = updatedEvents[key].filter(e => e.id !== eventId);
      if (updatedEvents[key].length === 0) {
        delete updatedEvents[key];
      }
    }

    setEvents(updatedEvents);
    setEventModal({ open: false, date: null, event: null });
  };

  const handleEventClick = (date, event) => {
    setSelectedDate(date);
    setEventModal({ open: true, date, event });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  // Get all planned events sorted by date
  const getAllPlannedEvents = () => {
    const allEvents = [];
    Object.keys(events).forEach(dateKey => {
      const dateEvents = events[dateKey];
      if (dateEvents && dateEvents.length > 0) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        dateEvents.forEach(event => {
          allEvents.push({
            ...event,
            date: eventDate,
            dateKey
          });
        });
      }
    });
    
    // Sort by date (upcoming first)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date - b.date);
  };

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__controls">
          <button onClick={goToToday} className="calendar__button calendar__button--today">
            Today
          </button>
          <div className="calendar__navigation">
            <button 
              onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateYear(-1)}
              className="calendar__button calendar__button--nav"
            >
              ←
            </button>
            <h2 className="calendar__title">
              {viewMode === 'month' 
                ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : currentDate.getFullYear()}
            </h2>
            <button 
              onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateYear(1)}
              className="calendar__button calendar__button--nav"
            >
              →
            </button>
          </div>
        </div>
        <div className="calendar__header-actions">
          <button 
            onClick={() => setPlannedEventsModal(true)}
            className="calendar__button calendar__button--events"
          >
            Planned Events
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            className="calendar__button calendar__button--toggle"
          >
            {viewMode === 'month' ? 'Year View' : 'Month View'}
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="calendar__month-view">
          <div className="calendar__weekdays">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="calendar__weekday">{day}</div>
            ))}
          </div>
          <div className="calendar__grid">
            {getDaysInMonth(currentDate).map((date, index) => (
              <div
                key={index}
                className={`calendar__day ${!date ? 'calendar__day--empty' : ''} ${!isCurrentMonth(date) ? 'calendar__day--other-month' : ''} ${isToday(date) ? 'calendar__day--today' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date && (
                  <>
                    <span className="calendar__day-number">{date.getDate()}</span>
                    <div className="calendar__day-events">
                      {getEventsForDate(date).slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="calendar__event-dot"
                          style={{ backgroundColor: event.color || COLOR_OPTIONS[0] }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(date, event);
                          }}
                          title={event.name}
                        />
                      ))}
                      {getEventsForDate(date).length > 3 && (
                        <span className="calendar__event-more">+{getEventsForDate(date).length - 3}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="calendar__year-view">
          {getMonthsInYear().map((monthDate, index) => {
            const monthDays = getDaysInMonth(monthDate);
            const monthEvents = monthDays.reduce((acc, day) => {
              if (day) {
                const dayEvents = getEventsForDate(day);
                return acc + dayEvents.length;
              }
              return acc;
            }, 0);

            return (
              <div
                key={index}
                className="calendar__month-card"
                onClick={() => handleMonthClick(monthDate)}
              >
                <h3 className="calendar__month-name">{MONTH_NAMES[index]}</h3>
                <div className="calendar__month-mini-grid">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="calendar__mini-weekday">{day[0]}</div>
                  ))}
                  {monthDays.slice(0, 35).map((date, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`calendar__mini-day ${!date ? 'calendar__mini-day--empty' : ''} ${isToday(date) ? 'calendar__mini-day--today' : ''}`}
                    >
                      {date && date.getDate()}
                    </div>
                  ))}
                </div>
                {monthEvents > 0 && (
                  <div className="calendar__month-events-count">{monthEvents} event{monthEvents !== 1 ? 's' : ''}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {eventModal.open && (
        <EventModal
          date={eventModal.date}
          event={eventModal.event}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setEventModal({ open: false, date: null, event: null })}
          colorOptions={COLOR_OPTIONS}
        />
      )}

      {plannedEventsModal && (
        <PlannedEventsModal
          events={getAllPlannedEvents()}
          onClose={() => setPlannedEventsModal(false)}
          onEventClick={(event) => {
            setPlannedEventsModal(false);
            setEventModal({ open: true, date: event.date, event });
          }}
          onDateClick={(date) => {
            setPlannedEventsModal(false);
            setCurrentDate(date);
            setViewMode('month');
            setEventModal({ open: true, date, event: null });
          }}
        />
      )}
    </div>
  );
}

function EventModal({ date, event, onSave, onDelete, onClose, colorOptions }) {
  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [color, setColor] = useState(event?.color || colorOptions[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      color
    });
  };

  return (
    <div className="event-modal__overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal__header">
          <h3>{event ? 'Edit Event' : 'New Event'}</h3>
          <button onClick={onClose} className="event-modal__close">×</button>
        </div>
        
        <div className="event-modal__date">
          {date && `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
        </div>

        <form onSubmit={handleSubmit} className="event-modal__form">
          <div className="event-modal__field">
            <label>Event Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              required
              autoFocus
            />
          </div>

          <div className="event-modal__field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows="4"
            />
          </div>

          <div className="event-modal__field">
            <label>Color</label>
            <div className="event-modal__colors">
              {colorOptions.map((col) => (
                <button
                  key={col}
                  type="button"
                  className={`event-modal__color-option ${color === col ? 'event-modal__color-option--selected' : ''}`}
                  style={{ backgroundColor: col }}
                  onClick={() => setColor(col)}
                  title={col}
                />
              ))}
            </div>
          </div>

          <div className="event-modal__actions">
            {event && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="event-modal__button event-modal__button--delete"
              >
                Delete
              </button>
            )}
            <div className="event-modal__actions-right">
              <button
                type="button"
                onClick={onClose}
                className="event-modal__button event-modal__button--cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="event-modal__button event-modal__button--save"
                disabled={!name.trim()}
              >
                {event ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlannedEventsModal({ events, onClose, onEventClick, onDateClick }) {
  const formatEventDate = (date) => {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    return `In ${Math.floor(diffDays / 30)} months`;
  };

  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = formatEventDate(event.date);
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: event.date,
        events: []
      };
    }
    acc[dateKey].events.push(event);
    return acc;
  }, {});

  return (
    <div className="event-modal__overlay" onClick={onClose}>
      <div className="planned-events-modal" onClick={(e) => e.stopPropagation()}>
        <div className="planned-events-modal__header">
          <h3>Planned Events ({events.length})</h3>
          <button onClick={onClose} className="event-modal__close">×</button>
        </div>
        
        <div className="planned-events-modal__content">
          {events.length === 0 ? (
            <div className="planned-events-modal__empty">
              <p>No upcoming events planned.</p>
              <p className="planned-events-modal__empty-hint">Click on any date to add an event.</p>
            </div>
          ) : (
            <div className="planned-events-modal__list">
              {Object.keys(groupedEvents).map(dateKey => {
                const { date, events: dayEvents } = groupedEvents[dateKey];
                return (
                  <div key={dateKey} className="planned-events-modal__day-group">
                    <div className="planned-events-modal__day-header">
                      <h4>{dateKey}</h4>
                      <span className="planned-events-modal__days-until">{getDaysUntil(date)}</span>
                      <button
                        className="planned-events-modal__add-btn"
                        onClick={() => onDateClick(date)}
                        title="Add event to this date"
                      >
                        +
                      </button>
                    </div>
                    <div className="planned-events-modal__events">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="planned-events-modal__event"
                          onClick={() => onEventClick(event)}
                        >
                          <div
                            className="planned-events-modal__event-color"
                            style={{ backgroundColor: event.color || COLOR_OPTIONS[0] }}
                          />
                          <div className="planned-events-modal__event-details">
                            <strong>{event.name}</strong>
                            {event.description && (
                              <p>{event.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

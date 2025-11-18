// calendarEvents helper deprecated
// This file previously provided helpers for a non-existent `calendar_events` table.
// The app now uses `lib/dates.js` and the API routes under `/api/calendar-events` act
// as adapters to the `dates` API. Keep this lightweight shim to surface clear
// errors if something still imports this module.

export async function createCalendarEvent() {
  return { success: false, error: 'createCalendarEvent removed — use lib/dates functions via /api/calendar-events adapters' }
}

export async function getCalendarEvents() {
  return { success: false, error: 'getCalendarEvents removed — use lib/dates functions via /api/calendar-events adapters' }
}

export async function updateCalendarEvent() {
  return { success: false, error: 'updateCalendarEvent removed — use lib/dates functions via /api/calendar-events adapters' }
}

export async function deleteCalendarEvent() {
  return { success: false, error: 'deleteCalendarEvent removed — use lib/dates functions via /api/calendar-events adapters' }
}


-- Create calendar_events table for storing user calendar events
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS calendar_events (
  event_id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  event_color VARCHAR(7) DEFAULT '#3b82f6',
  assigned_to INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_assigned_to ON calendar_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_calendar_events_group_id ON calendar_events(group_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE
    ON calendar_events FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own events or events in their group (if admin)
CREATE POLICY "Users can view their own calendar events"
    ON calendar_events FOR SELECT
    USING (
        assigned_to = (SELECT user_id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
        OR
        group_id IN (SELECT group_id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
    );

-- Create policy: Users can insert their own events
CREATE POLICY "Users can insert their own calendar events"
    ON calendar_events FOR INSERT
    WITH CHECK (
        assigned_to = (SELECT user_id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
    );

-- Create policy: Users can update their own events
CREATE POLICY "Users can update their own calendar events"
    ON calendar_events FOR UPDATE
    USING (
        assigned_to = (SELECT user_id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
    );

-- Create policy: Users can delete their own events
CREATE POLICY "Users can delete their own calendar events"
    ON calendar_events FOR DELETE
    USING (
        assigned_to = (SELECT user_id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
    );


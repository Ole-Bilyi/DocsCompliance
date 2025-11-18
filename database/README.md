# Database Migrations

## Calendar Events Table

To enable calendar events functionality, you need to create the `calendar_events` table in your Supabase database.

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration**
   - Open the file `database/calendar_events_table.sql`
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute

3. **Verify the Table**
   - Go to Table Editor in Supabase
   - You should see the `calendar_events` table listed
   - The table should have the following columns:
     - `event_id` (Primary Key)
     - `event_name`
     - `event_description`
     - `event_date`
     - `event_color`
     - `assigned_to` (Foreign Key to users)
     - `group_id` (Foreign Key to groups)
     - `created_at`
     - `updated_at`

### Alternative: Run via Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db reset
# or
psql -h your-db-host -U postgres -d postgres -f database/calendar_events_table.sql
```

### Troubleshooting

If you get an error about the table already existing, you can modify the SQL to use:
```sql
CREATE TABLE IF NOT EXISTS calendar_events (...)
```

The migration file already includes this, so it's safe to run multiple times.


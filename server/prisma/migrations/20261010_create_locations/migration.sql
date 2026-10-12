/*DT-602: Create Locations Database Schema */

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),      --generating a new unique id for each location
    name TEXT NOT NULL,                                 --Name for the new location, cannot be empty
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),      --Time stamps for when each location was created or updated.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
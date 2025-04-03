-- Create room_users table for storing user IDs for each room
CREATE TABLE public.room_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    suffix TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(room_code, suffix)
);

-- Create index for faster queries
CREATE INDEX idx_room_users_room_code ON public.room_users (room_code);
CREATE INDEX idx_room_users_suffix ON public.room_users (suffix);

-- Enable Row Level Security
ALTER TABLE public.room_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for room_users table
CREATE POLICY "Allow select access to room_users for all users" 
ON public.room_users FOR SELECT USING (true);

CREATE POLICY "Allow insert access to room_users for all users" 
ON public.room_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to room_users for all users" 
ON public.room_users FOR UPDATE USING (true);

-- Enable realtime for room_users table
BEGIN;
  -- Add table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_users;
COMMIT;

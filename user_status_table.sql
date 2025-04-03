-- Create user_status table for tracking online status, typing, and seen
CREATE TABLE public.user_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    is_online BOOLEAN DEFAULT false,
    is_typing BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT now(),
    last_read_message_id UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(room_code, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_status_room_code ON public.user_status (room_code);
CREATE INDEX idx_user_status_user_id ON public.user_status (user_id);

-- Enable Row Level Security
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_status table
CREATE POLICY "Allow select access to user_status for all users" 
ON public.user_status FOR SELECT USING (true);

CREATE POLICY "Allow insert access to user_status for all users" 
ON public.user_status FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to user_status for all users" 
ON public.user_status FOR UPDATE USING (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update the updated_at column
CREATE TRIGGER update_user_status_updated_at
BEFORE UPDATE ON public.user_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for user_status table
BEGIN;
  -- Add table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_status;
COMMIT;

-- Create call_signals table for handling WebRTC signaling
CREATE TABLE public.call_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    caller_id TEXT NOT NULL,
    callee_id TEXT NOT NULL,
    call_type TEXT NOT NULL, -- 'audio' or 'video'
    status TEXT NOT NULL, -- 'ringing', 'accepted', 'rejected', 'ended'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_call_signals_room_code ON public.call_signals (room_code);

-- Enable Row Level Security
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for call_signals table
CREATE POLICY "Allow select access to call_signals for all users" 
ON public.call_signals FOR SELECT USING (true);

CREATE POLICY "Allow insert access to call_signals for all users" 
ON public.call_signals FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to call_signals for all users" 
ON public.call_signals FOR UPDATE USING (true);

-- Enable realtime for call_signals table
BEGIN;
  -- Add table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;
COMMIT;

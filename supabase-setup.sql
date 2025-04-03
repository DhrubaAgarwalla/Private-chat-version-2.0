-- Create rooms table
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create messages table with media support
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    media_type TEXT, -- 'image', 'video', 'audio', 'gif', or NULL for text
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_rooms_room_code ON public.rooms (room_code);
CREATE INDEX idx_messages_room_code ON public.messages (room_code);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rooms table
CREATE POLICY "Allow select access to rooms for all users" 
ON public.rooms FOR SELECT USING (true);

CREATE POLICY "Allow insert access to rooms for all users" 
ON public.rooms FOR INSERT WITH CHECK (true);

-- Create RLS policies for messages table
CREATE POLICY "Allow select access to messages for all users" 
ON public.messages FOR SELECT USING (true);

CREATE POLICY "Allow insert access to messages for all users" 
ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete access to messages for all users" 
ON public.messages FOR DELETE USING (true);

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_media', 'chat_media', true);

-- Set up storage policies
CREATE POLICY "Allow public access to chat media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat_media');

CREATE POLICY "Allow uploads to chat media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat_media');

-- Enable realtime for both tables
BEGIN;
  -- Add tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
COMMIT;

-- Make sure realtime is enabled for the user_status table
BEGIN;
  -- Check if the table is already in the publication
  DO $$
  DECLARE
    table_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_status'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
      -- Add the table to the publication
      ALTER PUBLICATION supabase_realtime ADD TABLE public.user_status;
      RAISE NOTICE 'Added user_status table to supabase_realtime publication';
    ELSE
      RAISE NOTICE 'user_status table is already in the supabase_realtime publication';
    END IF;
  END $$;
COMMIT;

-- Enable all changes (INSERT, UPDATE, DELETE) for the user_status table
BEGIN;
  -- Enable full replication for the user_status table
  ALTER TABLE public.user_status REPLICA IDENTITY FULL;
COMMIT;

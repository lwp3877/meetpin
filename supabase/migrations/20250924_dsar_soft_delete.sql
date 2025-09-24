-- DSAR Soft Delete Migration
-- Adds soft delete capabilities to all user-related tables
-- GDPR compliant: 14 days grace period before permanent deletion

-- Add soft delete columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to rooms table  
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to host_messages table
ALTER TABLE host_messages ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE host_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete columns to blocked_users table
ALTER TABLE blocked_users ADD COLUMN IF NOT EXISTS soft_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE blocked_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_profiles_soft_deleted ON profiles(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_rooms_soft_deleted ON rooms(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_requests_soft_deleted ON requests(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_matches_soft_deleted ON matches(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_soft_deleted ON messages(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_host_messages_soft_deleted ON host_messages(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_soft_deleted ON notifications(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_reports_soft_deleted ON reports(soft_deleted) WHERE soft_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_blocked_users_soft_deleted ON blocked_users(soft_deleted) WHERE soft_deleted = FALSE;

-- Create deletion_requests table for DSAR tracking
CREATE TABLE IF NOT EXISTS deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
    reason TEXT DEFAULT 'user_request',
    additional_info TEXT DEFAULT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'executed')),
    scheduled_deletion_date TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ DEFAULT NULL,
    executed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for deletion requests
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_status ON deletion_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled ON deletion_requests(scheduled_deletion_date) WHERE status = 'pending';

-- RLS policies to exclude soft deleted records
-- These will be applied to all tables to hide soft deleted content

-- Function to update RLS policies for soft delete filtering
CREATE OR REPLACE FUNCTION update_rls_for_soft_delete() RETURNS void AS $$
BEGIN
    -- Update profiles RLS
    DROP POLICY IF EXISTS "Users can view non-deleted profiles" ON profiles;
    CREATE POLICY "Users can view non-deleted profiles" ON profiles
        FOR SELECT USING (soft_deleted = FALSE);

    -- Update rooms RLS  
    DROP POLICY IF EXISTS "Users can view non-deleted rooms" ON rooms;
    CREATE POLICY "Users can view non-deleted rooms" ON rooms
        FOR SELECT USING (soft_deleted = FALSE);
        
    -- Update requests RLS
    DROP POLICY IF EXISTS "Users can view non-deleted requests" ON requests;  
    CREATE POLICY "Users can view non-deleted requests" ON requests
        FOR SELECT USING (soft_deleted = FALSE);
        
    -- Update matches RLS
    DROP POLICY IF EXISTS "Users can view non-deleted matches" ON matches;
    CREATE POLICY "Users can view non-deleted matches" ON matches  
        FOR SELECT USING (soft_deleted = FALSE);
        
    -- Update messages RLS
    DROP POLICY IF EXISTS "Users can view non-deleted messages" ON messages;
    CREATE POLICY "Users can view non-deleted messages" ON messages
        FOR SELECT USING (soft_deleted = FALSE);
        
    -- Update host_messages RLS
    DROP POLICY IF EXISTS "Users can view non-deleted host messages" ON host_messages;
    CREATE POLICY "Users can view non-deleted host messages" ON host_messages
        FOR SELECT USING (soft_deleted = FALSE);
        
    -- Update notifications RLS
    DROP POLICY IF EXISTS "Users can view non-deleted notifications" ON notifications;
    CREATE POLICY "Users can view non-deleted notifications" ON notifications
        FOR SELECT USING (soft_deleted = FALSE);
END;
$$ LANGUAGE plpgsql;

-- Apply the RLS updates
SELECT update_rls_for_soft_delete();

-- Function to soft delete a user and all their data
CREATE OR REPLACE FUNCTION soft_delete_user(target_user_id UUID) RETURNS void AS $$
DECLARE
    deletion_date TIMESTAMPTZ := NOW() + INTERVAL '14 days';
BEGIN
    -- Set deletion timestamp for all user-related data
    UPDATE profiles SET soft_deleted = TRUE, deleted_at = deletion_date WHERE uid = target_user_id;
    UPDATE rooms SET soft_deleted = TRUE, deleted_at = deletion_date WHERE host_uid = target_user_id;
    UPDATE requests SET soft_deleted = TRUE, deleted_at = deletion_date WHERE requester_uid = target_user_id;
    UPDATE matches SET soft_deleted = TRUE, deleted_at = deletion_date WHERE host_uid = target_user_id OR guest_uid = target_user_id;
    UPDATE messages SET soft_deleted = TRUE, deleted_at = deletion_date WHERE sender_uid = target_user_id;
    UPDATE host_messages SET soft_deleted = TRUE, deleted_at = deletion_date WHERE sender_uid = target_user_id OR receiver_uid = target_user_id;
    UPDATE notifications SET soft_deleted = TRUE, deleted_at = deletion_date WHERE user_id = target_user_id;
    UPDATE reports SET soft_deleted = TRUE, deleted_at = deletion_date WHERE reporter_uid = target_user_id OR target_uid = target_user_id;
    UPDATE blocked_users SET soft_deleted = TRUE, deleted_at = deletion_date WHERE blocker_uid = target_user_id OR blocked_uid = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to permanently purge expired soft deleted data
CREATE OR REPLACE FUNCTION purge_expired_soft_deleted_data() RETURNS void AS $$
BEGIN
    -- Only delete records where deletion date has passed
    DELETE FROM blocked_users WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM reports WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM notifications WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM host_messages WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM messages WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM matches WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM requests WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM rooms WHERE soft_deleted = TRUE AND deleted_at < NOW();
    DELETE FROM profiles WHERE soft_deleted = TRUE AND deleted_at < NOW();
    
    -- Update executed deletion requests
    UPDATE deletion_requests 
    SET status = 'executed', executed_at = NOW() 
    WHERE status = 'pending' AND scheduled_deletion_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION soft_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION purge_expired_soft_deleted_data() TO service_role;
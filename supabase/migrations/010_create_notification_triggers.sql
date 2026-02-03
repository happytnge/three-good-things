-- Function to create notification when someone likes an entry
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  entry_owner_id UUID;
BEGIN
  -- Get the owner of the liked entry
  SELECT user_id INTO entry_owner_id FROM entries WHERE id = NEW.entry_id;

  -- Only create notification if the liker is not the entry owner
  IF NEW.user_id != entry_owner_id THEN
    INSERT INTO notifications (recipient_id, actor_id, type, entry_id)
    VALUES (entry_owner_id, NEW.user_id, 'like', NEW.entry_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when a like is added
CREATE TRIGGER on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- Function to remove notification when someone unlikes an entry
CREATE OR REPLACE FUNCTION remove_notification_on_unlike()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE actor_id = OLD.user_id
    AND entry_id = OLD.entry_id
    AND type = 'like';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to remove notification when a like is removed
CREATE TRIGGER on_like_deleted
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION remove_notification_on_unlike();

-- Function to create notification when someone follows a user
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, entry_id)
  VALUES (NEW.following_id, NEW.follower_id, 'follow', NULL)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when a follow is added
CREATE TRIGGER on_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Function to remove notification when someone unfollows a user
CREATE OR REPLACE FUNCTION remove_notification_on_unfollow()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE actor_id = OLD.follower_id
    AND recipient_id = OLD.following_id
    AND type = 'follow';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to remove notification when a follow is removed
CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION remove_notification_on_unfollow();

-- Add comments
COMMENT ON FUNCTION notify_on_like() IS 'Creates a notification when a user likes an entry';
COMMENT ON FUNCTION remove_notification_on_unlike() IS 'Removes the notification when a user unlikes an entry';
COMMENT ON FUNCTION notify_on_follow() IS 'Creates a notification when a user follows another user';
COMMENT ON FUNCTION remove_notification_on_unfollow() IS 'Removes the notification when a user unfollows another user';

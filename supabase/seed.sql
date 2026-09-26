-- Seed data for CampusFlow

-- Insert dummy users into auth.users (requires setting up Supabase auth first, or just insert into profiles if testing with RLS off)
-- Note: In a real Supabase environment, you would sign up users via the auth endpoint, which triggers the `handle_new_user` function.
-- For local testing/seeding, we will assume you have created a few users via the UI and we will update their roles.

-- Assuming you created 3 users in your Supabase Auth, you can update their roles in the profiles table:
/*
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
UPDATE public.profiles SET role = 'moderator' WHERE email = 'mod@example.com';
*/

-- Example Categories and other enums are checked by DB constraints.

-- Insert some dummy events (Replace with valid UUIDs from your profiles table for organizer_id)
/*
INSERT INTO public.events (organizer_id, title, description, category, location, start_date, max_participants)
VALUES 
  ('uuid-here', 'Annual Tech Symposium', 'A grand gathering of tech enthusiasts.', 'technical', 'Main Auditorium', now() + interval '5 days', 200),
  ('uuid-here', 'Cultural Fest 2024', 'Annual cultural festival.', 'cultural', 'Campus Grounds', now() + interval '10 days', 500);
*/

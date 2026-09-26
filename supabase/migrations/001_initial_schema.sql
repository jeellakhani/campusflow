-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  username text unique,
  avatar_url text,
  college text,
  department text,
  year_of_study integer check (year_of_study between 1 and 6),
  bio text,
  role text not null default 'student' check (role in ('student', 'moderator', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- COMPLAINTS TABLE
-- ============================================
create table public.complaints (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null check (category in ('electricity','water','hostel','classroom','internet','cleaning','security','other')),
  location text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'submitted' check (status in ('submitted','under_review','in_progress','resolved','closed')),
  image_url text,
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_complaints_user_id on public.complaints(user_id);
create index idx_complaints_status on public.complaints(status);
create index idx_complaints_category on public.complaints(category);
create index idx_complaints_created_at on public.complaints(created_at desc);

-- ============================================
-- COMPLAINT COMMENTS
-- ============================================
create table public.complaint_comments (
  id uuid primary key default uuid_generate_v4(),
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_complaint_comments_complaint_id on public.complaint_comments(complaint_id);

-- ============================================
-- LOST & FOUND POSTS
-- ============================================
create table public.lost_found_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('lost','found')),
  item_name text not null,
  description text not null,
  category text not null default 'other' check (category in ('electronics','documents','clothing','accessories','books','keys','wallet','phone','other')),
  location text not null,
  date_lost_found date not null,
  image_url text,
  contact_info text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_lost_found_user_id on public.lost_found_posts(user_id);
create index idx_lost_found_type on public.lost_found_posts(type);
create index idx_lost_found_created_at on public.lost_found_posts(created_at desc);

-- ============================================
-- EVENTS
-- ============================================
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null default 'other' check (category in ('academic','cultural','sports','technical','social','workshop','seminar','other')),
  location text not null,
  start_date timestamptz not null,
  end_date timestamptz,
  max_participants integer,
  cover_image_url text,
  is_published boolean not null default true,
  registration_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_organizer_id on public.events(organizer_id);
create index idx_events_start_date on public.events(start_date);
create index idx_events_category on public.events(category);

-- ============================================
-- EVENT PARTICIPANTS
-- ============================================
create table public.event_participants (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index idx_event_participants_event_id on public.event_participants(event_id);
create index idx_event_participants_user_id on public.event_participants(user_id);

-- ============================================
-- QUESTIONS (Community Q&A)
-- ============================================
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null default 'general' check (category in ('academic','hostel','campus','technical','social','general','events','administration')),
  tags text[] default '{}',
  is_resolved boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_questions_user_id on public.questions(user_id);
create index idx_questions_category on public.questions(category);
create index idx_questions_created_at on public.questions(created_at desc);
create index idx_questions_tags on public.questions using gin(tags);

-- ============================================
-- ANSWERS
-- ============================================
create table public.answers (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_answers_question_id on public.answers(question_id);
create index idx_answers_user_id on public.answers(user_id);

-- ============================================
-- LIKES
-- ============================================
create table public.question_likes (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(question_id, user_id)
);

create table public.answer_likes (
  id uuid primary key default uuid_generate_v4(),
  answer_id uuid references public.answers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(answer_id, user_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('complaint_status','complaint_comment','question_answer','event_join','post_reported','admin_announcement','answer_liked','question_liked')),
  title text not null,
  message text not null,
  resource_type text check (resource_type in ('complaint','event','question','answer','lost_found')),
  resource_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- ============================================
-- REPORTS
-- ============================================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  resource_type text not null check (resource_type in ('complaint','event','question','answer','lost_found','profile')),
  resource_id uuid not null,
  reason text not null check (reason in ('spam','inappropriate','harassment','misinformation','other')),
  description text,
  status text not null default 'pending' check (status in ('pending','reviewed','resolved','dismissed')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_reports_status on public.reports(status);
create index idx_reports_resource_type on public.reports(resource_type);

-- ============================================
-- FULL TEXT SEARCH
-- ============================================
create index idx_complaints_fts on public.complaints using gin(to_tsvector('english', title || ' ' || description));
create index idx_events_fts on public.events using gin(to_tsvector('english', title || ' ' || description));
create index idx_questions_fts on public.questions using gin(to_tsvector('english', title || ' ' || description));
create index idx_lost_found_fts on public.lost_found_posts using gin(to_tsvector('english', item_name || ' ' || description));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.complaints for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.complaint_comments for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.lost_found_posts for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.events for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.questions for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.answers for each row execute function public.handle_updated_at();

-- ============================================
-- PROFILE AUTO-CREATE TRIGGER
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_comments enable row level security;
alter table public.lost_found_posts enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.question_likes enable row level security;
alter table public.answer_likes enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- Helper function
create or replace function public.get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- PROFILES policies
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins can update any profile" on public.profiles
  for update using (public.get_user_role() in ('admin'));

-- COMPLAINTS policies
create policy "Complaints viewable by authenticated users" on public.complaints
  for select using (auth.role() = 'authenticated');
create policy "Users can create complaints" on public.complaints
  for insert with check (auth.uid() = user_id);
create policy "Users can update own complaints" on public.complaints
  for update using (auth.uid() = user_id);
create policy "Admins and moderators can update any complaint" on public.complaints
  for update using (public.get_user_role() in ('admin', 'moderator'));
create policy "Users can delete own complaints" on public.complaints
  for delete using (auth.uid() = user_id);
create policy "Admins can delete any complaint" on public.complaints
  for delete using (public.get_user_role() = 'admin');

-- COMPLAINT COMMENTS policies
create policy "Comments viewable by authenticated users" on public.complaint_comments
  for select using (auth.role() = 'authenticated');
create policy "Users can create comments" on public.complaint_comments
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.complaint_comments
  for delete using (auth.uid() = user_id);
create policy "Admins can delete any comment" on public.complaint_comments
  for delete using (public.get_user_role() = 'admin');

-- LOST & FOUND policies
create policy "Lost found viewable by authenticated users" on public.lost_found_posts
  for select using (auth.role() = 'authenticated');
create policy "Users can create lost found posts" on public.lost_found_posts
  for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.lost_found_posts
  for update using (auth.uid() = user_id);
create policy "Admins can update any post" on public.lost_found_posts
  for update using (public.get_user_role() = 'admin');
create policy "Users can delete own posts" on public.lost_found_posts
  for delete using (auth.uid() = user_id);
create policy "Admins can delete any post" on public.lost_found_posts
  for delete using (public.get_user_role() = 'admin');

-- EVENTS policies
create policy "Events viewable by authenticated users" on public.events
  for select using (auth.role() = 'authenticated');
create policy "Users can create events" on public.events
  for insert with check (auth.uid() = organizer_id);
create policy "Organizers can update own events" on public.events
  for update using (auth.uid() = organizer_id);
create policy "Admins can update any event" on public.events
  for update using (public.get_user_role() in ('admin', 'moderator'));
create policy "Organizers can delete own events" on public.events
  for delete using (auth.uid() = organizer_id);
create policy "Admins can delete any event" on public.events
  for delete using (public.get_user_role() = 'admin');

-- EVENT PARTICIPANTS policies
create policy "Participants viewable by authenticated users" on public.event_participants
  for select using (auth.role() = 'authenticated');
create policy "Users can join events" on public.event_participants
  for insert with check (auth.uid() = user_id);
create policy "Users can leave events" on public.event_participants
  for delete using (auth.uid() = user_id);

-- QUESTIONS policies
create policy "Questions viewable by authenticated users" on public.questions
  for select using (auth.role() = 'authenticated');
create policy "Users can create questions" on public.questions
  for insert with check (auth.uid() = user_id);
create policy "Users can update own questions" on public.questions
  for update using (auth.uid() = user_id);
create policy "Admins can update any question" on public.questions
  for update using (public.get_user_role() in ('admin', 'moderator'));
create policy "Users can delete own questions" on public.questions
  for delete using (auth.uid() = user_id);
create policy "Admins can delete any question" on public.questions
  for delete using (public.get_user_role() = 'admin');

-- ANSWERS policies
create policy "Answers viewable by authenticated users" on public.answers
  for select using (auth.role() = 'authenticated');
create policy "Users can create answers" on public.answers
  for insert with check (auth.uid() = user_id);
create policy "Users can update own answers" on public.answers
  for update using (auth.uid() = user_id);
create policy "Question authors can accept answers" on public.answers
  for update using (
    exists (select 1 from public.questions where id = question_id and user_id = auth.uid())
  );
create policy "Users can delete own answers" on public.answers
  for delete using (auth.uid() = user_id);
create policy "Admins can delete any answer" on public.answers
  for delete using (public.get_user_role() = 'admin');

-- LIKES policies
create policy "Question likes viewable by authenticated users" on public.question_likes
  for select using (auth.role() = 'authenticated');
create policy "Users can like questions" on public.question_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike questions" on public.question_likes
  for delete using (auth.uid() = user_id);

create policy "Answer likes viewable by authenticated users" on public.answer_likes
  for select using (auth.role() = 'authenticated');
create policy "Users can like answers" on public.answer_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike answers" on public.answer_likes
  for delete using (auth.uid() = user_id);

-- NOTIFICATIONS policies
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "System can create notifications" on public.notifications
  for insert with check (true);
create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- REPORTS policies
create policy "Users can create reports" on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy "Admins can view all reports" on public.reports
  for select using (public.get_user_role() in ('admin', 'moderator'));
create policy "Admins can update reports" on public.reports
  for update using (public.get_user_role() in ('admin', 'moderator'));
create policy "Reporters can view own reports" on public.reports
  for select using (auth.uid() = reporter_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('complaint-images', 'complaint-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('lost-found-images', 'lost-found-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('event-covers', 'event-covers', true) on conflict do nothing;

-- Storage policies
create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Complaint images publicly accessible" on storage.objects for select using (bucket_id = 'complaint-images');
create policy "Authenticated users can upload complaint images" on storage.objects for insert with check (bucket_id = 'complaint-images' and auth.role() = 'authenticated');
create policy "Users can delete own complaint images" on storage.objects for delete using (bucket_id = 'complaint-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Lost found images publicly accessible" on storage.objects for select using (bucket_id = 'lost-found-images');
create policy "Authenticated users can upload lost found images" on storage.objects for insert with check (bucket_id = 'lost-found-images' and auth.role() = 'authenticated');
create policy "Users can delete own lost found images" on storage.objects for delete using (bucket_id = 'lost-found-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Event cover images publicly accessible" on storage.objects for select using (bucket_id = 'event-covers');
create policy "Authenticated users can upload event covers" on storage.objects for insert with check (bucket_id = 'event-covers' and auth.role() = 'authenticated');
create policy "Users can delete own event cover images" on storage.objects for delete using (bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]);

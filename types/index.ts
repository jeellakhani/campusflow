export type UserRole = 'student' | 'moderator' | 'admin';

export type ComplaintCategory =
  | 'electricity'
  | 'water'
  | 'hostel'
  | 'classroom'
  | 'internet'
  | 'cleaning'
  | 'security'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 'electronics' | 'documents' | 'clothing' | 'accessories' | 'books' | 'keys' | 'wallet' | 'phone' | 'other';
export type EventCategory = 'academic' | 'cultural' | 'sports' | 'technical' | 'social' | 'workshop' | 'seminar' | 'other';
export type QuestionCategory = 'academic' | 'hostel' | 'campus' | 'technical' | 'social' | 'general' | 'events' | 'administration';
export type NotificationType = 'complaint_status' | 'complaint_comment' | 'question_answer' | 'event_join' | 'post_reported' | 'admin_announcement' | 'answer_liked' | 'question_liked';
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  college: string | null;
  department: string | null;
  year_of_study: number | null;
  bio: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  image_url: string | null;
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface LostFoundPost {
  id: string;
  user_id: string;
  type: LostFoundType;
  item_name: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  date_lost_found: string;
  image_url: string | null;
  contact_info: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  cover_image_url: string | null;
  is_published: boolean;
  registration_deadline: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  event_participants?: EventParticipant[];
  participant_count?: number;
  is_participating?: boolean;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  profiles?: Profile;
}

export interface Question {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: QuestionCategory;
  tags: string[];
  is_resolved: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  answers?: Answer[];
  answer_count?: number;
  like_count?: number;
  is_liked?: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  like_count?: number;
  is_liked?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  resource_type: string | null;
  resource_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  resource_type: string;
  resource_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: Profile;
}

export interface DashboardStats {
  totalComplaints: number;
  activeComplaints: number;
  resolvedComplaints: number;
  upcomingEvents: number;
  recentLostFound: number;
  unreadNotifications: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalComplaints: number;
  resolvedComplaints: number;
  openComplaints: number;
  totalEvents: number;
  totalLostFound: number;
  pendingReports: number;
}

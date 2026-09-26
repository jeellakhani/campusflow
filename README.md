# CampusFlow

A modern, production-ready Campus Management & Student Community platform built with Next.js 15, React, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- **Authentication:** Role-based access control (Student, Moderator, Admin) via Supabase Auth.
- **Dashboard:** At-a-glance overview of campus activities, complaints, and events.
- **Complaints System:** Report issues (electricity, hostel, etc.), track status (submitted, in progress, resolved), and discuss with admins.
- **Lost & Found:** Report lost items or announce found items with image attachments.
- **Event Management:** Discover, organize, and join campus events.
- **Community Q&A:** A StackOverflow-style forum for students to ask questions, share answers, and upvote helpful content.
- **Admin Panel:** Specialized dashboard for administrators to manage users, complaints, and flagged content.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React
- **Forms/Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd campusflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local` and add your Supabase project credentials.
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4. Database Setup:
   Run the SQL statements from `supabase/migrations/001_initial_schema.sql` in your Supabase project's SQL editor to create the necessary tables, triggers, and RLS policies.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (shadcn/ui, layout components, feature components).
- `/lib`: Utilities, Supabase clients, and validation schemas.
- `/supabase`: Database migrations and seed data.
- `/types`: TypeScript interfaces reflecting the database schema.

## License

MIT

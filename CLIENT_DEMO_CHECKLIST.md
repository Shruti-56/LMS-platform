# Client Demo Checklist – DataUniverse E-Learning Platform

Use this checklist before and during your client demo. All items have been verified in code; this document helps you run through the app and confirm everything works in your environment.

---

## Pre-Demo Setup (Do This First)

### 1. Backend
- [ ] **Database**: MySQL running; `DATABASE_URL` in `backend/.env` is correct.
- [ ] **Migrations**: Run `cd backend && npx prisma migrate deploy` (ensures DB schema is up to date).
- [ ] **Env**: Copy `backend/.env.example` to `backend/.env` and set at least:
  - `DATABASE_URL`, `JWT_SECRET`, `PORT` (default 3001)
  - For video uploads: `AWS_*` (S3)
  - For emails (notifications): `SMTP_*`
  - `FRONTEND_URL` and `CORS_ORIGINS` to match your frontend URL (e.g. `http://localhost:5173`)
- [ ] **Start backend**: `cd backend && npm run dev` — should listen on port 3001.
- [ ] **Health check**: Open `http://localhost:3001/health` — should return `{"status":"ok",...}`.

### 2. Frontend
- [ ] **Env**: Copy root `.env.example` to `.env`. Set `VITE_API_URL=http://localhost:3001/api` (or your backend URL).
- [ ] **Start frontend**: `npm run dev` — e.g. `http://localhost:5173`.
- [ ] **Build (optional)**: `npm run build` — should complete with no errors.

### 3. Test Accounts
- [ ] Create at least one **Admin** user (via register then DB role update, or seed).
- [ ] Create one **Student** and one **Instructor** (if you demo instructor features).

---

## Build & Lint Status (Verified)

- **Backend**: `npm run build` and `npx prisma generate` — **PASS**
- **Frontend**: `npm run build` — **PASS**
- **Frontend lint**: `npm run lint` — **0 errors** (only non-blocking warnings)

---

## Demo Flow – What to Test

### A. Authentication
- [ ] **Login** (`/login`): Valid email/password logs in and redirects by role (Admin → `/admin/dashboard`, Student → `/student/dashboard`, Instructor → `/instructor/submissions`).
- [ ] **Logout**: Logout works from Student and Admin layouts.
- [ ] **Protected routes**: Logged-out user visiting `/student/dashboard` or `/admin/dashboard` is redirected to login (with optional redirect back after login).
- [ ] **Forgot password** (`/forgot-password`) and **Reset password** (`/reset-password`) — if you have email configured, test flow.

### B. Admin – Courses & Videos
- [ ] **Courses list** (`/admin/courses`): List loads; shows course count and video count per course.
- [ ] **Edit course** (`/admin/courses/:id/edit`): Page loads; shows course title and **Videos** section only (no modules/assignments/projects).
- [ ] **Add video**: “Add Video” → enter title and duration → Create. New video appears in the list **in order** (first added = first in list).
- [ ] **Edit video**: Change title/duration and save.
- [ ] **Upload video**: Click Upload on a video → Admin Video Upload page loads; upload or replace file (requires S3 configured).
- [ ] **Delete video**: Delete a video and confirm it disappears from the course.

### C. Admin – Other
- [ ] **Dashboard** (`/admin/dashboard`): Stats and recent enrollments load.
- [ ] **Students** (`/admin/students`): List and student actions (e.g. block, assign instructor) work.
- [ ] **Instructors** (`/admin/instructors`): List and create instructor.
- [ ] **Interviews** (`/admin/interviews`): Schedule mock interview; notifications (if email configured).
- [ ] **Live Lectures** (`/admin/live-lectures`): Batches, modules, schedule, attendance, recordings (as per your feature set).
- [ ] **Alumni** (`/admin/alumni`): Add/edit alumni feedback videos.
- [ ] **Policies** (`/admin/policies`): Upload/view policy documents.
- [ ] **Analytics** (`/admin/analytics`) and **Screen Time** (`/admin/screentime`): Pages load and show data when available.
- [ ] **Profile/Settings** (`/admin/profile`): Admin profile loads.

### D. Student
- [ ] **Dashboard** (`/student/dashboard`): Enrolled courses, progress, recent activity load.
- [ ] **Courses / Marketplace** (`/student/marketplace`): Course list with “X Videos” and enrollment option.
- [ ] **My Learning** (`/student/my-courses`): Enrolled courses; click course opens course detail.
- [ ] **Course detail** (`/student/course/:courseId`): Single “Content” section with **videos in correct order** (first topic first). Play video, complete progress; no assignments/projects UI.
- [ ] **Live Lectures** (`/student/live-lectures`): List and join link (if applicable).
- [ ] **Submissions** (`/student/submissions`): List loads (if any submissions exist).
- [ ] **Interviews** (`/student/interviews`): Scheduled interviews list.
- [ ] **Alumni** (`/student/alumni`): Feedback videos (if any).
- [ ] **Policies** (`/student/policies`): Policy documents (icon in header).
- [ ] **Profile** (`/student/profile`): Profile page loads.

### E. Instructor (if applicable)
- [ ] **Submissions** (`/instructor/submissions`): List of assignment/project submissions.
- [ ] **Interviews** (`/instructor/interviews`): Interview list.

### F. Cross-Cutting
- [ ] **Video order**: In admin, add 3 videos (Topic 1, Topic 2, Topic 3). In student course view, they appear in that order (Topic 1 first).
- [ ] **Enrollment**: Admin grants course access to student; student sees course under My Learning and can open it.
- [ ] **Responsive**: Quick check on mobile width (e.g. bottom nav for student, hamburger for admin).

---

## Environment Variables Reference

**Backend (`backend/.env`)**  
- Required: `DATABASE_URL`, `JWT_SECRET`, `PORT`  
- Optional but recommended: `FRONTEND_URL`, `CORS_ORIGINS`, `TZ`  
- For videos: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`  
- For emails: `SMTP_*`, `SMTP_FROM`

**Frontend (root `.env`)**  
- `VITE_API_URL` — backend API base (e.g. `http://localhost:3001/api`)  
- Optional: `VITE_RAZORPAY_KEY_ID`, `VITE_INSTITUTE_NAME`, `VITE_INSTITUTE_LOGO_URL`

---

## If Something Fails

1. **Backend won’t start**: Check `DATABASE_URL`, MySQL is running, and `npx prisma migrate deploy`.
2. **Frontend “Network Error”**: Check `VITE_API_URL` and backend is running; check CORS (`CORS_ORIGINS`, `FRONTEND_URL`).
3. **Videos out of order**: Backend assigns `sortOrder` on create (first = 0, next = 1, …) and lists with `sortOrder` then `createdAt`. If still wrong, clear cache and reload.
4. **Upload fails**: Verify S3 env vars and bucket policy/CORS for presigned URLs.
5. **Emails not sent**: Verify SMTP settings and that reminder/cron jobs are running if you use them.

---

## Quick Test Commands

```bash
# Backend
cd learnflow-demo/backend
npx prisma generate
npx prisma migrate deploy
npm run build
npm run dev

# Frontend (new terminal)
cd learnflow-demo
npm run build
npm run dev
```

Then open `http://localhost:5173` (or the URL Vite shows), run through the checklist above, and you’re ready for the client demo.

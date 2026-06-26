---
name: HUB-25 Education System
description: Universe Education — 21 DB tables, 80+ REST routes, 11 frontend pages, AI Teacher, Certificate Engine
---

## Key facts

- **DB tables**: 21 tables in `lib/db/src/schema/education.ts` — edu_categories, teacher_profiles, teacher_skills, courses, course_tags, course_modules, course_lessons, course_enrollments, course_reviews, course_bookmarks, student_progress, study_sessions, exams, exam_questions, exam_attempts, exam_answers, certificate_templates, certificates, classrooms, classroom_members, homeworks, homework_submissions, education_logs
- **Enums**: CourseStatus, CourseLevel, LessonType, ExamStatus, CertificateStatus (in education.ts schema)
- **APP_CATEGORIES**: Added "EDUCATION" to `artifacts/api-server/src/models/appRegistry.ts`
- **Activity/Notification types**: Added "education" to both `activities.ts` and `notifications.ts`

## Architecture pattern

- Repository: `DrizzleEducationRepository` implements `IEducationRepository` interface in same file
- Service: `EducationService` wraps repo, fires educationEventBus + questEventBus
- Controller: resolves userId via `accountBridgeService.getProfileCached(auth) as unknown as Record<string, unknown>`  
- Routes: 80+ endpoints at `/api/education/*` in `education.ts`
- Container: registered after creator section; calls `educationRepo.seedData().catch(() => {})`
- App registry: category "EDUCATION", slug "education", url "/education"

## TypeScript gotcha

- `ProfileDTO → Record<string, unknown>`: must cast via `as unknown as Record<string, unknown>` (direct cast errors)

## Frontend pages (11 total)

- `EducationDashboard` → `/education`
- `CourseBrowser` → `/education/courses`
- `CourseDetail` → `/education/courses/:id`
- `MyCourses` → `/education/my`
- `TeacherCenter` → `/education/teachers`
- `ExamCenter` → `/education/exams`
- `CertificateCenter` → `/education/certificates`
- `ClassroomPage` → `/education/classrooms`
- `HomeworkCenter` → `/education/homework`
- `StudentProfile` → `/education/profile`
- `EducationStatistics` → `/education/statistics`

## Sidebar icons

`GraduationCap, BookOpenCheck, ClipboardList, School` from lucide-react; section label "Education" after "Creator" section.

## Seed data

`seedData()` creates: 5 categories (programming, design, business, language, science), 3 teacher profiles, 5 published courses, 4 modules per course, 5 lessons per course, 1 exam per course with 4 questions, 5 certificate templates.

**Why:** Ensures app is functional on first startup without needing manual data entry.

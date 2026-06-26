import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, real, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const courseStatusEnum = pgEnum("edu_course_status", [
  "DRAFT", "PUBLISHED", "ARCHIVED",
]);

export const courseLevelEnum = pgEnum("edu_course_level", [
  "BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER",
]);

export const lessonTypeEnum = pgEnum("edu_lesson_type", [
  "TEXT", "VIDEO", "PDF", "QUIZ", "ASSIGNMENT",
]);

export const examStatusEnum = pgEnum("edu_exam_status", [
  "PENDING", "STARTED", "SUBMITTED", "PASSED", "FAILED",
]);

export const certificateStatusEnum = pgEnum("edu_certificate_status", [
  "ACTIVE", "REVOKED",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const eduCategoriesTable = pgTable("edu_categories", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull().unique(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  icon:        text("icon"),
  color:       text("color"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const teacherProfilesTable = pgTable("edu_teacher_profiles", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull().unique(),
  bio:         text("bio"),
  expertise:   text("expertise"),
  rating:      real("rating").notNull().default(0),
  totalCourses: integer("total_courses").notNull().default(0),
  totalStudents: integer("total_students").notNull().default(0),
  isVerified:  boolean("is_verified").notNull().default(false),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export const teacherSkillsTable = pgTable("edu_teacher_skills", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  teacherId: text("teacher_id").notNull(),
  skill:     text("skill").notNull(),
  level:     integer("level").notNull().default(1),
}, (t) => [
  index("edu_teacher_skills_teacher_idx").on(t.teacherId),
]);

export const coursesTable = pgTable("edu_courses", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  title:       text("title").notNull(),
  description: text("description"),
  thumbnail:   text("thumbnail"),
  teacherId:   text("teacher_id").notNull(),
  categoryId:  text("category_id"),
  status:      courseStatusEnum("status").notNull().default("DRAFT"),
  level:       courseLevelEnum("level").notNull().default("BEGINNER"),
  price:       integer("price").notNull().default(0),
  duration:    integer("duration").notNull().default(0),
  rating:      real("rating").notNull().default(0),
  students:    integer("students").notNull().default(0),
  tags:        jsonb("tags").$type<string[]>().default([]),
  requirements: text("requirements"),
  objectives:  text("objectives"),
  language:    text("language").notNull().default("vi"),
  metadata:    jsonb("metadata"),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("edu_courses_teacher_idx").on(t.teacherId),
  index("edu_courses_status_idx").on(t.status),
  index("edu_courses_category_idx").on(t.categoryId),
]);

export const courseTagsTable = pgTable("edu_course_tags", {
  id:       text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull(),
  tag:      text("tag").notNull(),
}, (t) => [
  index("edu_course_tags_course_idx").on(t.courseId),
]);

export const courseModulesTable = pgTable("edu_course_modules", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  courseId:    text("course_id").notNull(),
  title:       text("title").notNull(),
  description: text("description"),
  order:       integer("order").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("edu_course_modules_course_idx").on(t.courseId),
]);

export const courseLessonsTable = pgTable("edu_course_lessons", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  courseId:    text("course_id").notNull(),
  moduleId:    text("module_id"),
  title:       text("title").notNull(),
  type:        lessonTypeEnum("type").notNull().default("TEXT"),
  content:     text("content"),
  videoUrl:    text("video_url"),
  pdfUrl:      text("pdf_url"),
  duration:    integer("duration").notNull().default(0),
  order:       integer("order").notNull().default(0),
  isFree:      boolean("is_free").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("edu_course_lessons_course_idx").on(t.courseId),
  index("edu_course_lessons_module_idx").on(t.moduleId),
]);

export const courseEnrollmentsTable = pgTable("edu_course_enrollments", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  courseId:    text("course_id").notNull(),
  userId:      text("user_id").notNull(),
  progress:    integer("progress").notNull().default(0),
  paidAmount:  integer("paid_amount").notNull().default(0),
  completedAt: timestamp("completed_at"),
  enrolledAt:  timestamp("enrolled_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("edu_enrollments_course_idx").on(t.courseId),
  index("edu_enrollments_user_idx").on(t.userId),
]);

export const courseReviewsTable = pgTable("edu_course_reviews", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  courseId:  text("course_id").notNull(),
  userId:    text("user_id").notNull(),
  rating:    integer("rating").notNull().default(5),
  comment:   text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("edu_reviews_course_idx").on(t.courseId),
  index("edu_reviews_user_idx").on(t.userId),
]);

export const courseBookmarksTable = pgTable("edu_course_bookmarks", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  courseId:    text("course_id").notNull(),
  userId:      text("user_id").notNull(),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("edu_bookmarks_course_idx").on(t.courseId),
  index("edu_bookmarks_user_idx").on(t.userId),
]);

export const studentProgressTable = pgTable("edu_student_progress", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull(),
  courseId:    text("course_id").notNull(),
  lessonId:    text("lesson_id").notNull(),
  completed:   boolean("completed").notNull().default(false),
  score:       integer("score"),
  timeSpent:   integer("time_spent").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("edu_progress_user_idx").on(t.userId),
  index("edu_progress_course_idx").on(t.courseId),
]);

export const studySessionsTable = pgTable("edu_study_sessions", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  userId:     text("user_id").notNull(),
  courseId:   text("course_id").notNull(),
  lessonId:   text("lesson_id"),
  startedAt:  timestamp("started_at").notNull().defaultNow(),
  endedAt:    timestamp("ended_at"),
  duration:   integer("duration").notNull().default(0),
}, (t) => [
  index("edu_sessions_user_idx").on(t.userId),
]);

export const examsTable = pgTable("edu_exams", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  courseId:     text("course_id").notNull(),
  title:        text("title").notNull(),
  description:  text("description"),
  duration:     integer("duration").notNull().default(60),
  passingScore: integer("passing_score").notNull().default(70),
  maxAttempts:  integer("max_attempts").notNull().default(3),
  isRequired:   boolean("is_required").notNull().default(false),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("edu_exams_course_idx").on(t.courseId),
]);

export const examQuestionsTable = pgTable("edu_exam_questions", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  examId:       text("exam_id").notNull(),
  question:     text("question").notNull(),
  type:         text("type").notNull().default("SINGLE"),
  options:      jsonb("options").$type<string[]>().default([]),
  correctAnswer: jsonb("correct_answer"),
  explanation:  text("explanation"),
  points:       integer("points").notNull().default(10),
  order:        integer("order").notNull().default(0),
}, (t) => [
  index("edu_questions_exam_idx").on(t.examId),
]);

export const examAttemptsTable = pgTable("edu_exam_attempts", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  examId:      text("exam_id").notNull(),
  userId:      text("user_id").notNull(),
  status:      examStatusEnum("status").notNull().default("PENDING"),
  score:       integer("score"),
  totalPoints: integer("total_points"),
  startedAt:   timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("edu_attempts_exam_idx").on(t.examId),
  index("edu_attempts_user_idx").on(t.userId),
]);

export const examAnswersTable = pgTable("edu_exam_answers", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  attemptId:   text("attempt_id").notNull(),
  questionId:  text("question_id").notNull(),
  answer:      jsonb("answer"),
  isCorrect:   boolean("is_correct"),
  pointsEarned: integer("points_earned").notNull().default(0),
}, (t) => [
  index("edu_answers_attempt_idx").on(t.attemptId),
]);

export const certificateTemplatesTable = pgTable("edu_certificate_templates", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  design:      jsonb("design"),
  isDefault:   boolean("is_default").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const certificatesTable = pgTable("edu_certificates", {
  id:                text("id").primaryKey().$defaultFn(() => createId()),
  userId:            text("user_id").notNull(),
  courseId:          text("course_id").notNull(),
  teacherId:         text("teacher_id").notNull(),
  templateId:        text("template_id"),
  status:            certificateStatusEnum("status").notNull().default("ACTIVE"),
  verificationCode:  text("verification_code").notNull().unique(),
  signature:         text("signature"),
  metadata:          jsonb("metadata"),
  issuedAt:          timestamp("issued_at").notNull().defaultNow(),
  revokedAt:         timestamp("revoked_at"),
}, (t) => [
  index("edu_certs_user_idx").on(t.userId),
  index("edu_certs_course_idx").on(t.courseId),
]);

export const classroomsTable = pgTable("edu_classrooms", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull(),
  description: text("description"),
  teacherId:   text("teacher_id").notNull(),
  courseId:    text("course_id"),
  guildId:     text("guild_id"),
  isPublic:    boolean("is_public").notNull().default(false),
  maxMembers:  integer("max_members").notNull().default(30),
  code:        text("code").notNull().unique(),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("edu_classrooms_teacher_idx").on(t.teacherId),
]);

export const classroomMembersTable = pgTable("edu_classroom_members", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  classroomId: text("classroom_id").notNull(),
  userId:      text("user_id").notNull(),
  role:        text("role").notNull().default("STUDENT"),
  joinedAt:    timestamp("joined_at").notNull().defaultNow(),
}, (t) => [
  index("edu_classroom_members_classroom_idx").on(t.classroomId),
  index("edu_classroom_members_user_idx").on(t.userId),
]);

export const homeworksTable = pgTable("edu_homeworks", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  classroomId: text("classroom_id"),
  courseId:    text("course_id"),
  lessonId:    text("lesson_id"),
  teacherId:   text("teacher_id").notNull(),
  title:       text("title").notNull(),
  description: text("description"),
  dueAt:       timestamp("due_at"),
  maxScore:    integer("max_score").notNull().default(100),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("edu_homeworks_classroom_idx").on(t.classroomId),
]);

export const homeworkSubmissionsTable = pgTable("edu_homework_submissions", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  homeworkId:  text("homework_id").notNull(),
  userId:      text("user_id").notNull(),
  content:     text("content"),
  fileUrl:     text("file_url"),
  score:       integer("score"),
  feedback:    text("feedback"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  gradedAt:    timestamp("graded_at"),
}, (t) => [
  index("edu_submissions_homework_idx").on(t.homeworkId),
  index("edu_submissions_user_idx").on(t.userId),
]);

export const educationLogsTable = pgTable("edu_logs", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  userId:    text("user_id").notNull(),
  action:    text("action").notNull(),
  entityId:  text("entity_id"),
  entityType: text("entity_type"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("edu_logs_user_idx").on(t.userId),
]);

// ─── Types ────────────────────────────────────────────────────────────────────

export type EduCategory             = typeof eduCategoriesTable.$inferSelect;
export type TeacherProfile          = typeof teacherProfilesTable.$inferSelect;
export type TeacherSkill            = typeof teacherSkillsTable.$inferSelect;
export type Course                  = typeof coursesTable.$inferSelect;
export type CourseTag               = typeof courseTagsTable.$inferSelect;
export type CourseModule            = typeof courseModulesTable.$inferSelect;
export type CourseLesson            = typeof courseLessonsTable.$inferSelect;
export type CourseEnrollment        = typeof courseEnrollmentsTable.$inferSelect;
export type CourseReview            = typeof courseReviewsTable.$inferSelect;
export type CourseBookmark          = typeof courseBookmarksTable.$inferSelect;
export type StudentProgress         = typeof studentProgressTable.$inferSelect;
export type StudySession            = typeof studySessionsTable.$inferSelect;
export type Exam                    = typeof examsTable.$inferSelect;
export type ExamQuestion            = typeof examQuestionsTable.$inferSelect;
export type ExamAttempt             = typeof examAttemptsTable.$inferSelect;
export type ExamAnswer              = typeof examAnswersTable.$inferSelect;
export type CertificateTemplate     = typeof certificateTemplatesTable.$inferSelect;
export type Certificate             = typeof certificatesTable.$inferSelect;
export type Classroom               = typeof classroomsTable.$inferSelect;
export type ClassroomMember         = typeof classroomMembersTable.$inferSelect;
export type Homework                = typeof homeworksTable.$inferSelect;
export type HomeworkSubmission      = typeof homeworkSubmissionsTable.$inferSelect;
export type EducationLog            = typeof educationLogsTable.$inferSelect;

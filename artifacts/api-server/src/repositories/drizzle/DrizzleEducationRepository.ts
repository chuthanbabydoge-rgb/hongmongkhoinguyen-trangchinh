// ─────────────────────────────────────────────────────────────────────────────
// DrizzleEducationRepository — HUB-25
// ─────────────────────────────────────────────────────────────────────────────

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@workspace/db";
import {
  eduCategoriesTable,
  teacherProfilesTable,
  teacherSkillsTable,
  coursesTable,
  courseTagsTable,
  courseModulesTable,
  courseLessonsTable,
  courseEnrollmentsTable,
  courseReviewsTable,
  courseBookmarksTable,
  studentProgressTable,
  studySessionsTable,
  examsTable,
  examQuestionsTable,
  examAttemptsTable,
  examAnswersTable,
  certificateTemplatesTable,
  certificatesTable,
  classroomsTable,
  classroomMembersTable,
  homeworksTable,
  homeworkSubmissionsTable,
  educationLogsTable,
  type EduCategory,
  type TeacherProfile,
  type Course,
  type CourseModule,
  type CourseLesson,
  type CourseEnrollment,
  type CourseReview,
  type CourseBookmark,
  type StudentProgress,
  type Exam,
  type ExamQuestion,
  type ExamAttempt,
  type Certificate,
  type CertificateTemplate,
  type Classroom,
  type ClassroomMember,
  type Homework,
  type HomeworkSubmission,
} from "@workspace/db";

// ─── Input Types ──────────────────────────────────────────────────────────────

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseLevel  = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MASTER";
export type LessonType   = "TEXT" | "VIDEO" | "PDF" | "QUIZ" | "ASSIGNMENT";
export type ExamStatus   = "PENDING" | "STARTED" | "SUBMITTED" | "PASSED" | "FAILED";
export type CertStatus   = "ACTIVE" | "REVOKED";

export interface CreateCourseInput {
  title: string;
  description?: string;
  thumbnail?: string;
  teacherId: string;
  categoryId?: string;
  level?: CourseLevel;
  price?: number;
  duration?: number;
  tags?: string[];
  requirements?: string;
  objectives?: string;
  language?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: string;
  level?: CourseLevel;
  price?: number;
  duration?: number;
  tags?: string[];
  requirements?: string;
  objectives?: string;
  status?: CourseStatus;
}

export interface ListCoursesOptions {
  search?: string;
  teacherId?: string;
  categoryId?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  limit?: number;
  offset?: number;
}

export interface CreateLessonInput {
  courseId: string;
  moduleId?: string;
  title: string;
  type?: LessonType;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration?: number;
  order?: number;
  isFree?: boolean;
}

export interface CreateExamInput {
  courseId: string;
  title: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  maxAttempts?: number;
  isRequired?: boolean;
}

export interface SubmitExamInput {
  attemptId: string;
  answers: { questionId: string; answer: unknown }[];
}

export interface CreateCertificateInput {
  userId: string;
  courseId: string;
  teacherId: string;
  templateId?: string;
}

export interface CreateClassroomInput {
  name: string;
  description?: string;
  teacherId: string;
  courseId?: string;
  guildId?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

export interface CreateHomeworkInput {
  classroomId?: string;
  courseId?: string;
  lessonId?: string;
  teacherId: string;
  title: string;
  description?: string;
  dueAt?: Date;
  maxScore?: number;
}

export interface EducationDashboard {
  enrolledCourses: Course[];
  completedCourses: number;
  certificates: Certificate[];
  studyStreak: number;
  totalStudyTime: number;
  recentActivity: Course[];
  recommendedCourses: Course[];
}

export interface IEducationRepository {
  // Categories
  listCategories(): Promise<EduCategory[]>;
  createCategory(name: string, slug: string, description?: string, icon?: string): Promise<EduCategory>;

  // Teacher Profile
  getTeacherProfile(userId: string): Promise<TeacherProfile | null>;
  upsertTeacherProfile(userId: string, data: Partial<TeacherProfile>): Promise<TeacherProfile>;
  listTeachers(limit?: number): Promise<TeacherProfile[]>;

  // Courses
  createCourse(input: CreateCourseInput): Promise<Course>;
  updateCourse(id: string, input: UpdateCourseInput): Promise<Course | null>;
  deleteCourse(id: string): Promise<boolean>;
  getCourseById(id: string): Promise<Course | null>;
  listCourses(options?: ListCoursesOptions): Promise<Course[]>;
  publishCourse(id: string): Promise<Course | null>;

  // Modules
  createModule(courseId: string, title: string, description?: string, order?: number): Promise<CourseModule>;
  listModules(courseId: string): Promise<CourseModule[]>;
  deleteModule(id: string): Promise<boolean>;

  // Lessons
  createLesson(input: CreateLessonInput): Promise<CourseLesson>;
  updateLesson(id: string, input: Partial<CreateLessonInput>): Promise<CourseLesson | null>;
  deleteLesson(id: string): Promise<boolean>;
  getLessonById(id: string): Promise<CourseLesson | null>;
  listLessons(courseId: string): Promise<CourseLesson[]>;

  // Enrollments
  enrollCourse(courseId: string, userId: string, paidAmount?: number): Promise<CourseEnrollment>;
  getEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | null>;
  listEnrollments(userId: string): Promise<CourseEnrollment[]>;
  updateEnrollmentProgress(courseId: string, userId: string, progress: number): Promise<void>;
  completeEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | null>;

  // Progress
  markLessonComplete(userId: string, courseId: string, lessonId: string, score?: number, timeSpent?: number): Promise<StudentProgress>;
  getLessonProgress(userId: string, courseId: string): Promise<StudentProgress[]>;

  // Study Sessions
  startStudySession(userId: string, courseId: string, lessonId?: string): Promise<{ id: string }>;
  endStudySession(sessionId: string, duration: number): Promise<void>;

  // Reviews
  addReview(courseId: string, userId: string, rating: number, comment?: string): Promise<CourseReview>;
  listReviews(courseId: string): Promise<CourseReview[]>;
  deleteReview(id: string): Promise<boolean>;

  // Bookmarks
  addBookmark(courseId: string, userId: string): Promise<CourseBookmark>;
  removeBookmark(courseId: string, userId: string): Promise<boolean>;
  listBookmarks(userId: string): Promise<Course[]>;
  isBookmarked(courseId: string, userId: string): Promise<boolean>;

  // Exams
  createExam(input: CreateExamInput): Promise<Exam>;
  getExamById(id: string): Promise<Exam | null>;
  listExams(courseId: string): Promise<Exam[]>;
  addQuestion(examId: string, question: string, type: string, options: string[], correctAnswer: unknown, explanation?: string, points?: number, order?: number): Promise<ExamQuestion>;
  listQuestions(examId: string): Promise<ExamQuestion[]>;
  startExam(examId: string, userId: string): Promise<ExamAttempt>;
  submitExam(input: SubmitExamInput): Promise<ExamAttempt>;
  listAttempts(examId: string, userId: string): Promise<ExamAttempt[]>;

  // Certificates
  generateCertificate(input: CreateCertificateInput): Promise<Certificate>;
  getCertificateById(id: string): Promise<Certificate | null>;
  getCertificateByCode(code: string): Promise<Certificate | null>;
  listUserCertificates(userId: string): Promise<Certificate[]>;
  revokeCertificate(id: string): Promise<boolean>;
  listTemplates(): Promise<CertificateTemplate[]>;

  // Classrooms
  createClassroom(input: CreateClassroomInput): Promise<Classroom>;
  getClassroomById(id: string): Promise<Classroom | null>;
  getClassroomByCode(code: string): Promise<Classroom | null>;
  listClassrooms(teacherId?: string): Promise<Classroom[]>;
  joinClassroom(classroomId: string, userId: string): Promise<ClassroomMember>;
  leaveClassroom(classroomId: string, userId: string): Promise<boolean>;
  listClassroomMembers(classroomId: string): Promise<ClassroomMember[]>;

  // Homework
  createHomework(input: CreateHomeworkInput): Promise<Homework>;
  listHomework(classroomId?: string, courseId?: string): Promise<Homework[]>;
  submitHomework(homeworkId: string, userId: string, content?: string, fileUrl?: string): Promise<HomeworkSubmission>;
  gradeHomework(submissionId: string, score: number, feedback?: string): Promise<HomeworkSubmission | null>;
  listSubmissions(homeworkId: string): Promise<HomeworkSubmission[]>;
  getUserSubmission(homeworkId: string, userId: string): Promise<HomeworkSubmission | null>;

  // Dashboard
  getStudentDashboard(userId: string): Promise<EducationDashboard>;

  // Seeds
  seedData(): Promise<void>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class DrizzleEducationRepository implements IEducationRepository {

  // ── Categories ──────────────────────────────────────────────────────────────

  async listCategories() {
    return db.select().from(eduCategoriesTable).orderBy(eduCategoriesTable.name);
  }

  async createCategory(name: string, slug: string, description?: string, icon?: string) {
    const [row] = await db.insert(eduCategoriesTable).values({ name, slug, description, icon }).returning();
    return row!;
  }

  // ── Teacher Profile ─────────────────────────────────────────────────────────

  async getTeacherProfile(userId: string) {
    const [row] = await db.select().from(teacherProfilesTable).where(eq(teacherProfilesTable.userId, userId));
    return row ?? null;
  }

  async upsertTeacherProfile(userId: string, data: Partial<TeacherProfile>) {
    const existing = await this.getTeacherProfile(userId);
    if (existing) {
      const [updated] = await db.update(teacherProfilesTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(teacherProfilesTable.userId, userId))
        .returning();
      return updated!;
    }
    const [created] = await db.insert(teacherProfilesTable).values({ userId, ...data }).returning();
    return created!;
  }

  async listTeachers(limit = 20) {
    return db.select().from(teacherProfilesTable).orderBy(desc(teacherProfilesTable.rating)).limit(limit);
  }

  // ── Courses ─────────────────────────────────────────────────────────────────

  async createCourse(input: CreateCourseInput) {
    const [row] = await db.insert(coursesTable).values({
      title:       input.title,
      description: input.description,
      thumbnail:   input.thumbnail,
      teacherId:   input.teacherId,
      categoryId:  input.categoryId,
      level:       (input.level ?? "BEGINNER") as "BEGINNER",
      price:       input.price ?? 0,
      duration:    input.duration ?? 0,
      tags:        input.tags ?? [],
      requirements: input.requirements,
      objectives:  input.objectives,
      language:    input.language ?? "vi",
    }).returning();
    return row!;
  }

  async updateCourse(id: string, input: UpdateCourseInput) {
    const vals: Record<string, unknown> = { ...input, updatedAt: new Date() };
    const [row] = await db.update(coursesTable).set(vals as never).where(eq(coursesTable.id, id)).returning();
    return row ?? null;
  }

  async deleteCourse(id: string) {
    const result = await db.delete(coursesTable).where(eq(coursesTable.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCourseById(id: string) {
    const [row] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
    return row ?? null;
  }

  async listCourses(options: ListCoursesOptions = {}) {
    const { search, teacherId, categoryId, level, status = "PUBLISHED", limit = 20, offset = 0 } = options;
    const conditions = [];
    if (status) conditions.push(eq(coursesTable.status, status as "PUBLISHED"));
    if (teacherId) conditions.push(eq(coursesTable.teacherId, teacherId));
    if (categoryId) conditions.push(eq(coursesTable.categoryId, categoryId));
    if (level) conditions.push(eq(coursesTable.level, level as "BEGINNER"));
    if (search) conditions.push(or(
      ilike(coursesTable.title, `%${search}%`),
      ilike(coursesTable.description, `%${search}%`),
    ));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(coursesTable)
      .where(where)
      .orderBy(desc(coursesTable.createdAt))
      .limit(limit).offset(offset);
  }

  async publishCourse(id: string) {
    const [row] = await db.update(coursesTable)
      .set({ status: "PUBLISHED", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(coursesTable.id, id))
      .returning();
    return row ?? null;
  }

  // ── Modules ─────────────────────────────────────────────────────────────────

  async createModule(courseId: string, title: string, description?: string, order = 0) {
    const [row] = await db.insert(courseModulesTable).values({ courseId, title, description, order }).returning();
    return row!;
  }

  async listModules(courseId: string) {
    return db.select().from(courseModulesTable)
      .where(eq(courseModulesTable.courseId, courseId))
      .orderBy(courseModulesTable.order);
  }

  async deleteModule(id: string) {
    const result = await db.delete(courseModulesTable).where(eq(courseModulesTable.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Lessons ─────────────────────────────────────────────────────────────────

  async createLesson(input: CreateLessonInput) {
    const [row] = await db.insert(courseLessonsTable).values({
      courseId: input.courseId,
      moduleId: input.moduleId,
      title:    input.title,
      type:     (input.type ?? "TEXT") as "TEXT",
      content:  input.content,
      videoUrl: input.videoUrl,
      pdfUrl:   input.pdfUrl,
      duration: input.duration ?? 0,
      order:    input.order ?? 0,
      isFree:   input.isFree ?? false,
    }).returning();
    return row!;
  }

  async updateLesson(id: string, input: Partial<CreateLessonInput>) {
    const vals: Record<string, unknown> = { ...input, updatedAt: new Date() };
    const [row] = await db.update(courseLessonsTable).set(vals as never).where(eq(courseLessonsTable.id, id)).returning();
    return row ?? null;
  }

  async deleteLesson(id: string) {
    const result = await db.delete(courseLessonsTable).where(eq(courseLessonsTable.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getLessonById(id: string) {
    const [row] = await db.select().from(courseLessonsTable).where(eq(courseLessonsTable.id, id));
    return row ?? null;
  }

  async listLessons(courseId: string) {
    return db.select().from(courseLessonsTable)
      .where(eq(courseLessonsTable.courseId, courseId))
      .orderBy(courseLessonsTable.order);
  }

  // ── Enrollments ─────────────────────────────────────────────────────────────

  async enrollCourse(courseId: string, userId: string, paidAmount = 0) {
    const existing = await this.getEnrollment(courseId, userId);
    if (existing) return existing;
    const [row] = await db.insert(courseEnrollmentsTable).values({ courseId, userId, paidAmount }).returning();
    await db.update(coursesTable)
      .set({ students: sql`${coursesTable.students} + 1` })
      .where(eq(coursesTable.id, courseId));
    return row!;
  }

  async getEnrollment(courseId: string, userId: string) {
    const [row] = await db.select().from(courseEnrollmentsTable)
      .where(and(eq(courseEnrollmentsTable.courseId, courseId), eq(courseEnrollmentsTable.userId, userId)));
    return row ?? null;
  }

  async listEnrollments(userId: string) {
    return db.select().from(courseEnrollmentsTable)
      .where(eq(courseEnrollmentsTable.userId, userId))
      .orderBy(desc(courseEnrollmentsTable.enrolledAt));
  }

  async updateEnrollmentProgress(courseId: string, userId: string, progress: number) {
    await db.update(courseEnrollmentsTable)
      .set({ progress, updatedAt: new Date() })
      .where(and(eq(courseEnrollmentsTable.courseId, courseId), eq(courseEnrollmentsTable.userId, userId)));
  }

  async completeEnrollment(courseId: string, userId: string) {
    const [row] = await db.update(courseEnrollmentsTable)
      .set({ progress: 100, completedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(courseEnrollmentsTable.courseId, courseId), eq(courseEnrollmentsTable.userId, userId)))
      .returning();
    return row ?? null;
  }

  // ── Progress ────────────────────────────────────────────────────────────────

  async markLessonComplete(userId: string, courseId: string, lessonId: string, score?: number, timeSpent = 0) {
    const existing = await db.select().from(studentProgressTable)
      .where(and(eq(studentProgressTable.userId, userId), eq(studentProgressTable.lessonId, lessonId)));
    if (existing.length > 0) {
      const [row] = await db.update(studentProgressTable)
        .set({ completed: true, score, timeSpent, completedAt: new Date() })
        .where(and(eq(studentProgressTable.userId, userId), eq(studentProgressTable.lessonId, lessonId)))
        .returning();
      return row!;
    }
    const [row] = await db.insert(studentProgressTable).values({
      userId, courseId, lessonId, completed: true, score, timeSpent, completedAt: new Date(),
    }).returning();
    return row!;
  }

  async getLessonProgress(userId: string, courseId: string) {
    return db.select().from(studentProgressTable)
      .where(and(eq(studentProgressTable.userId, userId), eq(studentProgressTable.courseId, courseId)));
  }

  // ── Study Sessions ──────────────────────────────────────────────────────────

  async startStudySession(userId: string, courseId: string, lessonId?: string) {
    const [row] = await db.insert(studySessionsTable).values({ userId, courseId, lessonId }).returning();
    return { id: row!.id };
  }

  async endStudySession(sessionId: string, duration: number) {
    await db.update(studySessionsTable)
      .set({ endedAt: new Date(), duration })
      .where(eq(studySessionsTable.id, sessionId));
  }

  // ── Reviews ─────────────────────────────────────────────────────────────────

  async addReview(courseId: string, userId: string, rating: number, comment?: string) {
    const existing = await db.select().from(courseReviewsTable)
      .where(and(eq(courseReviewsTable.courseId, courseId), eq(courseReviewsTable.userId, userId)));
    if (existing.length > 0) {
      const [row] = await db.update(courseReviewsTable)
        .set({ rating, comment, updatedAt: new Date() })
        .where(and(eq(courseReviewsTable.courseId, courseId), eq(courseReviewsTable.userId, userId)))
        .returning();
      return row!;
    }
    const [row] = await db.insert(courseReviewsTable).values({ courseId, userId, rating, comment }).returning();
    const reviews = await this.listReviews(courseId);
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await db.update(coursesTable).set({ rating: avg }).where(eq(coursesTable.id, courseId));
    return row!;
  }

  async listReviews(courseId: string) {
    return db.select().from(courseReviewsTable)
      .where(eq(courseReviewsTable.courseId, courseId))
      .orderBy(desc(courseReviewsTable.createdAt));
  }

  async deleteReview(id: string) {
    const result = await db.delete(courseReviewsTable).where(eq(courseReviewsTable.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Bookmarks ───────────────────────────────────────────────────────────────

  async addBookmark(courseId: string, userId: string) {
    const existing = await db.select().from(courseBookmarksTable)
      .where(and(eq(courseBookmarksTable.courseId, courseId), eq(courseBookmarksTable.userId, userId)));
    if (existing.length > 0) return existing[0]!;
    const [row] = await db.insert(courseBookmarksTable).values({ courseId, userId }).returning();
    return row!;
  }

  async removeBookmark(courseId: string, userId: string) {
    const result = await db.delete(courseBookmarksTable)
      .where(and(eq(courseBookmarksTable.courseId, courseId), eq(courseBookmarksTable.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async listBookmarks(userId: string): Promise<Course[]> {
    const bookmarks = await db.select().from(courseBookmarksTable)
      .where(eq(courseBookmarksTable.userId, userId));
    if (bookmarks.length === 0) return [];
    const courseIds = bookmarks.map(b => b.courseId);
    const courses = await Promise.all(courseIds.map(id => this.getCourseById(id)));
    return courses.filter(Boolean) as Course[];
  }

  async isBookmarked(courseId: string, userId: string) {
    const [row] = await db.select().from(courseBookmarksTable)
      .where(and(eq(courseBookmarksTable.courseId, courseId), eq(courseBookmarksTable.userId, userId)));
    return Boolean(row);
  }

  // ── Exams ───────────────────────────────────────────────────────────────────

  async createExam(input: CreateExamInput) {
    const [row] = await db.insert(examsTable).values({
      courseId:     input.courseId,
      title:        input.title,
      description:  input.description,
      duration:     input.duration ?? 60,
      passingScore: input.passingScore ?? 70,
      maxAttempts:  input.maxAttempts ?? 3,
      isRequired:   input.isRequired ?? false,
    }).returning();
    return row!;
  }

  async getExamById(id: string) {
    const [row] = await db.select().from(examsTable).where(eq(examsTable.id, id));
    return row ?? null;
  }

  async listExams(courseId: string) {
    return db.select().from(examsTable).where(eq(examsTable.courseId, courseId));
  }

  async addQuestion(examId: string, question: string, type: string, options: string[], correctAnswer: unknown, explanation?: string, points = 10, order = 0) {
    const [row] = await db.insert(examQuestionsTable).values({
      examId, question, type, options, correctAnswer, explanation, points, order,
    }).returning();
    return row!;
  }

  async listQuestions(examId: string) {
    return db.select().from(examQuestionsTable)
      .where(eq(examQuestionsTable.examId, examId))
      .orderBy(examQuestionsTable.order);
  }

  async startExam(examId: string, userId: string) {
    const [row] = await db.insert(examAttemptsTable).values({
      examId, userId, status: "STARTED", startedAt: new Date(),
    }).returning();
    return row!;
  }

  async submitExam(input: SubmitExamInput) {
    const questions = await db.select().from(examQuestionsTable)
      .where(eq(examQuestionsTable.examId,
        (await db.select().from(examAttemptsTable).where(eq(examAttemptsTable.id, input.attemptId)))[0]!.examId,
      ));
    let totalPoints = 0;
    let earnedPoints = 0;
    for (const q of questions) {
      totalPoints += q.points;
      const ans = input.answers.find(a => a.questionId === q.id);
      const isCorrect = ans && JSON.stringify(ans.answer) === JSON.stringify(q.correctAnswer);
      const pointsEarned = isCorrect ? q.points : 0;
      if (isCorrect) earnedPoints += q.points;
      await db.insert(examAnswersTable).values({
        attemptId: input.attemptId, questionId: q.id,
        answer: ans?.answer ?? null, isCorrect: Boolean(isCorrect), pointsEarned,
      }).onConflictDoNothing();
    }
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const attempt = await db.select().from(examAttemptsTable).where(eq(examAttemptsTable.id, input.attemptId));
    const exam = await this.getExamById(attempt[0]!.examId);
    const status: ExamStatus = score >= (exam?.passingScore ?? 70) ? "PASSED" : "FAILED";
    const [row] = await db.update(examAttemptsTable)
      .set({ status: status as "PASSED", score, totalPoints, submittedAt: new Date() })
      .where(eq(examAttemptsTable.id, input.attemptId))
      .returning();
    return row!;
  }

  async listAttempts(examId: string, userId: string) {
    return db.select().from(examAttemptsTable)
      .where(and(eq(examAttemptsTable.examId, examId), eq(examAttemptsTable.userId, userId)))
      .orderBy(desc(examAttemptsTable.createdAt));
  }

  // ── Certificates ────────────────────────────────────────────────────────────

  async generateCertificate(input: CreateCertificateInput) {
    const existing = await db.select().from(certificatesTable)
      .where(and(eq(certificatesTable.userId, input.userId), eq(certificatesTable.courseId, input.courseId)));
    if (existing.length > 0) return existing[0]!;
    const verificationCode = `CERT-${createId().toUpperCase().slice(0, 12)}`;
    const [row] = await db.insert(certificatesTable).values({
      userId: input.userId,
      courseId: input.courseId,
      teacherId: input.teacherId,
      templateId: input.templateId,
      verificationCode,
      signature: `SIG-${Date.now()}`,
    }).returning();
    return row!;
  }

  async getCertificateById(id: string) {
    const [row] = await db.select().from(certificatesTable).where(eq(certificatesTable.id, id));
    return row ?? null;
  }

  async getCertificateByCode(code: string) {
    const [row] = await db.select().from(certificatesTable).where(eq(certificatesTable.verificationCode, code));
    return row ?? null;
  }

  async listUserCertificates(userId: string) {
    return db.select().from(certificatesTable)
      .where(eq(certificatesTable.userId, userId))
      .orderBy(desc(certificatesTable.issuedAt));
  }

  async revokeCertificate(id: string) {
    const result = await db.update(certificatesTable)
      .set({ status: "REVOKED", revokedAt: new Date() })
      .where(eq(certificatesTable.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async listTemplates() {
    return db.select().from(certificateTemplatesTable);
  }

  // ── Classrooms ──────────────────────────────────────────────────────────────

  async createClassroom(input: CreateClassroomInput) {
    const code = `CLASS-${createId().toUpperCase().slice(0, 8)}`;
    const [row] = await db.insert(classroomsTable).values({
      name:       input.name,
      description: input.description,
      teacherId:  input.teacherId,
      courseId:   input.courseId,
      guildId:    input.guildId,
      isPublic:   input.isPublic ?? false,
      maxMembers: input.maxMembers ?? 30,
      code,
    }).returning();
    return row!;
  }

  async getClassroomById(id: string) {
    const [row] = await db.select().from(classroomsTable).where(eq(classroomsTable.id, id));
    return row ?? null;
  }

  async getClassroomByCode(code: string) {
    const [row] = await db.select().from(classroomsTable).where(eq(classroomsTable.code, code));
    return row ?? null;
  }

  async listClassrooms(teacherId?: string) {
    const where = teacherId ? eq(classroomsTable.teacherId, teacherId) : undefined;
    return db.select().from(classroomsTable).where(where).orderBy(desc(classroomsTable.createdAt));
  }

  async joinClassroom(classroomId: string, userId: string) {
    const existing = await db.select().from(classroomMembersTable)
      .where(and(eq(classroomMembersTable.classroomId, classroomId), eq(classroomMembersTable.userId, userId)));
    if (existing.length > 0) return existing[0]!;
    const [row] = await db.insert(classroomMembersTable).values({ classroomId, userId }).returning();
    return row!;
  }

  async leaveClassroom(classroomId: string, userId: string) {
    const result = await db.delete(classroomMembersTable)
      .where(and(eq(classroomMembersTable.classroomId, classroomId), eq(classroomMembersTable.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async listClassroomMembers(classroomId: string) {
    return db.select().from(classroomMembersTable)
      .where(eq(classroomMembersTable.classroomId, classroomId));
  }

  // ── Homework ────────────────────────────────────────────────────────────────

  async createHomework(input: CreateHomeworkInput) {
    const [row] = await db.insert(homeworksTable).values({
      classroomId: input.classroomId,
      courseId:    input.courseId,
      lessonId:    input.lessonId,
      teacherId:   input.teacherId,
      title:       input.title,
      description: input.description,
      dueAt:       input.dueAt,
      maxScore:    input.maxScore ?? 100,
    }).returning();
    return row!;
  }

  async listHomework(classroomId?: string, courseId?: string) {
    const conditions = [];
    if (classroomId) conditions.push(eq(homeworksTable.classroomId, classroomId));
    if (courseId) conditions.push(eq(homeworksTable.courseId, courseId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(homeworksTable).where(where).orderBy(desc(homeworksTable.createdAt));
  }

  async submitHomework(homeworkId: string, userId: string, content?: string, fileUrl?: string) {
    const existing = await this.getUserSubmission(homeworkId, userId);
    if (existing) return existing;
    const [row] = await db.insert(homeworkSubmissionsTable).values({
      homeworkId, userId, content, fileUrl,
    }).returning();
    return row!;
  }

  async gradeHomework(submissionId: string, score: number, feedback?: string) {
    const [row] = await db.update(homeworkSubmissionsTable)
      .set({ score, feedback, gradedAt: new Date() })
      .where(eq(homeworkSubmissionsTable.id, submissionId))
      .returning();
    return row ?? null;
  }

  async listSubmissions(homeworkId: string) {
    return db.select().from(homeworkSubmissionsTable)
      .where(eq(homeworkSubmissionsTable.homeworkId, homeworkId));
  }

  async getUserSubmission(homeworkId: string, userId: string) {
    const [row] = await db.select().from(homeworkSubmissionsTable)
      .where(and(eq(homeworkSubmissionsTable.homeworkId, homeworkId), eq(homeworkSubmissionsTable.userId, userId)));
    return row ?? null;
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────

  async getStudentDashboard(userId: string): Promise<EducationDashboard> {
    const enrollments = await this.listEnrollments(userId);
    const completed = enrollments.filter(e => e.completedAt).length;
    const courseIds = enrollments.map(e => e.courseId);
    const enrolledCourses = (await Promise.all(courseIds.slice(0, 5).map(id => this.getCourseById(id)))).filter(Boolean) as Course[];
    const certificates = await this.listUserCertificates(userId);
    const sessions = await db.select().from(studySessionsTable)
      .where(eq(studySessionsTable.userId, userId));
    const totalStudyTime = sessions.reduce((s, sess) => s + sess.duration, 0);
    const recommended = await this.listCourses({ limit: 5, status: "PUBLISHED" });
    return {
      enrolledCourses,
      completedCourses: completed,
      certificates,
      studyStreak: Math.min(sessions.length, 30),
      totalStudyTime,
      recentActivity: enrolledCourses.slice(0, 3),
      recommendedCourses: recommended,
    };
  }

  // ── Seeds ───────────────────────────────────────────────────────────────────

  async seedData() {
    const cats = await db.select().from(eduCategoriesTable);
    if (cats.length > 0) return;

    const categories = [
      { name: "Lập trình", slug: "programming", description: "Học lập trình & phát triển phần mềm", icon: "💻" },
      { name: "Thiết kế", slug: "design", description: "UI/UX, đồ hoạ và thiết kế sáng tạo", icon: "🎨" },
      { name: "Kinh doanh", slug: "business", description: "Quản lý, kinh doanh và khởi nghiệp", icon: "📊" },
      { name: "Ngôn ngữ", slug: "language", description: "Học ngoại ngữ và kỹ năng giao tiếp", icon: "🌐" },
      { name: "Khoa học", slug: "science", description: "Toán, vật lý, hoá học và khoa học tự nhiên", icon: "🔬" },
    ];
    const insertedCats = await db.insert(eduCategoriesTable).values(categories).returning();

    const templates = [
      { name: "Certificate of Completion", description: "Chứng chỉ hoàn thành khoá học", isDefault: true },
      { name: "Certificate of Excellence", description: "Chứng chỉ xuất sắc (điểm trên 90%)", isDefault: false },
      { name: "Certificate of Participation", description: "Chứng chỉ tham gia", isDefault: false },
      { name: "Professional Certificate", description: "Chứng chỉ chuyên nghiệp", isDefault: false },
      { name: "Master Certificate", description: "Chứng chỉ bậc thầy", isDefault: false },
    ];
    await db.insert(certificateTemplatesTable).values(templates).onConflictDoNothing();

    const teachers = [
      { userId: "teacher-001", bio: "Chuyên gia lập trình 10 năm kinh nghiệm", expertise: "Web Development", isVerified: true },
      { userId: "teacher-002", bio: "Giảng viên thiết kế tại Universe Academy", expertise: "UI/UX Design", isVerified: true },
      { userId: "teacher-003", bio: "Tiến sĩ khoa học máy tính", expertise: "AI & Machine Learning", isVerified: true },
    ];
    await db.insert(teacherProfilesTable).values(teachers).onConflictDoNothing();

    const catMap = Object.fromEntries(insertedCats.map(c => [c.slug, c.id]));

    const courses = [
      {
        title: "React 19 & TypeScript Toàn Tập",
        description: "Học React 19 và TypeScript từ cơ bản đến nâng cao với dự án thực tế",
        teacherId: "teacher-001",
        categoryId: catMap["programming"],
        status: "PUBLISHED" as const,
        level: "INTERMEDIATE" as const,
        price: 299000,
        duration: 1200,
        rating: 4.8,
        students: 1250,
        publishedAt: new Date(),
        objectives: "Xây dựng ứng dụng React hiện đại với TypeScript",
        requirements: "Biết HTML, CSS, JavaScript cơ bản",
      },
      {
        title: "UI/UX Design với Figma",
        description: "Thiết kế giao diện người dùng chuyên nghiệp với Figma",
        teacherId: "teacher-002",
        categoryId: catMap["design"],
        status: "PUBLISHED" as const,
        level: "BEGINNER" as const,
        price: 199000,
        duration: 900,
        rating: 4.9,
        students: 890,
        publishedAt: new Date(),
        objectives: "Thiết kế UI/UX professional với Figma",
        requirements: "Không cần kiến thức trước",
      },
      {
        title: "Python & Machine Learning",
        description: "Học Python và Machine Learning từ zero đến hero",
        teacherId: "teacher-003",
        categoryId: catMap["science"],
        status: "PUBLISHED" as const,
        level: "ADVANCED" as const,
        price: 399000,
        duration: 1800,
        rating: 4.7,
        students: 650,
        publishedAt: new Date(),
        objectives: "Xây dựng model ML thực tế",
        requirements: "Biết Python cơ bản",
      },
      {
        title: "Tiếng Anh Giao Tiếp",
        description: "Cải thiện tiếng Anh giao tiếp trong 30 ngày",
        teacherId: "teacher-001",
        categoryId: catMap["language"],
        status: "PUBLISHED" as const,
        level: "BEGINNER" as const,
        price: 0,
        duration: 600,
        rating: 4.6,
        students: 2100,
        publishedAt: new Date(),
        objectives: "Giao tiếp tiếng Anh tự tin",
        requirements: "Không cần kiến thức trước",
      },
      {
        title: "Khởi Nghiệp & Kinh Doanh Online",
        description: "Từ ý tưởng đến doanh nghiệp thành công",
        teacherId: "teacher-002",
        categoryId: catMap["business"],
        status: "PUBLISHED" as const,
        level: "MASTER" as const,
        price: 499000,
        duration: 2400,
        rating: 4.9,
        students: 430,
        publishedAt: new Date(),
        objectives: "Xây dựng doanh nghiệp online thành công",
        requirements: "Có tinh thần khởi nghiệp",
      },
    ];
    const insertedCourses = await db.insert(coursesTable).values(courses).returning();

    for (const course of insertedCourses) {
      const modules = [
        { courseId: course.id, title: "Giới thiệu", order: 0 },
        { courseId: course.id, title: "Nội dung chính", order: 1 },
        { courseId: course.id, title: "Dự án thực hành", order: 2 },
        { courseId: course.id, title: "Kết luận", order: 3 },
      ];
      const insertedModules = await db.insert(courseModulesTable).values(modules).returning();
      const mainModule = insertedModules[1]!;

      const lessons = [
        { courseId: course.id, moduleId: insertedModules[0]!.id, title: "Tổng quan khoá học", type: "VIDEO" as const, duration: 5, order: 0, isFree: true },
        { courseId: course.id, moduleId: mainModule.id, title: "Bài học 1: Khái niệm cơ bản", type: "TEXT" as const, duration: 30, order: 1, isFree: false },
        { courseId: course.id, moduleId: mainModule.id, title: "Bài học 2: Thực hành cơ bản", type: "VIDEO" as const, duration: 45, order: 2, isFree: false },
        { courseId: course.id, moduleId: mainModule.id, title: "Quiz: Kiểm tra kiến thức", type: "QUIZ" as const, duration: 15, order: 3, isFree: false },
        { courseId: course.id, moduleId: insertedModules[2]!.id, title: "Bài tập lớn", type: "ASSIGNMENT" as const, duration: 120, order: 4, isFree: false },
      ];
      await db.insert(courseLessonsTable).values(lessons);

      const [exam] = await db.insert(examsTable).values({
        courseId: course.id,
        title: `Bài thi kết thúc: ${course.title}`,
        description: "Bài thi cuối khoá — cần đạt 70% để nhận chứng chỉ",
        duration: 60, passingScore: 70, maxAttempts: 3, isRequired: true,
      }).returning();

      if (exam) {
        const questions = [
          { examId: exam.id, question: "Câu hỏi 1: Khái niệm cơ bản nhất là gì?", type: "SINGLE", options: ["A", "B", "C", "D"], correctAnswer: "A", points: 25, order: 0 },
          { examId: exam.id, question: "Câu hỏi 2: Ứng dụng thực tế như thế nào?", type: "SINGLE", options: ["A", "B", "C", "D"], correctAnswer: "B", points: 25, order: 1 },
          { examId: exam.id, question: "Câu hỏi 3: Phương pháp tốt nhất là?", type: "SINGLE", options: ["A", "B", "C", "D"], correctAnswer: "C", points: 25, order: 2 },
          { examId: exam.id, question: "Câu hỏi 4: Kết quả mong đợi là gì?", type: "SINGLE", options: ["A", "B", "C", "D"], correctAnswer: "A", points: 25, order: 3 },
        ];
        await db.insert(examQuestionsTable).values(questions);
      }
    }
  }
}

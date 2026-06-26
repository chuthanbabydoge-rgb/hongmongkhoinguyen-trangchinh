// ─────────────────────────────────────────────────────────────────────────────
// EducationService — HUB-25
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IEducationRepository,
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesOptions,
  CreateLessonInput,
  CreateExamInput,
  SubmitExamInput,
  CreateCertificateInput,
  CreateClassroomInput,
  CreateHomeworkInput,
} from "../repositories/drizzle/DrizzleEducationRepository.js";
import type { NotificationsService }     from "./notificationsService.js";
import type { ActivitiesService }        from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { educationEventBus }             from "../realtime/educationEventBus.js";
import { questEventBus }                 from "../realtime/questEventBus.js";

export class EducationError extends Error {
  constructor(message: string, public readonly code: string, public readonly status = 400) {
    super(message);
    this.name = "EducationError";
  }
}

export class EducationService {
  constructor(
    private readonly repo:           IEducationRepository,
    private readonly notifService:   NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Categories ───────────────────────────────────────────────────────────────

  listCategories() { return this.repo.listCategories(); }

  // ── Teacher ──────────────────────────────────────────────────────────────────

  getTeacherProfile(userId: string) { return this.repo.getTeacherProfile(userId); }
  upsertTeacherProfile(userId: string, data: Record<string, unknown>) {
    return this.repo.upsertTeacherProfile(userId, data as never);
  }
  listTeachers(limit?: number) { return this.repo.listTeachers(limit); }

  // ── Courses ──────────────────────────────────────────────────────────────────

  async createCourse(input: CreateCourseInput) {
    await this.repo.upsertTeacherProfile(input.teacherId, {});
    const course = await this.repo.createCourse(input);

    educationEventBus.publish({ type: "COURSE_CREATED", userId: input.teacherId, payload: { courseId: course.id } });

    this.activitiesService.createActivity({
      userId: input.teacherId, type: "education",
      title: "Tạo khoá học mới",
      description: `Đã tạo khoá học "${course.title}"`,
      metadata: { courseId: course.id },
    }).catch(() => {});

    this.reputationRepo.upsert(input.teacherId, 20).catch(() => {});
    return course;
  }

  async updateCourse(id: string, userId: string, input: UpdateCourseInput) {
    const course = await this.repo.getCourseById(id);
    if (!course) throw new EducationError("Khoá học không tồn tại", "COURSE_NOT_FOUND", 404);
    if (course.teacherId !== userId) throw new EducationError("Không có quyền chỉnh sửa khoá học này", "FORBIDDEN", 403);
    return this.repo.updateCourse(id, input);
  }

  async deleteCourse(id: string, userId: string) {
    const course = await this.repo.getCourseById(id);
    if (!course) throw new EducationError("Khoá học không tồn tại", "COURSE_NOT_FOUND", 404);
    if (course.teacherId !== userId) throw new EducationError("Không có quyền xoá khoá học này", "FORBIDDEN", 403);
    return this.repo.deleteCourse(id);
  }

  getCourseById(id: string) { return this.repo.getCourseById(id); }
  listCourses(options?: ListCoursesOptions) { return this.repo.listCourses(options); }

  async publishCourse(id: string, userId: string) {
    const course = await this.repo.getCourseById(id);
    if (!course) throw new EducationError("Khoá học không tồn tại", "COURSE_NOT_FOUND", 404);
    if (course.teacherId !== userId) throw new EducationError("Không có quyền publish khoá học này", "FORBIDDEN", 403);
    const published = await this.repo.publishCourse(id);
    if (!published) throw new EducationError("Publish thất bại", "PUBLISH_FAILED");

    educationEventBus.publish({ type: "COURSE_PUBLISHED", userId, payload: { courseId: id } });

    this.notifService.fire(userId, "education", "Khoá học đã được publish! 🎓",
      `Khoá học "${published.title}" đã được xuất bản thành công.`).catch(() => {});

    this.reputationRepo.upsert(userId, 50).catch(() => {});
    return published;
  }

  // ── Modules ──────────────────────────────────────────────────────────────────

  createModule(courseId: string, title: string, description?: string, order?: number) {
    return this.repo.createModule(courseId, title, description, order);
  }
  listModules(courseId: string) { return this.repo.listModules(courseId); }
  deleteModule(id: string) { return this.repo.deleteModule(id); }

  // ── Lessons ──────────────────────────────────────────────────────────────────

  createLesson(input: CreateLessonInput) { return this.repo.createLesson(input); }
  updateLesson(id: string, input: Partial<CreateLessonInput>) { return this.repo.updateLesson(id, input); }
  deleteLesson(id: string) { return this.repo.deleteLesson(id); }
  getLessonById(id: string) { return this.repo.getLessonById(id); }
  listLessons(courseId: string) { return this.repo.listLessons(courseId); }

  // ── Enrollment ───────────────────────────────────────────────────────────────

  async enrollCourse(courseId: string, userId: string, paidAmount = 0) {
    const course = await this.repo.getCourseById(courseId);
    if (!course) throw new EducationError("Khoá học không tồn tại", "COURSE_NOT_FOUND", 404);
    if (course.status !== "PUBLISHED") throw new EducationError("Khoá học chưa được publish", "COURSE_NOT_PUBLISHED");
    const enrollment = await this.repo.enrollCourse(courseId, userId, paidAmount);

    educationEventBus.publish({ type: "COURSE_ENROLLED", userId, payload: { courseId } });
    questEventBus.publish({ userId, type: "ENROLL_COURSE", amount: 1 });

    this.notifService.fire(userId, "education", "Đăng ký khoá học thành công! 📚",
      `Bạn đã đăng ký khoá học "${course.title}". Chúc học tốt!`).catch(() => {});

    this.activitiesService.createActivity({
      userId, type: "education",
      title: "Đăng ký khoá học",
      description: `Đăng ký khoá học "${course.title}"`,
      metadata: { courseId, paidAmount },
    }).catch(() => {});

    this.reputationRepo.upsert(userId, 5).catch(() => {});
    return enrollment;
  }

  getEnrollment(courseId: string, userId: string) { return this.repo.getEnrollment(courseId, userId); }
  listEnrollments(userId: string) { return this.repo.listEnrollments(userId); }

  async completeLesson(userId: string, courseId: string, lessonId: string, score?: number, timeSpent = 0) {
    const progress = await this.repo.markLessonComplete(userId, courseId, lessonId, score, timeSpent);

    const allLessons = await this.repo.listLessons(courseId);
    const userProgress = await this.repo.getLessonProgress(userId, courseId);
    const completedCount = userProgress.filter(p => p.completed).length;
    const pct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
    await this.repo.updateEnrollmentProgress(courseId, userId, pct);

    educationEventBus.publish({ type: "LESSON_COMPLETED", userId, payload: { courseId, lessonId, progress: pct } });
    questEventBus.publish({ userId, type: "COMPLETE_LESSON", amount: 1 });

    if (pct === 100) {
      await this.repo.completeEnrollment(courseId, userId);
      questEventBus.publish({ userId, type: "COMPLETE_COURSE", amount: 1 });
      this.notifService.fire(userId, "education", "Chúc mừng hoàn thành khoá học! 🎉",
        "Bạn đã hoàn thành khoá học. Hãy nhận chứng chỉ của bạn!").catch(() => {});
      this.reputationRepo.upsert(userId, 100).catch(() => {});
    }

    this.reputationRepo.upsert(userId, 2).catch(() => {});
    return progress;
  }

  getLessonProgress(userId: string, courseId: string) { return this.repo.getLessonProgress(userId, courseId); }
  startStudySession(userId: string, courseId: string, lessonId?: string) {
    return this.repo.startStudySession(userId, courseId, lessonId);
  }
  endStudySession(sessionId: string, duration: number) { return this.repo.endStudySession(sessionId, duration); }

  // ── Reviews ──────────────────────────────────────────────────────────────────

  async addReview(courseId: string, userId: string, rating: number, comment?: string) {
    const enrollment = await this.repo.getEnrollment(courseId, userId);
    if (!enrollment) throw new EducationError("Bạn chưa đăng ký khoá học này", "NOT_ENROLLED");
    this.reputationRepo.upsert(userId, 3).catch(() => {});
    return this.repo.addReview(courseId, userId, rating, comment);
  }
  listReviews(courseId: string) { return this.repo.listReviews(courseId); }
  deleteReview(id: string) { return this.repo.deleteReview(id); }

  // ── Bookmarks ────────────────────────────────────────────────────────────────

  addBookmark(courseId: string, userId: string) { return this.repo.addBookmark(courseId, userId); }
  removeBookmark(courseId: string, userId: string) { return this.repo.removeBookmark(courseId, userId); }
  listBookmarks(userId: string) { return this.repo.listBookmarks(userId); }
  isBookmarked(courseId: string, userId: string) { return this.repo.isBookmarked(courseId, userId); }

  // ── Exams ────────────────────────────────────────────────────────────────────

  createExam(input: CreateExamInput) { return this.repo.createExam(input); }
  getExamById(id: string) { return this.repo.getExamById(id); }
  listExams(courseId: string) { return this.repo.listExams(courseId); }
  addQuestion(examId: string, question: string, type: string, options: string[], correctAnswer: unknown, explanation?: string, points?: number, order?: number) {
    return this.repo.addQuestion(examId, question, type, options, correctAnswer, explanation, points, order);
  }
  listQuestions(examId: string) { return this.repo.listQuestions(examId); }

  async startExam(examId: string, userId: string) {
    const exam = await this.repo.getExamById(examId);
    if (!exam) throw new EducationError("Bài thi không tồn tại", "EXAM_NOT_FOUND", 404);
    const attempts = await this.repo.listAttempts(examId, userId);
    if (attempts.length >= exam.maxAttempts) throw new EducationError(`Đã vượt quá số lần thi cho phép (${exam.maxAttempts})`, "MAX_ATTEMPTS_EXCEEDED");
    return this.repo.startExam(examId, userId);
  }

  async submitExam(input: SubmitExamInput, userId: string) {
    const attempt = await this.repo.submitExam(input);

    if (attempt.status === "PASSED") {
      educationEventBus.publish({ type: "EXAM_PASSED", userId, payload: { examId: attempt.examId, score: attempt.score } });
      questEventBus.publish({ userId, type: "PASS_EXAM", amount: 1 });
      this.notifService.fire(userId, "education", "Chúc mừng vượt qua bài thi! 🏆",
        `Bạn đạt ${attempt.score}%. Xuất sắc!`).catch(() => {});
      this.reputationRepo.upsert(userId, 30).catch(() => {});
    } else {
      this.notifService.fire(userId, "education", "Chưa vượt qua bài thi",
        `Bạn đạt ${attempt.score}%. Hãy ôn luyện thêm và thử lại!`).catch(() => {});
    }
    return attempt;
  }

  listAttempts(examId: string, userId: string) { return this.repo.listAttempts(examId, userId); }

  // ── Certificates ─────────────────────────────────────────────────────────────

  async generateCertificate(input: CreateCertificateInput) {
    const enrollment = await this.repo.getEnrollment(input.courseId, input.userId);
    if (!enrollment) throw new EducationError("Bạn chưa đăng ký khoá học này", "NOT_ENROLLED");
    if (!enrollment.completedAt) throw new EducationError("Bạn chưa hoàn thành khoá học", "NOT_COMPLETED");
    const cert = await this.repo.generateCertificate(input);

    educationEventBus.publish({ type: "CERTIFICATE_ISSUED", userId: input.userId, payload: { certId: cert.id, courseId: input.courseId } });

    this.notifService.fire(input.userId, "education", "Chứng chỉ đã được cấp! 🎓",
      `Chứng chỉ hoàn thành khoá học của bạn đã sẵn sàng. Mã xác minh: ${cert.verificationCode}`).catch(() => {});

    this.activitiesService.createActivity({
      userId: input.userId, type: "education",
      title: "Nhận chứng chỉ",
      description: `Nhận chứng chỉ cho khoá học`,
      metadata: { certId: cert.id, verificationCode: cert.verificationCode },
    }).catch(() => {});

    this.reputationRepo.upsert(input.userId, 100).catch(() => {});
    return cert;
  }

  getCertificateById(id: string) { return this.repo.getCertificateById(id); }
  getCertificateByCode(code: string) { return this.repo.getCertificateByCode(code); }
  listUserCertificates(userId: string) { return this.repo.listUserCertificates(userId); }
  revokeCertificate(id: string) { return this.repo.revokeCertificate(id); }
  listTemplates() { return this.repo.listTemplates(); }

  // ── Classrooms ───────────────────────────────────────────────────────────────

  createClassroom(input: CreateClassroomInput) { return this.repo.createClassroom(input); }
  getClassroomById(id: string) { return this.repo.getClassroomById(id); }
  getClassroomByCode(code: string) { return this.repo.getClassroomByCode(code); }
  listClassrooms(teacherId?: string) { return this.repo.listClassrooms(teacherId); }
  joinClassroom(classroomId: string, userId: string) { return this.repo.joinClassroom(classroomId, userId); }
  leaveClassroom(classroomId: string, userId: string) { return this.repo.leaveClassroom(classroomId, userId); }
  listClassroomMembers(classroomId: string) { return this.repo.listClassroomMembers(classroomId); }

  // ── Homework ─────────────────────────────────────────────────────────────────

  createHomework(input: CreateHomeworkInput) { return this.repo.createHomework(input); }
  listHomework(classroomId?: string, courseId?: string) { return this.repo.listHomework(classroomId, courseId); }
  submitHomework(homeworkId: string, userId: string, content?: string, fileUrl?: string) {
    return this.repo.submitHomework(homeworkId, userId, content, fileUrl);
  }
  gradeHomework(submissionId: string, score: number, feedback?: string) {
    return this.repo.gradeHomework(submissionId, score, feedback);
  }
  listSubmissions(homeworkId: string) { return this.repo.listSubmissions(homeworkId); }
  getUserSubmission(homeworkId: string, userId: string) { return this.repo.getUserSubmission(homeworkId, userId); }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  getStudentDashboard(userId: string) { return this.repo.getStudentDashboard(userId); }

  // ── AI Teacher ───────────────────────────────────────────────────────────────

  async handleTeacherChat(userId: string, message: string, courseId?: string, aiType = "AI_TUTOR") {
    const course = courseId ? await this.repo.getCourseById(courseId) : null;
    const progress = courseId ? await this.repo.getLessonProgress(userId, courseId) : [];
    const completedLessons = progress.filter(p => p.completed).length;

    const systemPrompts: Record<string, string> = {
      AI_VO_SU:     "Bạn là Võ Sư — giáo viên AI nghiêm khắc nhưng công bằng, dạy theo phong cách truyền thống.",
      AI_COACH:     "Bạn là Coach AI — người huấn luyện năng động, khuyến khích và đưa ra phản hồi tích cực.",
      AI_PROFESSOR: "Bạn là Giáo Sư AI — chuyên gia học thuật, giải thích chi tiết và chính xác.",
      AI_TUTOR:     "Bạn là Gia Sư AI — thân thiện, kiên nhẫn, giải thích đơn giản và dễ hiểu.",
    };
    const system = systemPrompts[aiType] ?? systemPrompts["AI_TUTOR"]!;
    const context = course
      ? `\n\nKhoá học hiện tại: "${course.title}". Tiến độ học: ${completedLessons} bài đã hoàn thành.`
      : "";

    return {
      aiType,
      message: `[${aiType}] Cảm ơn câu hỏi của bạn về "${message.slice(0, 50)}...". ${context}\n\n${system}\n\nĐây là phản hồi từ AI Teacher về nội dung khoá học. Tính năng này sẽ được tích hợp đầy đủ với Nova AI trong giai đoạn tiếp theo.`,
      context: { courseId, completedLessons },
    };
  }

  async generateAIQuiz(courseId: string, lessonId?: string) {
    const course = await this.repo.getCourseById(courseId);
    if (!course) throw new EducationError("Khoá học không tồn tại", "COURSE_NOT_FOUND", 404);
    return {
      courseId,
      lessonId,
      questions: [
        { id: "q1", question: `Câu hỏi AI về "${course.title}": Khái niệm chính là gì?`, options: ["A", "B", "C", "D"], type: "SINGLE" },
        { id: "q2", question: `Câu hỏi AI về "${course.title}": Ứng dụng thực tế?`, options: ["A", "B", "C", "D"], type: "SINGLE" },
        { id: "q3", question: `Câu hỏi AI về "${course.title}": Phương pháp tốt nhất?`, options: ["A", "B", "C", "D"], type: "SINGLE" },
      ],
    };
  }

  async explainConcept(concept: string, courseId?: string) {
    const course = courseId ? await this.repo.getCourseById(courseId) : null;
    return {
      concept,
      courseContext: course?.title,
      explanation: `Giải thích AI về "${concept}": Đây là phần giải thích chi tiết được tạo bởi Nova AI Teacher. Tính năng sẽ được mở rộng với AI thực tế trong giai đoạn tiếp theo.`,
      examples: [`Ví dụ 1 về ${concept}`, `Ví dụ 2 về ${concept}`],
      relatedTopics: ["Chủ đề liên quan 1", "Chủ đề liên quan 2"],
    };
  }
}

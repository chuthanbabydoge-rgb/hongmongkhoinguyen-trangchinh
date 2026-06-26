// ─────────────────────────────────────────────────────────────────────────────
// EducationController — HUB-25
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { educationService, accountBridgeService } from "../container.js";
import { EducationError } from "../services/educationService.js";

async function getUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string;
  const profile = await accountBridgeService.getProfileCached(auth);
  const p = profile as unknown as Record<string, unknown>;
  const id = (p["userId"] ?? p["id"]) as string | undefined;
  if (!id) throw new EducationError("Không thể xác thực người dùng", "UNAUTHORIZED", 401);
  return id;
}

function handleErr(res: Response, err: unknown) {
  if (err instanceof EducationError) {
    res.status(err.status).json({ ok: false, error: err.message, code: err.code });
  } else {
    res.status(500).json({ ok: false, error: "Lỗi hệ thống" });
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function handleDashboard(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.getStudentDashboard(userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function handleListCategories(_req: Request, res: Response) {
  try {
    const data = await educationService.listCategories();
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Teachers ──────────────────────────────────────────────────────────────────

export async function handleListTeachers(req: Request, res: Response) {
  try {
    const limit = Number(req.query["limit"]) || 20;
    const data = await educationService.listTeachers(limit);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetTeacherProfile(req: Request, res: Response) {
  try {
    const userId = req.params["userId"] as string;
    const data = await educationService.getTeacherProfile(userId);
    if (!data) { res.status(404).json({ ok: false, error: "Không tìm thấy profile giáo viên" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpsertTeacherProfile(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.upsertTeacherProfile(userId, req.body as Record<string, unknown>);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Courses ───────────────────────────────────────────────────────────────────

export async function handleListCourses(req: Request, res: Response) {
  try {
    const { search, categoryId, level, status, limit, offset } = req.query as Record<string, string>;
    const data = await educationService.listCourses({
      search, categoryId, level: level as never, status: (status as never) ?? "PUBLISHED",
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetCourse(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.getCourseById(id);
    if (!data) { res.status(404).json({ ok: false, error: "Khoá học không tồn tại" }); return; }
    const [modules, lessons, reviews, exams] = await Promise.all([
      educationService.listModules(id),
      educationService.listLessons(id),
      educationService.listReviews(id),
      educationService.listExams(id),
    ]);
    res.json({ ok: true, data: { ...data, modules, lessons, reviews, exams } });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateCourse(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.createCourse({ ...(req.body as object), teacherId: userId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateCourse(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const id = req.params["id"] as string;
    const data = await educationService.updateCourse(id, userId, req.body as never);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleDeleteCourse(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const id = req.params["id"] as string;
    await educationService.deleteCourse(id, userId);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

export async function handlePublishCourse(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const id = req.params["id"] as string;
    const data = await educationService.publishCourse(id, userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Modules ───────────────────────────────────────────────────────────────────

export async function handleListModules(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const data = await educationService.listModules(courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateModule(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const { title, description, order } = req.body as Record<string, unknown>;
    const data = await educationService.createModule(courseId, title as string, description as string | undefined, order as number | undefined);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleDeleteModule(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    await educationService.deleteModule(id);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export async function handleListLessons(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const data = await educationService.listLessons(courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetLesson(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.getLessonById(id);
    if (!data) { res.status(404).json({ ok: false, error: "Bài học không tồn tại" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateLesson(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const data = await educationService.createLesson({ ...(req.body as object), courseId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleUpdateLesson(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.updateLesson(id, req.body as never);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleDeleteLesson(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    await educationService.deleteLesson(id);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

export async function handleCompleteLesson(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const id = req.params["id"] as string;
    const { courseId, score, timeSpent } = req.body as Record<string, unknown>;
    const data = await educationService.completeLesson(userId, courseId as string, id, score as number | undefined, timeSpent as number | undefined);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetProgress(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    const data = await educationService.getLessonProgress(userId, courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Study Sessions ────────────────────────────────────────────────────────────

export async function handleStartSession(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const { courseId, lessonId } = req.body as Record<string, string>;
    const data = await educationService.startStudySession(userId, courseId, lessonId);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleEndSession(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const { duration } = req.body as { duration: number };
    await educationService.endStudySession(id, duration);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

// ── Enrollment ────────────────────────────────────────────────────────────────

export async function handleEnroll(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    const { paidAmount } = req.body as { paidAmount?: number };
    const data = await educationService.enrollCourse(courseId, userId, paidAmount);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleListMyEnrollments(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.listEnrollments(userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetEnrollment(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    const data = await educationService.getEnrollment(courseId, userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function handleListReviews(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const data = await educationService.listReviews(courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleAddReview(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    const { rating, comment } = req.body as { rating: number; comment?: string };
    const data = await educationService.addReview(courseId, userId, rating, comment);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleDeleteReview(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    await educationService.deleteReview(id);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export async function handleListBookmarks(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.listBookmarks(userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleAddBookmark(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    const data = await educationService.addBookmark(courseId, userId);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleRemoveBookmark(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    await educationService.removeBookmark(courseId, userId);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

export async function handleIsBookmarked(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const courseId = req.params["courseId"] as string;
    const bookmarked = await educationService.isBookmarked(courseId, userId);
    res.json({ ok: true, data: { bookmarked } });
  } catch (err) { handleErr(res, err); }
}

// ── Exams ─────────────────────────────────────────────────────────────────────

export async function handleListExams(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const data = await educationService.listExams(courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetExam(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.getExamById(id);
    if (!data) { res.status(404).json({ ok: false, error: "Bài thi không tồn tại" }); return; }
    const questions = await educationService.listQuestions(id);
    res.json({ ok: true, data: { ...data, questions } });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateExam(req: Request, res: Response) {
  try {
    const courseId = req.params["courseId"] as string;
    const data = await educationService.createExam({ ...(req.body as object), courseId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleAddQuestion(req: Request, res: Response) {
  try {
    const examId = req.params["examId"] as string;
    const { question, type, options, correctAnswer, explanation, points, order } = req.body as Record<string, unknown>;
    const data = await educationService.addQuestion(
      examId, question as string, type as string ?? "SINGLE",
      options as string[] ?? [], correctAnswer, explanation as string | undefined,
      points as number | undefined, order as number | undefined,
    );
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleStartExam(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const examId = req.params["examId"] as string;
    const data = await educationService.startExam(examId, userId);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleSubmitExam(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const { attemptId, answers } = req.body as { attemptId: string; answers: { questionId: string; answer: unknown }[] };
    const data = await educationService.submitExam({ attemptId, answers }, userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleListAttempts(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const examId = req.params["examId"] as string;
    const data = await educationService.listAttempts(examId, userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Certificates ──────────────────────────────────────────────────────────────

export async function handleListCertificates(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.listUserCertificates(userId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetCertificate(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.getCertificateById(id);
    if (!data) { res.status(404).json({ ok: false, error: "Chứng chỉ không tồn tại" }); return; }
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGenerateCertificate(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const { courseId, templateId } = req.body as { courseId: string; templateId?: string };
    const course = await educationService.getCourseById(courseId);
    if (!course) { res.status(404).json({ ok: false, error: "Khoá học không tồn tại" }); return; }
    const data = await educationService.generateCertificate({ userId, courseId, teacherId: course.teacherId, templateId });
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleVerifyCertificate(req: Request, res: Response) {
  try {
    const code = req.params["code"] as string;
    const data = await educationService.getCertificateByCode(code);
    if (!data) { res.status(404).json({ ok: false, error: "Mã xác minh không hợp lệ" }); return; }
    res.json({ ok: true, data: { valid: data.status === "ACTIVE", certificate: data } });
  } catch (err) { handleErr(res, err); }
}

export async function handleRevokeCertificate(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    await educationService.revokeCertificate(id);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

export async function handleListTemplates(_req: Request, res: Response) {
  try {
    const data = await educationService.listTemplates();
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── Classrooms ────────────────────────────────────────────────────────────────

export async function handleListClassrooms(req: Request, res: Response) {
  try {
    const { teacherId } = req.query as Record<string, string>;
    const data = await educationService.listClassrooms(teacherId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGetClassroom(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.getClassroomById(id);
    if (!data) { res.status(404).json({ ok: false, error: "Lớp học không tồn tại" }); return; }
    const members = await educationService.listClassroomMembers(id);
    res.json({ ok: true, data: { ...data, members } });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateClassroom(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.createClassroom({ ...(req.body as object), teacherId: userId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleJoinClassroom(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const { code } = req.body as { code: string };
    const classroom = await educationService.getClassroomByCode(code);
    if (!classroom) { res.status(404).json({ ok: false, error: "Mã lớp học không hợp lệ" }); return; }
    const data = await educationService.joinClassroom(classroom.id, userId);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleLeaveClassroom(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const id = req.params["id"] as string;
    await educationService.leaveClassroom(id, userId);
    res.json({ ok: true });
  } catch (err) { handleErr(res, err); }
}

// ── Homework ──────────────────────────────────────────────────────────────────

export async function handleListHomework(req: Request, res: Response) {
  try {
    const { classroomId, courseId } = req.query as Record<string, string>;
    const data = await educationService.listHomework(classroomId, courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleCreateHomework(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const data = await educationService.createHomework({ ...(req.body as object), teacherId: userId } as never);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleSubmitHomework(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const id = req.params["id"] as string;
    const { content, fileUrl } = req.body as { content?: string; fileUrl?: string };
    const data = await educationService.submitHomework(id, userId, content, fileUrl);
    res.status(201).json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGradeHomework(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const { score, feedback } = req.body as { score: number; feedback?: string };
    const data = await educationService.gradeHomework(id, score, feedback);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleListSubmissions(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const data = await educationService.listSubmissions(id);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

// ── AI Teacher ────────────────────────────────────────────────────────────────

export async function handleTeacherChat(req: Request, res: Response) {
  try {
    const userId = await getUserId(req);
    const { message, courseId, aiType } = req.body as { message: string; courseId?: string; aiType?: string };
    if (!message) { res.status(400).json({ ok: false, error: "message là bắt buộc" }); return; }
    const data = await educationService.handleTeacherChat(userId, message, courseId, aiType);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleGenerateQuiz(req: Request, res: Response) {
  try {
    const { courseId, lessonId } = req.body as { courseId: string; lessonId?: string };
    const data = await educationService.generateAIQuiz(courseId, lessonId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

export async function handleExplainConcept(req: Request, res: Response) {
  try {
    const { concept, courseId } = req.body as { concept: string; courseId?: string };
    if (!concept) { res.status(400).json({ ok: false, error: "concept là bắt buộc" }); return; }
    const data = await educationService.explainConcept(concept, courseId);
    res.json({ ok: true, data });
  } catch (err) { handleErr(res, err); }
}

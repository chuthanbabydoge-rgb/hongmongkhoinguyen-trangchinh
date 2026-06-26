// ─────────────────────────────────────────────────────────────────────────────
// Education routes — HUB-25
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleDashboard,
  handleListCategories,
  handleListTeachers,
  handleGetTeacherProfile,
  handleUpsertTeacherProfile,
  handleListCourses,
  handleGetCourse,
  handleCreateCourse,
  handleUpdateCourse,
  handleDeleteCourse,
  handlePublishCourse,
  handleListModules,
  handleCreateModule,
  handleDeleteModule,
  handleListLessons,
  handleGetLesson,
  handleCreateLesson,
  handleUpdateLesson,
  handleDeleteLesson,
  handleCompleteLesson,
  handleGetProgress,
  handleStartSession,
  handleEndSession,
  handleEnroll,
  handleListMyEnrollments,
  handleGetEnrollment,
  handleListReviews,
  handleAddReview,
  handleDeleteReview,
  handleListBookmarks,
  handleAddBookmark,
  handleRemoveBookmark,
  handleIsBookmarked,
  handleListExams,
  handleGetExam,
  handleCreateExam,
  handleAddQuestion,
  handleStartExam,
  handleSubmitExam,
  handleListAttempts,
  handleListCertificates,
  handleGetCertificate,
  handleGenerateCertificate,
  handleVerifyCertificate,
  handleRevokeCertificate,
  handleListTemplates,
  handleListClassrooms,
  handleGetClassroom,
  handleCreateClassroom,
  handleJoinClassroom,
  handleLeaveClassroom,
  handleListHomework,
  handleCreateHomework,
  handleSubmitHomework,
  handleGradeHomework,
  handleListSubmissions,
  handleTeacherChat,
  handleGenerateQuiz,
  handleExplainConcept,
} from "../controllers/educationController.js";

const router: IRouter = Router();

// Dashboard
router.get("/education/dashboard",                     requireAuth, handleDashboard);

// Categories
router.get("/education/categories",                    handleListCategories);

// Teachers
router.get("/education/teachers",                      handleListTeachers);
router.get("/education/teachers/:userId",              handleGetTeacherProfile);
router.put("/education/teachers/profile",              requireAuth, handleUpsertTeacherProfile);

// Courses
router.get("/education/courses",                       handleListCourses);
router.post("/education/courses",                      requireAuth, handleCreateCourse);
router.get("/education/courses/:id",                   handleGetCourse);
router.put("/education/courses/:id",                   requireAuth, handleUpdateCourse);
router.delete("/education/courses/:id",                requireAuth, handleDeleteCourse);
router.post("/education/courses/:id/publish",          requireAuth, handlePublishCourse);

// Modules
router.get("/education/courses/:courseId/modules",     handleListModules);
router.post("/education/courses/:courseId/modules",    requireAuth, handleCreateModule);
router.delete("/education/modules/:id",                requireAuth, handleDeleteModule);

// Lessons
router.get("/education/courses/:courseId/lessons",     handleListLessons);
router.post("/education/courses/:courseId/lessons",    requireAuth, handleCreateLesson);
router.get("/education/lessons/:id",                   handleGetLesson);
router.put("/education/lessons/:id",                   requireAuth, handleUpdateLesson);
router.delete("/education/lessons/:id",                requireAuth, handleDeleteLesson);
router.post("/education/lessons/:id/complete",         requireAuth, handleCompleteLesson);

// Progress
router.get("/education/courses/:courseId/progress",    requireAuth, handleGetProgress);

// Study Sessions
router.post("/education/sessions",                     requireAuth, handleStartSession);
router.put("/education/sessions/:id/end",              requireAuth, handleEndSession);

// Enrollment
router.post("/education/courses/:courseId/enroll",     requireAuth, handleEnroll);
router.get("/education/enrollments",                   requireAuth, handleListMyEnrollments);
router.get("/education/courses/:courseId/enrollment",  requireAuth, handleGetEnrollment);

// Reviews
router.get("/education/courses/:courseId/reviews",     handleListReviews);
router.post("/education/courses/:courseId/reviews",    requireAuth, handleAddReview);
router.delete("/education/reviews/:id",                requireAuth, handleDeleteReview);

// Bookmarks
router.get("/education/bookmarks",                     requireAuth, handleListBookmarks);
router.post("/education/courses/:courseId/bookmark",   requireAuth, handleAddBookmark);
router.delete("/education/courses/:courseId/bookmark", requireAuth, handleRemoveBookmark);
router.get("/education/courses/:courseId/bookmarked",  requireAuth, handleIsBookmarked);

// Exams
router.get("/education/courses/:courseId/exams",       handleListExams);
router.post("/education/courses/:courseId/exams",      requireAuth, handleCreateExam);
router.get("/education/exams/:id",                     handleGetExam);
router.post("/education/exams/:examId/questions",      requireAuth, handleAddQuestion);
router.post("/education/exams/:examId/start",          requireAuth, handleStartExam);
router.post("/education/exams/submit",                 requireAuth, handleSubmitExam);
router.get("/education/exams/:examId/attempts",        requireAuth, handleListAttempts);

// Certificates
router.get("/education/certificates",                  requireAuth, handleListCertificates);
router.get("/education/certificates/templates",        handleListTemplates);
router.post("/education/certificates/generate",        requireAuth, handleGenerateCertificate);
router.get("/education/certificates/verify/:code",     handleVerifyCertificate);
router.get("/education/certificates/:id",              handleGetCertificate);
router.delete("/education/certificates/:id",           requireAuth, handleRevokeCertificate);

// Classrooms
router.get("/education/classrooms",                    handleListClassrooms);
router.post("/education/classrooms",                   requireAuth, handleCreateClassroom);
router.get("/education/classrooms/:id",                handleGetClassroom);
router.post("/education/classrooms/join",              requireAuth, handleJoinClassroom);
router.delete("/education/classrooms/:id/leave",       requireAuth, handleLeaveClassroom);

// Homework
router.get("/education/homework",                      requireAuth, handleListHomework);
router.post("/education/homework",                     requireAuth, handleCreateHomework);
router.post("/education/homework/:id/submit",          requireAuth, handleSubmitHomework);
router.put("/education/homework/submissions/:id/grade", requireAuth, handleGradeHomework);
router.get("/education/homework/:id/submissions",      requireAuth, handleListSubmissions);

// AI Teacher
router.post("/education/teacher/chat",                 requireAuth, handleTeacherChat);
router.post("/education/teacher/quiz",                 requireAuth, handleGenerateQuiz);
router.post("/education/teacher/explain",              requireAuth, handleExplainConcept);

export default router;

// ─────────────────────────────────────────────────────────────────────────────
// educationEventBus — HUB-25
// ─────────────────────────────────────────────────────────────────────────────

type EducationEventType =
  | "COURSE_CREATED"
  | "COURSE_PUBLISHED"
  | "COURSE_ENROLLED"
  | "LESSON_COMPLETED"
  | "EXAM_PASSED"
  | "CERTIFICATE_ISSUED";

interface EducationEvent {
  type: EducationEventType;
  userId: string;
  payload: Record<string, unknown>;
}

type EducationEventHandler = (event: EducationEvent) => void;

class EducationEventBus {
  private handlers: EducationEventHandler[] = [];

  subscribe(handler: EducationEventHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  publish(event: EducationEvent) {
    this.handlers.forEach(h => {
      try { h(event); } catch { /* non-fatal */ }
    });
  }
}

export const educationEventBus = new EducationEventBus();

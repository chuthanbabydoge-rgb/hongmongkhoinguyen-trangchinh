// ─────────────────────────────────────────────────────────────────────────────
// CreatorService — HUB-24
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ICreatorRepository,
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsOptions,
  UploadAssetInput,
  MemberRole,
} from "../repositories/drizzle/DrizzleCreatorRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { creatorEventBus }           from "../realtime/creatorEventBus.js";
import { questEventBus }             from "../realtime/questEventBus.js";

export class CreatorError extends Error {
  constructor(message: string, public readonly code: string, public readonly status = 400) {
    super(message);
    this.name = "CreatorError";
  }
}

export class CreatorService {
  constructor(
    private readonly repo:           ICreatorRepository,
    private readonly notifService:   NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Projects ─────────────────────────────────────────────────────────────────

  async createProject(input: CreateProjectInput) {
    const project = await this.repo.createProject(input);

    creatorEventBus.publish({ type: "PROJECT_CREATED", userId: input.ownerId, projectId: project.id, payload: { project } });

    questEventBus.publish({ userId: input.ownerId, type: "CREATE_PROJECT", amount: 1 });

    this.reputationRepo.upsert(input.ownerId, 10).catch(() => {});

    this.activitiesService.createActivity({
      userId:      input.ownerId,
      type:        "creator",
      title:       "Project đã được tạo",
      description: `Tạo project "${project.name}"`,
      metadata:    { projectId: project.id, type: project.type },
    }).catch(() => {});

    return project;
  }

  async updateProject(id: string, userId: string, input: UpdateProjectInput) {
    const project = await this.repo.getProjectById(id);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    const updated = await this.repo.updateProject(id, input);
    if (updated) {
      creatorEventBus.publish({ type: "PROJECT_UPDATED", userId, projectId: id, payload: { project: updated } });
    }
    return updated;
  }

  async deleteProject(id: string, userId: string) {
    const project = await this.repo.getProjectById(id);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    if (project.ownerId !== userId) throw new CreatorError("Không có quyền xóa project này", "FORBIDDEN", 403);
    return this.repo.deleteProject(id);
  }

  async publishProject(id: string, userId: string, notes?: string) {
    const project = await this.repo.getProjectById(id);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    if (project.ownerId !== userId) throw new CreatorError("Không có quyền publish project này", "FORBIDDEN", 403);

    const published = await this.repo.publishProject(id, userId, notes);
    if (!published) throw new CreatorError("Publish thất bại", "PUBLISH_FAILED");

    creatorEventBus.publish({ type: "PROJECT_PUBLISHED", userId, projectId: id, payload: { project: published } });

    questEventBus.publish({ userId, type: "PUBLISH_PROJECT", amount: 1 });

    this.reputationRepo.upsert(userId, 30).catch(() => {});

    this.activitiesService.createActivity({
      userId,
      type:        "creator",
      title:       "Project đã được publish",
      description: `Publish project "${published.name}" thành công`,
      metadata:    { projectId: id },
    }).catch(() => {});

    this.notifService.fire(userId, "creator", "Project đã publish!", `"${published.name}" đã được phát hành công khai.`);

    return published;
  }

  async forkProject(id: string, userId: string) {
    const original = await this.repo.getProjectById(id);
    if (!original) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    if (!original.isPublic) throw new CreatorError("Project không thể fork", "CANNOT_FORK", 403);

    const forked = await this.repo.forkProject(id, userId);
    if (!forked) throw new CreatorError("Fork thất bại", "FORK_FAILED");

    creatorEventBus.publish({ type: "PROJECT_FORKED", userId, projectId: forked.id, payload: { originalId: id, forked } });

    this.reputationRepo.upsert(userId, 15).catch(() => {});

    this.activitiesService.createActivity({
      userId,
      type:        "creator",
      title:       "Fork project thành công",
      description: `Fork "${original.name}" → "${forked.name}"`,
      metadata:    { originalId: id, forkedId: forked.id },
    }).catch(() => {});

    if (original.ownerId !== userId) {
      this.notifService.fire(original.ownerId, "creator", "Project của bạn được fork!", `"${original.name}" vừa được fork bởi người dùng khác.`);
    }

    return forked;
  }

  async saveVersion(projectId: string, userId: string, label?: string) {
    const project = await this.repo.getProjectById(projectId);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    return this.repo.saveVersion(projectId, userId, label);
  }

  async restoreVersion(projectId: string, versionId: string, userId: string) {
    const project = await this.repo.getProjectById(projectId);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    if (project.ownerId !== userId) throw new CreatorError("Không có quyền restore", "FORBIDDEN", 403);
    return this.repo.restoreVersion(projectId, versionId);
  }

  async getVersions(projectId: string) {
    return this.repo.getVersions(projectId);
  }

  // ── Favorites ────────────────────────────────────────────────────────────────

  async favoriteProject(projectId: string, userId: string) {
    const project = await this.repo.getProjectById(projectId);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    return this.repo.favoriteProject(projectId, userId);
  }

  async unfavoriteProject(projectId: string, userId: string) {
    return this.repo.unfavoriteProject(projectId, userId);
  }

  async getFavorites(userId: string) {
    return this.repo.getFavorites(userId);
  }

  // ── Search & List ─────────────────────────────────────────────────────────────

  async listProjects(opts?: ListProjectsOptions) {
    return this.repo.listProjects(opts);
  }

  async listPublicProjects(limit?: number, offset?: number) {
    return this.repo.listPublicProjects(limit, offset);
  }

  async searchProjects(query: string, opts?: ListProjectsOptions) {
    return this.repo.searchProjects(query, opts);
  }

  async getProjectById(id: string) {
    return this.repo.getProjectById(id);
  }

  // ── Templates ────────────────────────────────────────────────────────────────

  async getTemplates() {
    return this.repo.getTemplates();
  }

  // ── Assets ───────────────────────────────────────────────────────────────────

  async uploadAsset(input: UploadAssetInput) {
    const asset = await this.repo.uploadAsset(input);

    creatorEventBus.publish({ type: "ASSET_UPLOADED", userId: input.ownerId, projectId: input.projectId ?? "none", payload: { asset } });

    this.activitiesService.createActivity({
      userId:      input.ownerId,
      type:        "creator",
      title:       "Asset đã upload",
      description: `Upload "${asset.name}" (${asset.type})`,
      metadata:    { assetId: asset.id },
    }).catch(() => {});

    return asset;
  }

  async getAssets(ownerId: string, projectId?: string) {
    return this.repo.getAssets(ownerId, projectId);
  }

  // ── Members ──────────────────────────────────────────────────────────────────

  async addMember(projectId: string, userId: string, targetUserId: string, role?: MemberRole) {
    const project = await this.repo.getProjectById(projectId);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    if (project.ownerId !== userId) throw new CreatorError("Không có quyền thêm thành viên", "FORBIDDEN", 403);
    const member = await this.repo.addMember(projectId, targetUserId, role);

    creatorEventBus.publish({ type: "MEMBER_ADDED", userId, projectId, payload: { targetUserId, role } });

    this.notifService.fire(targetUserId, "creator", "Bạn được thêm vào project!", `Bạn đã được mời tham gia project "${project.name}".`);

    return member;
  }

  async removeMember(projectId: string, userId: string, targetUserId: string) {
    const project = await this.repo.getProjectById(projectId);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    if (project.ownerId !== userId) throw new CreatorError("Không có quyền xóa thành viên", "FORBIDDEN", 403);
    return this.repo.removeMember(projectId, targetUserId);
  }

  async getMembers(projectId: string) {
    return this.repo.getMembers(projectId);
  }

  // ── Comments ──────────────────────────────────────────────────────────────────

  async addComment(projectId: string, userId: string, content: string) {
    const project = await this.repo.getProjectById(projectId);
    if (!project) throw new CreatorError("Project không tồn tại", "PROJECT_NOT_FOUND", 404);
    const comment = await this.repo.addComment(projectId, userId, content);

    creatorEventBus.publish({ type: "COMMENT_ADDED", userId, projectId, payload: { comment } });

    if (project.ownerId !== userId) {
      this.notifService.fire(project.ownerId, "creator", "Bình luận mới!", `Project "${project.name}" có bình luận mới.`);
    }

    return comment;
  }

  async getComments(projectId: string) {
    return this.repo.getComments(projectId);
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async dashboard(userId: string) {
    return this.repo.dashboard(userId);
  }

  async getCategories() {
    return this.repo.getCategories();
  }
}

import type { IActivitiesRepository, Activity, ActivityType, CreateActivityInput } from "../repositories/activitiesRepository";

export class ActivitiesService {
  constructor(private readonly repo: IActivitiesRepository) {}

  async getActivities(userId: string, type?: ActivityType, limit = 50): Promise<Activity[]> {
    return this.repo.getByUserId(userId, type, limit);
  }

  async createActivity(input: CreateActivityInput): Promise<Activity> {
    return this.repo.create(input);
  }

  fire(input: CreateActivityInput): void {
    this.repo.create(input).catch(() => {});
  }
}

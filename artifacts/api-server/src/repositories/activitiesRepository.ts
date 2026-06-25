export type ActivityType = "marketplace" | "wallet" | "inventory" | "launcher" | "system" | "social" | "quest" | "mail" | "chat";

export interface Activity {
  id:          string;
  userId:      string;
  type:        ActivityType;
  title:       string;
  description: string;
  metadata:    unknown | null;
  sourceApp:   string;
  createdAt:   string;
}

export interface CreateActivityInput {
  userId:      string;
  type:        ActivityType;
  title:       string;
  description: string;
  metadata?:   unknown;
  sourceApp?:  string;
}

export interface IActivitiesRepository {
  getByUserId(userId: string, type?: ActivityType, limit?: number): Promise<Activity[]>;
  create(input: CreateActivityInput): Promise<Activity>;
}

export class InMemoryActivitiesRepository implements IActivitiesRepository {
  private items: Activity[] = [];

  async getByUserId(userId: string, type?: ActivityType, limit = 50): Promise<Activity[]> {
    let results = this.items.filter(a => a.userId === userId);
    if (type) results = results.filter(a => a.type === type);
    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const activity: Activity = {
      id:          crypto.randomUUID(),
      userId:      input.userId,
      type:        input.type,
      title:       input.title,
      description: input.description,
      metadata:    input.metadata ?? null,
      sourceApp:   input.sourceApp ?? "universe-hub",
      createdAt:   new Date().toISOString(),
    };
    this.items.unshift(activity);
    return activity;
  }
}

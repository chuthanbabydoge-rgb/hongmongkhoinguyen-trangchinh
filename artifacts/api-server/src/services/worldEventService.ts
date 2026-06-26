// ─────────────────────────────────────────────────────────────────────────────
// WorldEventService + WeatherService — HUB-22
// ─────────────────────────────────────────────────────────────────────────────

import type { IWorldEventRepository, WorldEvent, WorldEventParticipant, WorldWeather, EventType, WeatherType } from "../repositories/bossRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/reputationRepository.js";
import { bossEventBus } from "./bossEventBus.js";

export class WorldEventError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = "WorldEventError";
  }
}

export class WorldEventService {
  constructor(
    private repo: IWorldEventRepository,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
    private reputationRepo: IUserReputationRepository,
  ) {}

  async listEvents(status?: string): Promise<WorldEvent[]> {
    return this.repo.listEvents(status);
  }

  async getEvent(id: string): Promise<WorldEvent> {
    const event = await this.repo.getEvent(id);
    if (!event) throw new WorldEventError("NOT_FOUND", "World event không tồn tại", 404);
    return event;
  }

  async createEvent(userId: string, data: {
    name: string; description?: string; type: string; region?: string;
    maxParticipants?: number; rewardCredits?: number; rewardXp?: number;
    icon?: string; startsAt?: string; endsAt?: string;
  }): Promise<WorldEvent> {
    const event = await this.repo.createWorldEvent({
      name: data.name, description: data.description ?? null,
      type: (data.type as EventType), status: "UPCOMING",
      region: data.region ?? null, maxParticipants: data.maxParticipants ?? 100,
      rewardCredits: data.rewardCredits ?? 500, rewardXp: data.rewardXp ?? 2000,
      icon: data.icon ?? null, metadata: null,
      startsAt: data.startsAt ?? null, endsAt: data.endsAt ?? null, completedAt: null,
    });
    bossEventBus.publish({ type: "WORLD_EVENT_STARTED", eventId: event.id, userId, payload: { eventName: event.name, type: event.type } });
    return event;
  }

  async startEvent(id: string, userId: string): Promise<WorldEvent> {
    const event = await this.repo.startWorldEvent(id);
    bossEventBus.publish({ type: "WORLD_EVENT_STARTED", eventId: id, userId, payload: { eventName: event.name, type: event.type } });
    return event;
  }

  async joinEvent(eventId: string, userId: string): Promise<WorldEventParticipant> {
    const event = await this.getEvent(eventId);
    if (event.status === "COMPLETED" || event.status === "FAILED") throw new WorldEventError("ENDED", "Event đã kết thúc");
    const participants = await this.repo.getParticipants(eventId);
    if (participants.length >= event.maxParticipants) throw new WorldEventError("FULL", "Event đã đầy người tham gia");
    const participant = await this.repo.joinWorldEvent(eventId, userId);
    await this.activitiesService.recordActivity(userId, "WORLD_EVENT_JOINED" as never, `Tham gia sự kiện "${event.name}"`, { eventId });
    bossEventBus.publish({ type: "WORLD_EVENT_UPDATED", eventId, userId, payload: { participantCount: participants.length + 1 } });
    return participant;
  }

  async contributeObjective(eventId: string, objectiveId: string, userId: string, amount = 1): Promise<WorldEvent> {
    const event = await this.getEvent(eventId);
    if (event.status !== "ACTIVE") throw new WorldEventError("NOT_ACTIVE", "Event không đang diễn ra");
    const objective = await this.repo.contributeObjective(objectiveId, userId, amount);
    bossEventBus.publish({ type: "WORLD_EVENT_UPDATED", eventId, userId, payload: { objectiveId, current: objective.current, target: objective.target, isComplete: objective.isComplete } });
    // Check if all objectives complete
    const objectives = await this.repo.getObjectives(eventId);
    const allComplete = objectives.length > 0 && objectives.every(o => o.isComplete);
    if (allComplete) {
      await this.completeEvent(eventId, userId, true);
    }
    return this.getEvent(eventId);
  }

  async completeEvent(eventId: string, userId: string, success: boolean): Promise<WorldEvent> {
    const event = await this.repo.completeWorldEvent(eventId, success);
    if (success) {
      const participants = await this.repo.getParticipants(eventId);
      await this.repo.distributeRewards(eventId, participants);
      for (const p of participants) {
        await this.notifService.fire(p.userId, "WORLD_EVENT_COMPLETED" as never, `🌍 Sự kiện "${event.name}" hoàn thành!`, `Phần thưởng đã được gửi vào hòm thư của bạn.`);
        await this.activitiesService.recordActivity(p.userId, "WORLD_EVENT_COMPLETED" as never, `Hoàn thành sự kiện "${event.name}"`, { eventId, credits: event.rewardCredits });
        await this.reputationRepo.upsert(p.userId, 15);
      }
    }
    bossEventBus.publish({ type: "WORLD_EVENT_COMPLETED", eventId, userId, payload: { eventName: event.name, success } });
    return event;
  }

  async getHistory(userId: string): Promise<WorldEvent[]> {
    return this.repo.getHistory(userId);
  }

  async getParticipants(eventId: string): Promise<WorldEventParticipant[]> {
    return this.repo.getParticipants(eventId);
  }
}

export class WeatherService {
  constructor(
    private repo: IWorldEventRepository,
    private notifService: NotificationsService,
    private activitiesService: ActivitiesService,
  ) {}

  async getCurrentWeather(region?: string): Promise<WorldWeather | null> {
    return this.repo.getCurrentWeather(region ?? "global");
  }

  async listWeather(): Promise<WorldWeather[]> {
    return this.repo.listWeather();
  }

  async setWeather(userId: string, region: string, weather: string, intensity?: number, durationSec?: number): Promise<WorldWeather> {
    const w = await this.repo.setWeather(region, weather as WeatherType, intensity, durationSec);
    bossEventBus.publish({ type: "WEATHER_CHANGED", userId, payload: { region, weather, intensity } });
    await this.activitiesService.recordActivity(userId, "WEATHER_CHANGED" as never, `Thời tiết tại ${region} chuyển sang ${weather}`, { region, weather });
    return w;
  }
}

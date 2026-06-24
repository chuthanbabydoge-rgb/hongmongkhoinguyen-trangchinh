---
name: HUB-5 App Registry
description: ApplicationRegistryService — tách biệt với HUB-2; route /api/apps; dual repo pattern.
---

HUB-5 là Universe App Registry & Launcher — khác với HUB-2 (EcosystemApp) ở chỗ:
- Model: `Application` + `UserApplication` (có featured, bannerUrl, launchUrl, user install/open tracking)
- Bảng DB: `applications_registry`, `user_apps`
- AppCategory HUB-5: SYSTEM, SPORT, WORLD, ANIMAL, ECONOMY, UTILITY, EDUCATION, AI (khác HUB-2)
- AppStatus HUB-5: ACTIVE, DISABLED (khác HUB-2 có MAINTENANCE)
- Routes: `/api/apps/*` (không phải /api/ecosystem/apps)

**Why:** Spec yêu cầu entity riêng với user-level tracking (install/open/lastOpenedAt) và featured flag — không thể tái sử dụng HUB-2.

**How to apply:** Khi cần sửa App Registry user-level features, tìm trong `applicationRegistryRepository.ts` và `applicationRegistryService.ts`. Container wires `applicationRegistryService` ở cuối file.

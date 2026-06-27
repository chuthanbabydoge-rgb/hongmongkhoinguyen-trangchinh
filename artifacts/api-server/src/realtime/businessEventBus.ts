// ─────────────────────────────────────────────────────────────────────────────
// Business Event Bus — HUB-27
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "events";

export type BusinessEventType =
  | "COMPANY_CREATED"
  | "COMPANY_UPDATED"
  | "COMPANY_DELETED"
  | "EMPLOYEE_HIRED"
  | "EMPLOYEE_FIRED"
  | "SALARY_PAID"
  | "PAYROLL_COMPLETED"
  | "STORE_CREATED"
  | "PRODUCT_CREATED"
  | "WAREHOUSE_UPDATED"
  | "FACTORY_STARTED"
  | "FACTORY_COMPLETED"
  | "TRANSACTION_CREATED"
  | "REVENUE_RECEIVED"
  | "BUSINESS_LEVEL_UP"
  | "BRAND_CREATED"
  | "DEPARTMENT_CREATED"
  | "INVOICE_PAID";

export interface BusinessEvent {
  type:    BusinessEventType;
  payload: Record<string, unknown>;
}

class BusinessEventBus extends EventEmitter {
  emit(event: BusinessEventType, payload: Record<string, unknown>): boolean {
    return super.emit(event, { type: event, payload });
  }

  on(event: BusinessEventType, listener: (e: BusinessEvent) => void): this {
    return super.on(event, listener);
  }
}

export const businessEventBus = new BusinessEventBus();

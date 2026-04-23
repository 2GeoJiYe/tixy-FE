export type SalesTrendGranularity = "DAY" | "HOUR";

export interface SalesSummary {
  soldTicketCount: number;
  paidAmount: number;
  paymentCount: number;
  sessionCount: number;
}

export interface SessionSalesSpeed {
  eventId: number;
  eventTitle: string;
  sessionId: number;
  sessionName: string;
  sessionOpenDate: string;
  sessionSeatCount: number;
  soldTicketCount: number;
  paidAmount: number;
  sold10m: number;
  sold30m: number;
  sold60m: number;
  sellThroughRate: number;
  remainingSeatCount: number;
}

export interface SalesTrendPoint {
  bucket: string;
  soldTicketCount: number;
  paidAmount: number;
  paymentCount: number;
}

export interface SalesDashboardResponse {
  summary: SalesSummary;
  sessions: SessionSalesSpeed[];
  trend: SalesTrendPoint[];
}

export interface SalesDashboardFilters {
  from: string;
  to: string;
  granularity: SalesTrendGranularity;
  eventId?: number;
}

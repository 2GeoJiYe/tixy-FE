export interface ActiveSeatSection {
  eventSessionId: number;
  seatSectionId: number;
  seatSessionIds: number[];
}

export interface SeatHoldRequest {
  eventSessionId: number;
  seatIds: number[];
  seatSectionId: number;
}

export interface SeatHoldResponse {
  seatLabels: string[];
  ticketTypeId: number;
  eventTitle: string;
  seatSectionName: string;
  sessionOpenDatetime: string;
  sessionEndDatetime: string;
}

export interface OrderRequest {
  ticketTypeId: number;
  eventSessionId: number;
  seatIds: number[];
}

export interface OrderResponse {
  totalPayment: number;
  depositAddress: string;
  ticketCount: number;
}

export interface BookingDraft {
  eventId: number;
  sessionId: number;
  sectionId?: number;
  selectedSeatIds: number[];
  hold?: SeatHoldResponse & {
    heldAt: string;
    expiresAt: string;
  };
  order?: OrderResponse & {
    createdAt: string;
  };
}

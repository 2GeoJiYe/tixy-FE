export type SeatPreset = "small_theater" | "medium_theater" | "musical_hall" | "concert_hall";

export interface SeatZoneConfig {
  sectionId: number;
  label: string;
  seatIds: number[];
}

export interface GeneratedSeat {
  seatId: number;
  label: string;
  zoneLabel: string;
}

export interface GeneratedSeatRow {
  label: string;
  seats: Array<GeneratedSeat | null>;
}

export interface GeneratedSeatBlock {
  id: string;
  title: string;
  rows: GeneratedSeatRow[];
}

function blockTemplate(preset: SeatPreset) {
  switch (preset) {
    case "small_theater":
      return [8, 10, 10, 12, 12, 12];
    case "medium_theater":
      return [10, 12, 14, 16, 16, 16, 16];
    case "musical_hall":
      return [12, 14, 16, 18, 18, 18, 18, 18];
    case "concert_hall":
      return [14, 16, 18, 20, 20, 22, 22, 22];
  }
}

export function generateSeatLayout(preset: SeatPreset, zones: SeatZoneConfig[]): GeneratedSeatBlock[] {
  const rowLengths = blockTemplate(preset);
  const blocks: GeneratedSeatBlock[] = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  zones.forEach((zone, zoneIndex) => {
    let cursor = 0;
    const rows = rowLengths.map((length, rowIndex) => {
      const seats: Array<GeneratedSeat | null> = [];
      const padding = Math.max(0, Math.floor((22 - length) / 2));

      for (let index = 0; index < padding; index += 1) {
        seats.push(null);
      }

      for (let index = 0; index < length; index += 1) {
        const seatId = zone.seatIds[cursor++];
        seats.push(
          seatId
            ? {
                seatId,
                label: `${alphabet[rowIndex]}${index + 1}`,
                zoneLabel: zone.label,
              }
            : null,
        );
      }

      for (let index = seats.length; index < 22; index += 1) {
        seats.push(null);
      }

      return {
        label: alphabet[rowIndex],
        seats,
      };
    });

    blocks.push({
      id: `${zone.sectionId}-${zoneIndex}`,
      title: zone.label,
      rows,
    });
  });

  return blocks;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  categoryIds?: string[];
  startDateTime: Date;
  endDateTime: Date;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  cohostIds?: string[];
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  categoryIds?: string[];
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

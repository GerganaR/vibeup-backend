export interface CreateEventDTO {
    title: string;
    description?: string;
    categories?: string[];
    startDateTime: Date;
    endDateTime: Date;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    cohostIds?: string[];
  }
  
  export interface UpdateEventDTO extends Partial<CreateEventDTO> {}
  
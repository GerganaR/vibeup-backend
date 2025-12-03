import { EventAggregate } from "../EventAggregate";

export interface IEventRepository {
  findById(id: string): Promise<EventAggregate | null>;
  findAll(): Promise<EventAggregate[]>;
  save(event: EventAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}


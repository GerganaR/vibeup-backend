import { TrackedValueObjectCollection } from "@/core/domain/trackValueObjectCollection";
import { EventCohostVO } from "./eventCohost.vo";

export class EventCohostCollection extends TrackedValueObjectCollection<EventCohostVO> {
  protected getType() {
    return EventCohostVO;
  }

  protected getHash(vo: EventCohostVO) {
    return `${vo.eventId}:${vo.userId}`;
  }
}

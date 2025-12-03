# DDD Migration Guide

## Overview

This guide helps you migrate existing code and tests to the new DDD architecture.

## Deprecated Files

The following files are **deprecated** and should be replaced:

### Event Module
- ❌ `event.service.ts` → ✅ Use `application/EventApplicationService.ts`
- ❌ `event.repository.ts` → ✅ Use `infrastructure/EventRepository.ts` (implements `domain/repositories/IEventRepository.ts`)
- ❌ `event.rules.ts` → ✅ Logic moved to `domain/EventAggregate.ts`
- ❌ `event.policy.ts` → ✅ Logic moved to `domain/EventAggregate.ts` methods
- ❌ `eventCohost.collection.ts` → ✅ Replaced by `domain/collections/EventCohostCollection.ts` (extends `TrackedValueObjectCollection`)
- ❌ `eventCohost.vo.ts` → ✅ Use `domain/value-objects/EventCohost.ts`

### User Module
- ❌ `user.service.ts` → ✅ Use `application/UserApplicationService.ts`
- ❌ `user.repository.ts` → ✅ Use `infrastructure/UserRepository.ts` (implements `domain/repositories/IUserRepository.ts`)

### Preserved Files (Still Used)
- ✅ `event.model.ts` - ORM model (infrastructure)
- ✅ `eventAttendee.model.ts` - ORM model (infrastructure)
- ✅ `eventCohost.model.ts` - ORM model (infrastructure)
- ✅ `userIdentity.entity.ts` - ORM model (infrastructure)
- ✅ `userProfile.entity.ts` - ORM model (infrastructure)
- ✅ `event.dto.ts` - Request DTOs (presentation)
- ✅ Controllers - Refactored but same API

## Updating Tests

### Example: Updating `event.service.updateEvent.spec.ts`

**Before:**
```typescript
import { eventService } from "../event.service";
import { eventRepository } from "../event.repository";

jest.mock("../event.repository");
```

**After:**
```typescript
import { EventApplicationService } from "../application/EventApplicationService";
import { IEventRepository } from "../domain/repositories/IEventRepository";
import { EventAggregate } from "../domain/EventAggregate";

const mockRepository: jest.Mocked<IEventRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const eventApplicationService = new EventApplicationService(mockRepository);
```

**Test Updates:**

1. **Mock Repository Interface** instead of concrete repository:
```typescript
const mockRepository: jest.Mocked<IEventRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
```

2. **Return EventAggregate** instead of ORM model:
```typescript
const event = EventAggregate.reconstitute({
  id: "event1",
  title: "Test Event",
  hostId: "user1",
  startDateTime: new Date(),
  endDateTime: new Date(),
  cohosts: [],
  attendees: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

mockRepository.findById.mockResolvedValue(event);
```

3. **Test Aggregate Methods** directly for unit tests:
```typescript
import { EventAggregate } from "../domain/EventAggregate";

describe("EventAggregate", () => {
  it("should enforce host validation", () => {
    const event = EventAggregate.create({...});
    
    expect(() => {
      event.ensureHost("wrong-user");
    }).toThrow("You are not the host");
  });
});
```

4. **Test Application Service** for integration:
```typescript
describe("EventApplicationService.updateEvent()", () => {
  it("should update event and save", async () => {
    const event = EventAggregate.reconstitute({...});
    mockRepository.findById.mockResolvedValue(event);
    
    await eventApplicationService.updateEvent("event1", {...}, "user1");
    
    expect(mockRepository.save).toHaveBeenCalledWith(event);
  });
});
```

## Migration Checklist

### For Each Module:

- [ ] Update imports from old service → new application service
- [ ] Update imports from old repository → new repository interface
- [ ] Update test mocks to use repository interfaces
- [ ] Update test data to use aggregates (via `reconstitute()`)
- [ ] Remove references to `EventRules`, `EventPolicy` static classes
- [ ] Update middleware that uses services
- [ ] Verify all business logic is in domain layer

### For Controllers:

- [ ] Verify controllers use application services
- [ ] Verify controllers use response DTOs
- [ ] Verify controllers are thin (no business logic)

### For Infrastructure:

- [ ] Verify mappers handle null/undefined correctly
- [ ] Verify transactions are properly managed
- [ ] Verify repository implementations match interfaces

## Common Patterns

### Creating Test Aggregates

```typescript
import { EventAggregate } from "../domain/EventAggregate";

// For existing events (reconstitution)
const existingEvent = EventAggregate.reconstitute({
  id: "event-1",
  title: "Test Event",
  hostId: "user-1",
  startDateTime: new Date("2024-01-01"),
  endDateTime: new Date("2024-01-02"),
  cohosts: [],
  attendees: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// For new events (creation)
const newEvent = EventAggregate.create({
  id: "event-1",
  title: "Test Event",
  hostId: "user-1",
  startDateTime: new Date("2024-01-01"),
  endDateTime: new Date("2024-01-02"),
});
```

### Working with Tracked Collections

The `EventAggregate` uses `TrackedValueObjectCollection` for cohosts and attendees. This provides automatic change tracking:

```typescript
// Get changes for persistence
const cohostChanges = event.getCohostChanges();
// Returns: { new: EventCohost[], removed: EventCohost[] }

const attendeeChanges = event.getAttendeeChanges();
// Returns: { new: EventAttendee[], removed: EventAttendee[] }

// Access current state
const allCohosts = event.cohosts; // Array of all cohosts (clean + new)
const allAttendees = event.attendees; // Array of all attendees (clean + new)
```

The repository uses these change methods to efficiently sync only deltas:
```typescript
// In EventRepository.syncCohosts()
const changes = event.getCohostChanges();
if (changes.new.length > 0) {
  // Only insert new cohosts
}
if (changes.removed.length > 0) {
  // Only delete removed cohosts
}
```

### Mocking Repository Interface

```typescript
import { IEventRepository } from "../domain/repositories/IEventRepository";

const createMockRepository = (): jest.Mocked<IEventRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
```

### Testing Domain Logic

```typescript
describe("EventAggregate", () => {
  describe("addAttendee", () => {
    it("should throw if event is full", () => {
      const event = EventAggregate.create({
        id: "event-1",
        title: "Test",
        hostId: "user-1",
        startDateTime: new Date(),
        endDateTime: new Date(),
        capacity: 1,
      });
      
      event.addAttendee("user-2");
      
      expect(() => {
        event.addAttendee("user-3");
      }).toThrow("Event capacity is full");
    });
  });
});
```

## Removing Old Files

Once all references are updated, you can safely remove:

```bash
# Event module
rm src/modules/event/event.service.ts
rm src/modules/event/event.repository.ts
rm src/modules/event/event.rules.ts
rm src/modules/event/event.policy.ts
rm src/modules/event/eventCohost.collection.ts
rm src/modules/event/eventCohost.vo.ts

# User module
rm src/modules/user/user.service.ts
rm src/modules/user/user.repository.ts
```

**Note**: Keep ORM models (`*.model.ts`, `*.entity.ts`) as they're still used by infrastructure.

## Dependency Injection

Currently using simple constructor injection. For production, consider:

1. **DI Container** (e.g., InversifyJS, TSyringe):
```typescript
// container.ts
import { Container } from "inversify";
import { IEventRepository } from "./domain/repositories/IEventRepository";
import { EventRepository } from "./infrastructure/EventRepository";
import { EventApplicationService } from "./application/EventApplicationService";

const container = new Container();
container.bind<IEventRepository>("IEventRepository").to(EventRepository);
container.bind<EventApplicationService>(EventApplicationService).toSelf();
```

2. **Factory Pattern**:
```typescript
// event.module.ts
export function createEventModule() {
  const repository = new EventRepository();
  const applicationService = new EventApplicationService(repository);
  const controller = new EventController(applicationService);
  return { controller, applicationService, repository };
}
```

## Questions?

- Domain logic questions → Check `domain/` folder
- Use case questions → Check `application/` folder
- Persistence questions → Check `infrastructure/` folder
- API questions → Check controllers


# Domain-Driven Design Refactoring Summary

## Overview

This document summarizes the DDD refactoring performed on the VibeUp backend codebase. The refactoring transforms the application from an anemic domain model to a rich domain model following DDD tactical patterns.

## Architecture Layers

### 1. Domain Layer (`src/modules/{module}/domain/`)

**Purpose**: Contains pure business logic with no dependencies on infrastructure.

#### Event Domain

- **EventAggregate** (`EventAggregate.ts`): Root aggregate containing all business logic

  - Enforces invariants: date validation, capacity checks, cohost rules
  - Rich domain methods: `update()`, `addAttendee()`, `removeAttendee()`, `ensureHost()`, `ensureNotHost()`
  - Domain event generation: `EventCreated`, `EventUpdated`, `EventDeleted`, `AttendeeAdded`, `AttendeeRemoved`, `CohostAdded`, `CohostRemoved`
  - Uses `TrackedValueObjectCollection` for change tracking of cohosts and attendees
  - Provides `getCohostChanges()` and `getAttendeeChanges()` for efficient persistence sync

- **Value Objects** (`value-objects/`):

  - `Schedule`: Encapsulates start/end date validation
  - `Location`: Encapsulates latitude/longitude validation
  - `EventCohost`: Immutable value object for cohost relationships
  - `EventAttendee`: Immutable value object for attendee relationships

- **Collections** (`collections/`):

  - `EventCohostCollection`: Extends `TrackedValueObjectCollection` for cohost change tracking
  - `EventAttendeeCollection`: Extends `TrackedValueObjectCollection` for attendee change tracking
  - Automatically tracks new, clean, and removed items
  - Enables efficient repository sync without full array comparisons

- **Domain Events** (`domain-events/`):

  - All events extend `DomainEvent` base class
  - Events are collected by aggregates and can be published by infrastructure

- **Repository Interface** (`repositories/IEventRepository.ts`):
  - Port definition (interface) - no infrastructure dependencies
  - Defines contract: `findById()`, `findAll()`, `save()`, `delete()`

#### User Domain

- **UserAggregate** (`UserAggregate.ts`): Root aggregate for user entities

  - Encapsulates user identity and profile
  - Domain method: `updateProfile()`

- **Value Objects**:

  - `Email`: Validates email format

- **Domain Events**:

  - `UserCreated`: Fired when user is created

- **Repository Interface** (`repositories/IUserRepository.ts`):
  - Contract: `findById()`, `findByGoogleId()`, `save()`

### 2. Application Layer (`src/modules/{module}/application/`)

**Purpose**: Orchestrates domain operations, coordinates transactions, handles use cases.

#### Event Application Service

- `EventApplicationService`: Orchestrates event use cases

  - `getAllEvents()`: Retrieves all events
  - `getEventById()`: Retrieves single event with validation
  - `createEvent()`: Creates new event aggregate
  - `updateEvent()`: Updates event (delegates to aggregate)
  - `deleteEvent()`: Deletes event
  - `rsvp()`: Adds attendee (delegates to aggregate)
  - `cancelRsvp()`: Removes attendee (delegates to aggregate)

- **Response DTOs**: `EventResponseDTO` and `EventResponseMapper`
  - Maps domain aggregates to API response format
  - Keeps domain layer pure (no DTOs in domain)

#### User Application Service

- `UserApplicationService`: Orchestrates user use cases

  - `findOrCreateFromGoogle()`: Finds or creates user from Google auth
  - `getUserById()`: Retrieves user by ID

- **Response DTOs**: `UserResponseDTO` and `UserResponseMapper`

### 3. Infrastructure Layer (`src/modules/{module}/infrastructure/`)

**Purpose**: Implements technical concerns: persistence, external services, frameworks.

#### Event Infrastructure

- **EventRepository** (`EventRepository.ts`): Sequelize implementation of `IEventRepository`

  - Implements repository interface
  - Handles transaction management
  - Efficiently syncs cohosts and attendees using tracked collections
  - Uses `getCohostChanges()` and `getAttendeeChanges()` to only persist deltas
  - Uses `EventMapper` for domain ↔ persistence conversion

- **EventMapper** (`EventMapper.ts`): Maps between domain aggregates and ORM models
  - `toDomain()`: Converts Sequelize model → EventAggregate
  - `toPersistence()`: Converts EventAggregate → Sequelize data

#### User Infrastructure

- **UserRepository** (`UserRepository.ts`): Sequelize implementation of `IUserRepository`

  - Handles UserIdentity and UserProfile synchronization
  - Uses `UserMapper` for conversion

- **UserMapper** (`UserMapper.ts`): Maps between domain aggregates and ORM models

### 4. Presentation Layer (Controllers)

**Purpose**: Thin, IO-only layer that handles HTTP requests/responses.

- **EventController**: Delegates to `EventApplicationService`, maps responses
- **UserController**: Delegates to `UserApplicationService`, maps responses

## Key Design Decisions

### 1. Rich Domain Model

- Business logic moved from services to aggregates
- Invariants enforced within aggregates
- Domain rules (previously in `EventRules`) now in aggregate methods

### 2. Value Objects

- Immutable objects representing domain concepts
- Self-validating (e.g., `Schedule` validates dates, `Email` validates format)
- Replaced primitive obsession

### 2.1. Tracked Value Object Collections

- `TrackedValueObjectCollection` pattern for managing collections of value objects
- Automatically tracks new, clean, and removed items
- Enables efficient change detection without full scans
- Used for cohosts and attendees in `EventAggregate`
- Simplifies repository persistence logic

### 3. Domain Events

- Aggregates generate events for side effects
- Events can be published by infrastructure layer for integration

### 4. Repository Pattern

- Interface in domain layer (port)
- Implementation in infrastructure layer (adapter)
- Domain layer has no knowledge of Sequelize

### 5. Application Services

- Thin orchestration layer
- Coordinates aggregates and transactions
- No business logic (delegates to aggregates)

### 6. Dependency Direction

- Domain → Application → Infrastructure → Presentation
- Domain has zero infrastructure dependencies
- Application depends on domain interfaces, not implementations

## Migration Notes

### Removed/Deprecated Files

- `event.service.ts`: Replaced by `EventApplicationService`
- `event.rules.ts`: Logic moved to `EventAggregate`
- `event.policy.ts`: Logic moved to `EventAggregate` methods
- `eventCohost.collection.ts`: Replaced by `domain/collections/EventCohostCollection` (uses `TrackedValueObjectCollection`)
- `eventCohost.vo.ts`: Replaced by `domain/value-objects/EventCohost.ts`
- `user.service.ts`: Replaced by `UserApplicationService`

### Preserved Files

- ORM models (`event.model.ts`, `eventAttendee.model.ts`, etc.): Still used by infrastructure
- DTOs (`event.dto.ts`): Still used for request validation
- Controllers: Refactored but same API shape

### Dependency Injection

Currently using simple constructor injection at module level. For production, consider:

- DI container (InversifyJS, TSyringe)
- Factory pattern for service creation
- Configuration-based wiring

## Testing Strategy

### Domain Layer

- Unit test aggregates in isolation
- Test invariants and business rules
- Mock repository interfaces

### Application Layer

- Test use case orchestration
- Mock repositories
- Test transaction boundaries

### Infrastructure Layer

- Integration tests with test database
- Test mappers
- Test repository implementations

## Benefits

1. **Testability**: Domain logic can be tested without infrastructure
2. **Maintainability**: Clear separation of concerns
3. **Business Logic Clarity**: Rules are explicit in domain layer
4. **Flexibility**: Can swap infrastructure (e.g., change ORM) without touching domain
5. **Domain Events**: Enables event-driven architecture
6. **Type Safety**: Strong typing throughout layers
7. **Efficient Change Tracking**: `TrackedValueObjectCollection` provides automatic change detection
8. **Optimized Persistence**: Repository only syncs deltas (new/removed items), not entire collections

## Next Steps (Optional Enhancements)

1. **Domain Event Publishing**: Add event bus/dispatcher in infrastructure
2. **Specification Pattern**: For complex queries
3. **Unit of Work**: For transaction management abstraction
4. **CQRS**: Separate read/write models if needed
5. **Domain Services**: For cross-aggregate operations
6. **DI Container**: For better dependency management

## File Structure

```
src/modules/event/
├── domain/
│   ├── EventAggregate.ts
│   ├── value-objects/
│   │   ├── Schedule.ts
│   │   ├── Location.ts
│   │   ├── EventCohost.ts
│   │   └── EventAttendee.ts
│   ├── collections/
│   │   ├── EventCohostCollection.ts
│   │   └── EventAttendeeCollection.ts
│   ├── domain-events/
│   │   ├── EventCreated.ts
│   │   ├── EventUpdated.ts
│   │   ├── EventDeleted.ts
│   │   ├── AttendeeAdded.ts
│   │   ├── AttendeeRemoved.ts
│   │   ├── CohostAdded.ts
│   │   └── CohostRemoved.ts
│   └── repositories/
│       └── IEventRepository.ts
├── application/
│   ├── EventApplicationService.ts
│   └── EventResponseDTO.ts
├── infrastructure/
│   ├── EventRepository.ts
│   └── EventMapper.ts
├── event.controller.ts
├── event.dto.ts
├── event.routes.ts
├── event.model.ts (ORM)
├── eventAttendee.model.ts (ORM)
└── eventCohost.model.ts (ORM)
```

## Conclusion

The refactoring successfully transforms the codebase into a clean DDD architecture with:

- ✅ Rich domain models with business logic
- ✅ Clear layer separation
- ✅ No infrastructure dependencies in domain
- ✅ Repository pattern with interfaces
- ✅ Domain events for side effects
- ✅ Value objects for domain concepts
- ✅ Tracked value object collections for efficient change tracking
- ✅ Thin application services
- ✅ Thin controllers

The API shape remains unchanged, ensuring backward compatibility.

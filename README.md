# VibeUp Backend Services

A robust, scalable REST API powering the VibeUp platform. Built with **Node.js**, **Express**, and **TypeScript** using **Domain-Driven Design (DDD)** principles.

---

## 🚀 Project Overview

**VibeUp** is an event discovery and social engagement platform. The backend is designed to handle complex business rules around event scheduling, user identities, and geographical data while maintaining high maintainability and testability.

### Key Capabilities

- **Authentication**: Secure Google OAuth integration with JWT session management.
- **Event Management**: Create, update, searching and RSVP to events.
- **Geospatial Features**: Radius-based event lookup using PostgreSQL/Sequelize.
- **Scalable Architecture**: Strict separation of concerns to allow independent scaling of modules.

---

## 🛠️ Architecture Evolution

The backend architecture has evolved to meet increasing complexity requirements. This journey demonstrates a pragmatic approach to software design, starting simple and refactoring for scale.

### Phase 1: The "Simple MVC" Approach (MVP)

_Goal: Rapid Development & Prototyping_

Initially, the project followed a traditional **Model-View-Controller (MVC)** pattern.

- **Structure**:
  - `controllers/`: Handled HTTP requests and business logic.
  - `services/`: Contained some business logic but often mixed with database queries.
  - `models/`: Direct Sequelize models used everywhere.
- **Pros**: Fast to set up, easy to understand for small features.
- **Cons**: As the `User` and `Event` domains grew, controllers became bloated ("Fat Controllers"), and business rules were scattered across services and UI layers.

### Phase 2: Refactoring to Domain-Driven Design (DDD)

_Goal: maintainability, Testability & Separation of Concerns_

As the application matured, we transitioned to a **Clean Architecture / DDD** approach. This ensures that business rules are independent of external frameworks (like Express or Sequelize).

#### Current Structure Map

The module structure (e.g., `src/modules/user/`) is now strictly layered:

1.  **Domain Layer** (`/domain`)

    - _The Core_. Contains business entities and logic purely in TypeScript.
    - **Entities**: `UserAggregate.ts` (Rich domain model, distinct from DB tables).
    - **Rules**: Invariants and validation happen here.
    - **No Dependencies**: Does not know about specific databases or controllers.

2.  **Application Layer** (`/application`)

    - _The Orchestrator_. Handles specific use cases.
    - **Services**: `UserApplicationService.ts`. Coordinates Domain objects and Repositories.
    - **DTOs**: Defines how data enters/exits the system, decoupling internal models from API responses.

3.  **Infrastructure Layer** (`/infrastructure`)

    - _The Plumbing_. Connects to the outside world.
    - **Repositories**: `UserRepository.ts`. Implements Domain interfaces using Sequelize.
    - **Models**: `models/UserIdentity.model.ts`. Actual Database schemas (Sequelize).
    - **Mappers**: `UserMapper.ts`. Translates between DB Models <-> Domain Entities.

4.  **Presentation / UI Layer** (`/ui`)
    - _The Interface_.
    - **Controllers**: `user.controller.ts`. Minimal logic, just parses HTTP and calls Application Services.
    - **Routes**: `user.routes.ts`. Defines API endpoints.

---

## 💻 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript (Strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize (TypeScript)
- **Validation**: Joi / Domain-level validation
- **Testing**: Jest (Unit & Integration)

## 📦 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Google Cloud Console Project (for OAuth)

### Installation

1.  **Clone & Install**

    ```bash
    git clone params...
    npm install
    ```

2.  **Environment Setup**
    Create `.env`:

    ```env
    PORT=5000
    DB_HOST=localhost
    DB_NAME=vibeup_db
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

_This architecture allows VibeUp to scale its complexity without accumulating technical debt, providing a solid foundation for future features like real-time chat and payment processing._

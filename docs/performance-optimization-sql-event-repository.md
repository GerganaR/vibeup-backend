# N+1 Query Fix - SqlEventRepository

## Problem

`GET /api/events` was taking ~4 seconds due to N+1 queries.

**Before**: For 10 events = 51 queries (1 + 10×5)

```typescript
async findAll() {
  const ids = await query(`SELECT id FROM events`);
  for (const row of ids) {
    await this.findById(row.id); // 5 queries each
  }
}
```

## Solution

Used PostgreSQL JSON aggregation to fetch everything in 1 query:

```sql
SELECT
  e.*,
  (SELECT json_agg(...) FROM event_categories WHERE event_id = e.id) as categories_json,
  (SELECT json_agg(...) FROM event_attendees WHERE event_id = e.id) as attendees_json,
  (SELECT json_agg(...) FROM event_cohosts WHERE event_id = e.id) as cohosts_json
FROM events e
```

## Indexes Added

Migration: `002_add_indexes.ts`

| Table              | Column(s)                 | Purpose            |
| ------------------ | ------------------------- | ------------------ |
| `user_identities`  | `googleId`                | OAuth lookups      |
| `user_profiles`    | `email`                   | Email search       |
| `events`           | `host_id, start_datetime` | Dashboard queries  |
| `events`           | `latitude, longitude`     | Location search    |
| `events`           | `end_datetime`            | Past/active filter |
| `event_attendees`  | `event_id`                | Attendee lookups   |
| `event_cohosts`    | `event_id`                | Cohost lookups     |
| `event_categories` | `event_id`                | Category lookups   |

## Result

| Before     | After   |
| ---------- | ------- |
| 51 queries | 1 query |
| ~4000ms    | ~50ms   |

User (parent)
├─ HasMany → Event (via hostId)
├─ HasMany → EventAttendee (via userId)
└─ HasMany → EventCohost (via userId)

Event (child of User, parent of EventAttendee/EventCohost)
├─ BelongsTo → User (via hostId)
├─ HasMany → EventAttendee (via eventId)
└─ HasMany → EventCohost (via eventId)

EventAttendee (child)
├─ BelongsTo → Event (via eventId)
└─ BelongsTo → User (via userId)

EventCohost (child)
├─ BelongsTo → Event (via eventId)
└─ BelongsTo → User (via userId)

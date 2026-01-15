export class EventCategory {
  private constructor(
    public readonly categoryId: string,
    public readonly categoryName?: string
  ) {}

  static create(categoryId: string, categoryName?: string): EventCategory {
    if (!categoryId) throw new Error("EventCategory requires categoryId");
    return new EventCategory(categoryId, categoryName);
  }

  equals(other: EventCategory): boolean {
    return this.categoryId === other.categoryId;
  }
}

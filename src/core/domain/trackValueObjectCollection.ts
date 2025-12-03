export abstract class TrackedValueObjectCollection<T extends object> {
  protected clean: Record<string, T> = {};
  protected new: Record<string, T> = {};
  protected removed: Record<string, T> = {};
  protected originalClean: Record<string, T> = {};

  constructor(initialItems?: T[]) {
    if (!initialItems) return;

    for (const item of initialItems) {
      this.registerOriginalClean(item);
    }

    for (const item of initialItems) {
      this.registerClean(item);
    }
  }

  protected abstract getType(): new (...args: any[]) => T;
  protected abstract getHash(value: T): string;

  private guard(value: T): void {
    const expected = this.getType();
    if (!(value instanceof expected)) {
      throw new Error(
        `Object of type <${value.constructor.name}> is not instance of <${expected.name}>`
      );
    }
  }

  private registerOriginalClean(value: T): void {
    this.guard(value);
    const key = this.getHash(value);
    this.originalClean[key] = value;
  }

  public registerClean(value: T): void {
    this.guard(value);
    const key = this.getHash(value);

    if (this.removed[key]) {
      throw new Error("Value object is registered as removed!");
    }
    if (this.new[key]) {
      throw new Error("Value object is registered as new!");
    }

    this.clean[key] = value;
  }

  public registerNew(value: T): void {
    this.guard(value);
    const key = this.getHash(value);

    if (this.clean[key]) {
      throw new Error("Value object is registered as clean!");
    }
    if (this.removed[key]) {
      delete this.removed[key];
    }

    // If it existed originally, it becomes clean again
    if (this.originalClean[key]) {
      this.clean[key] = value;
    } else {
      this.new[key] = value;
    }
  }

  public registerRemoved(value: T): void {
    this.guard(value);
    const key = this.getHash(value);

    if (this.new[key]) {
      delete this.new[key];
      return;
    }

    if (this.clean[key]) {
      delete this.clean[key];
    }

    this.removed[key] = value;
  }

  public registerAllAsRemoved(): void {
    for (const item of this.getNotRemoved()) {
      this.registerRemoved(item);
    }
  }

  public getNew(): T[] {
    return Object.values(this.new);
  }

  public getClean(): T[] {
    return Object.values(this.clean);
  }

  public getRemoved(): T[] {
    return Object.values(this.removed);
  }

  public getNotRemoved(): T[] {
    return [...this.getClean(), ...this.getNew()];
  }

  public has(value: T): boolean {
    this.guard(value);
    const key = this.getHash(value);
    return !!(this.clean[key] || this.new[key]);
  }

  [Symbol.iterator]() {
    return this.getNotRemoved()[Symbol.iterator]();
  }

  public count(): number {
    return this.getNotRemoved().length;
  }
}

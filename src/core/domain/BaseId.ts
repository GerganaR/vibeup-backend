export abstract class BaseId {
    constructor(public readonly value: string) {
      if (!value || value.trim() === "") {
        throw new Error("ID cannot be empty");
      }
    }
  
    equals(other: BaseId): boolean {
      return this.value === other.value;
    }
  
    toString() {
      return this.value;
    }
  }
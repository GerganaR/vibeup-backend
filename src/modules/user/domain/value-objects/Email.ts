export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    return new Email(email.toLowerCase().trim());
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}


import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../../core/config/database";
import { QueryTypes } from "sequelize";

const CATEGORIES = [
  { id: uuidv4(), name: "Music & Concerts" },
  { id: uuidv4(), name: "Sports & Fitness" },
  { id: uuidv4(), name: "Technology & Innovation" },
  { id: uuidv4(), name: "Food & Dining" },
  { id: uuidv4(), name: "Networking & Business" },
  { id: uuidv4(), name: "Arts & Culture" },
  { id: uuidv4(), name: "Health & Wellness" },
  { id: uuidv4(), name: "Education & Learning" },
  { id: uuidv4(), name: "Entertainment" },
  { id: uuidv4(), name: "Gaming" },
  { id: uuidv4(), name: "Community & Social" },
  { id: uuidv4(), name: "Travel & Adventure" },
  { id: uuidv4(), name: "Fashion & Style" },
  { id: uuidv4(), name: "Nightlife & Parties" },
  { id: uuidv4(), name: "Workshops & Classes" },
];

export async function seedCategories(): Promise<void> {
  try {
    // Check if categories already exist
    const existing = await sequelize.query(
      `SELECT COUNT(*) as count FROM categories`,
      { type: QueryTypes.SELECT }
    );

    const count = (existing[0] as any).count;
    if (count > 0) {
      console.log("✓ Categories already seeded, skipping...");
      return;
    }

    // Insert categories
    for (const category of CATEGORIES) {
      await sequelize.query(
        `INSERT INTO categories (id, name, created_at) VALUES ($1, $2, NOW())`,
        {
          bind: [category.id, category.name],
          type: QueryTypes.INSERT,
        }
      );
    }

    console.log(`✓ Seeded ${CATEGORIES.length} categories`);
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
}

export function getCategories() {
  return CATEGORIES;
}

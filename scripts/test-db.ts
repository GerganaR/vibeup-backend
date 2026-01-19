import dotenv from "dotenv";
import { Pool, PoolClient } from "pg";

dotenv.config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "vibeup_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    });

interface ErrorWithCode extends Error {
  code?: string;
}

async function testConnection(): Promise<void> {
  console.log("🔍 Testing database connection...\n");
  console.log("Configuration:");
  if (process.env.DATABASE_URL) {
    console.log("  Using DATABASE_URL connection string");
  } else {
    console.log(`  Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`  Port: ${process.env.DB_PORT || 5432}`);
    console.log(`  Database: ${process.env.DB_NAME || "vibeup_db"}`);
    console.log(`  User: ${process.env.DB_USER || "postgres"}\n`);
  }

  try {
    // Test connection
    const client: PoolClient = await pool.connect();
    console.log("✅ Database connection successful!\n");

    // Get database version
    const result = await client.query("SELECT version()");
    console.log("📊 PostgreSQL Version:");
    console.log(result.rows[0].version);

    // Get current time
    const timeResult = await client.query("SELECT NOW() as current_time");
    console.log("\n⏰ Database Server Time:");
    console.log(timeResult.rows[0].current_time);

    // List tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\n📋 Tables in database:");
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row: { table_name: string }) => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log("  No tables found");
    }

    client.release();
    process.exit(0);
  } catch (error) {
    const err = error as ErrorWithCode;
    console.error("❌ Database connection failed!\n");
    console.error("Error details:");
    console.error(`  Message: ${err.message}`);
    console.error(`  Code: ${err.code || "N/A"}`);

    if (err.code === "ECONNREFUSED") {
      console.error("\n💡 Tip: Make sure PostgreSQL is running");
      console.error('   Windows: Check services or run "pg_ctl status"');
    } else if (err.code === "3D000") {
      console.error("\n💡 Tip: The database does not exist. Create it with:");
      console.error(`   createdb ${process.env.DB_NAME || "vibeup_db"}`);
    } else if (err.code === "28P01") {
      console.error("\n💡 Tip: Check your database credentials in .env file");
    }

    process.exit(1);
  }
}

testConnection();

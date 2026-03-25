import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. LOAD ENV FIRST
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function setupDatabase() {
  try {
    // 2. DYNAMICALLY IMPORT POOL AFTER ENV IS LOADED
    // This prevents the "Access denied for user ''@'localhost'" error
    const { default: pool } = await import('../mysql');

    const sqlPath = path.resolve(process.cwd(), 'src/lib/db/setup/schema.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Schema file not found at: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`⏳ Connecting to ${process.env.DB_NAME} as ${process.env.DB_USER}...`);

    await pool.query(sql);
    
    console.log("✅ Database tables synced successfully.");
    process.exit(0);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Database setup failed!");
    console.error("Reason:", error.message);
    process.exit(1);
  }
}

setupDatabase();
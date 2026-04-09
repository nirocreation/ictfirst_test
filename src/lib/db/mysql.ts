import mysql, { Pool } from "mysql2/promise";

const pool: Pool = mysql.createPool({
  uri: process.env.DATABASE_URL, // 👈 IMPORTANT
  waitForConnections: true,
  connectionLimit: 5, // 👈 lower for serverless
  queueLimit: 0,
});

export default pool;

import mysql, { Pool } from 'mysql2/promise';

// Create the pool with explicit configuration
const pool: Pool = mysql.createPool({
  host: '127.0.0.1', 
  port: 3306,
  user: 'root',
  password: '',
  database: 'lms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // This allows the setup script to run multiple lines at once
  multipleStatements: true 
});

export default pool;
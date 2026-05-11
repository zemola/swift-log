import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `);
    const exists = res.rows[0].exists;
    console.log(`Table 'orders' exists: ${exists}`);
    return exists;
  } catch (err) {
    console.error('Error checking tables:', err);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables();

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT id, email, role FROM users");
    console.log('Users:', result.rows);
  } catch (err) {
    console.error('Error listing users:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

listUsers();

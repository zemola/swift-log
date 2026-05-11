import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addColumn() {
  const client = await pool.connect();
  try {
    console.log('Adding password_hash column to users table...');
    
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `);
    
    console.log('Column added successfully!');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

addColumn();

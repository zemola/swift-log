import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addRiderId() {
  const client = await pool.connect();
  try {
    console.log('Adding rider_id column to orders table...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('Column added successfully!');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

addRiderId();

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addColumns() {
  const client = await pool.connect();
  try {
    console.log('Adding reset_token and reset_expires to users table...');
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
    `);
    
    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();

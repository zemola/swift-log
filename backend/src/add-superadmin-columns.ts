import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addColumns() {
  const client = await pool.connect();
  try {
    console.log('Adding Super Admin columns to DB...');
    
    // Add status to companies
    await client.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    `);
    
    // Add invitation columns to users
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS invitation_token TEXT,
      ADD COLUMN IF NOT EXISTS token_expires TIMESTAMP
    `);
    
    console.log('Columns added successfully!');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();

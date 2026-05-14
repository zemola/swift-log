import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addRole() {
  const client = await pool.connect();
  try {
    console.log('Adding SuperAdmin to user_role enum...');
    
    // PostgreSQL command to add value to enum
    // Note: IF NOT EXISTS for ADD VALUE requires PostgreSQL 13+
    await client.query(`
      ALTER TYPE user_role ADD VALUE 'SuperAdmin'
    `);
    
    console.log('Role added successfully!');
  } catch (err) {
    // If it already exists, it will throw an error, we can ignore it if it's "already exists"
    if ((err as any).message && (err as any).message.includes('already exists')) {
      console.log('Role already exists.');
    } else {
      console.error('Error adding role:', err);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addRole();

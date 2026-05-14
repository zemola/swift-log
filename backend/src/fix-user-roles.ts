import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixRoles() {
  const client = await pool.connect();
  try {
    console.log('Adding Dispatcher and Finance to user_role enum...');
    
    // We try to add them. If they exist, it might error, so we do them one by one.
    try {
      await client.query("ALTER TYPE user_role ADD VALUE 'Dispatcher'");
      console.log('Added Dispatcher');
    } catch (err: any) {
      if (err.code === '42710') { // duplicate_object
        console.log('Dispatcher already exists');
      } else {
        console.error('Error adding Dispatcher:', err.message);
      }
    }
    
    try {
      await client.query("ALTER TYPE user_role ADD VALUE 'Finance'");
      console.log('Added Finance');
    } catch (err: any) {
      if (err.code === '42710') {
        console.log('Finance already exists');
      } else {
        console.error('Error adding Finance:', err.message);
      }
    }
    
    console.log('Done!');
  } finally {
    client.release();
    await pool.end();
  }
}

fixRoles();

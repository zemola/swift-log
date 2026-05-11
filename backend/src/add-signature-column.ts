import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addColumn() {
  const client = await pool.connect();
  try {
    console.log('Adding signature_data column to orders table...');
    
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS signature_data TEXT;
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

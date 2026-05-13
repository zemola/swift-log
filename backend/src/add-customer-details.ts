import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//run this script to add customer_name and customer_phone to the orders table
async function addColumns() {
  const client = await pool.connect();
  try {
    console.log('Adding customer details to orders table...');

    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS customer_name TEXT,
      ADD COLUMN IF NOT EXISTS customer_phone TEXT;
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

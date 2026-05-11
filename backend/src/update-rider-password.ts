import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updatePassword() {
  const client = await pool.connect();
  try {
    console.log('Updating password for rider1@test.com...');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const result = await client.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
      [passwordHash, 'rider1@test.com']
    );
    
    if (result.rowCount === 0) {
      console.log('User rider1@test.com not found.');
    } else {
      console.log('Password updated successfully!');
    }
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePassword();

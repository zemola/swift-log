import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedSuperAdmin() {
  const client = await pool.connect();
  try {
    console.log('Seeding Super Admin...');

    // 1. Create a System Company for the Super Admin if it doesn't exist
    const companyResult = await client.query(`
      INSERT INTO companies (name, license_key)
      VALUES ('System', 'SUPER-ADMIN-KEY')
      ON CONFLICT (license_key) DO NOTHING
      RETURNING id
    `);

    let tenantId;
    if (companyResult.rows.length > 0) {
      tenantId = companyResult.rows[0].id;
    } else {
      // If it already existed, fetch it
      const existingCompany = await client.query("SELECT id FROM companies WHERE license_key = 'SUPER-ADMIN-KEY'");
      tenantId = existingCompany.rows[0].id;
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Zemolat01@', salt);

    // 3. Create the Super Admin User
    const email = 'azeemolatunji@gmail.com';
    
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, role, tenant_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [email, passwordHash, 'SuperAdmin', tenantId]);

    if (userResult.rows.length > 0) {
      console.log(`Super Admin created successfully with email: ${email}`);
    } else {
      console.log(`User with email ${email} already exists or failed to create.`);
    }

  } catch (err) {
    console.error('Error seeding Super Admin:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedSuperAdmin();

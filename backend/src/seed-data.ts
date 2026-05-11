import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedData() {
  const client = await pool.connect();
  try {
    console.log('Seeding test data...');
    
    // Insert test company
    const companyRes = await client.query(`
      INSERT INTO companies (name, license_key) 
      VALUES ($1, $2) 
      ON CONFLICT (license_key) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `, ['Test Logistics Inc', 'TEST-LICENSE-123']);
    
    const companyId = companyRes.rows[0].id;
    console.log(`Created Company ID: ${companyId}`);
    
    // Insert test rider
    const riderRes = await client.query(`
      INSERT INTO users (tenant_id, email, role) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (email) DO UPDATE SET tenant_id = EXCLUDED.tenant_id
      RETURNING id;
    `, [companyId, 'rider1@test.com', 'Rider']);
    
    const riderId = riderRes.rows[0].id;
    console.log(`Created Rider ID: ${riderId}`);
    
    console.log('Seeding completed successfully!');
    
    console.log('\n--- Use these for testing ---');
    console.log(`Tenant ID (Header): ${companyId}`);
    console.log(`Rider ID: ${riderId}`);
    console.log('-----------------------------');
    
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();

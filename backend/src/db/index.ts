import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to enforce multi-tenant context on DB queries
export const queryTenant = async (
  tenantId: string,
  text: string,
  params: any[] = []
): Promise<QueryResult> => {
  if (!tenantId) {
    throw new Error('Tenant ID is required for database queries.');
  }

  // Ensure the caller is manually adding tenant_id to the query text or params
  // This is a basic wrapper, but in a real app, you might want to use a query builder 
  // or ORM that automatically appends 'WHERE tenant_id = ?'.
  // For raw SQL, we just pass the connection pool to execute it.
  
  // Here we log the execution for debugging purposes.
  console.log(`[DB] Executing for tenant ${tenantId}: ${text}`);

  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

// Global query function that does not enforce tenant context
export const query = async (
  text: string,
  params: any[] = []
): Promise<QueryResult> => {
  console.log(`[DB] Executing global query: ${text}`);
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

export default pool;

-- Create Enums
CREATE TYPE user_role AS ENUM ('Admin', 'Receptionist', 'Finance', 'Rider');
CREATE TYPE payment_mode AS ENUM ('COD', 'Prepaid', 'Pay_on_Pickup');
CREATE TYPE order_status AS ENUM ('Pending', 'Assigned', 'In_Transit', 'Delivered', 'Cancelled');
CREATE TYPE bulk_upload_status AS ENUM ('Pending', 'Confirmed');

-- Create Tables
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    item_desc TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    pickup_addr TEXT NOT NULL,
    dropoff_addr TEXT NOT NULL,
    payment_mode payment_mode NOT NULL,
    status order_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status order_status NOT NULL,
    new_status order_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS temp_bulk_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    parsed_json JSONB NOT NULL,
    status bulk_upload_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prioritize indexing on tenant_id for every table to optimize multi-tenant query performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_temp_bulk_uploads_tenant_id ON temp_bulk_uploads(tenant_id);

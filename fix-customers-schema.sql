-- Add missing status column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Update existing records to have 'active' status
UPDATE customers 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the change
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'status';

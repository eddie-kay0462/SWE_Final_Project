-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for admins to read all user data
CREATE POLICY "Admins can read all user data" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (role_id = 1 OR role_id = 2)
        )
    );

-- Policy for superadmin to manage all user data
CREATE POLICY "Superadmin can manage all user data" ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND role_id = 1
        )
    ); 
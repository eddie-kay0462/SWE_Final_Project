/**
 * This program simply prints the contents from the tables that have RLS
 * policies like:
 * 
 *  CREATE POLICY "Allow all users to read data"
    ON public.attendance
    FOR SELECT
    USING (true);
 * 
 */


// Import the Supabase client creator function
import { createClient } from '@/utils/supabase/server';

// Page component that displays table data
export default async function TableDisplay() {
  // Initialize Supabase client
  const supabase = await createClient();
  
  const tableName = "users";

  // Fetch all records from the specified table
  const { data: records, error } = await supabase.from(tableName).select();

  // Handle any errors
  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">{tableName} Contents</h1>
      <div className="data-grid">
        {records?.map((record) => (
          <div key={record.id} className="data-card">
            {Object.entries(record).map(([key, value]) => (
              <p key={key}>
                {key}: {value instanceof Date ? value.toLocaleDateString() : value}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
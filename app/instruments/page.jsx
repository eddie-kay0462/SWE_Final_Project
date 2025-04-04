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
  
  // If there are no records
  if (!records || records.length === 0) {
    return (
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-4">{tableName} Contents</h1>
        <p>No data available in this table.</p>
      </div>
    );
  }
  
  // Get column headers from the first record
  const columnHeaders = Object.keys(records[0]);

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-4">{tableName} Contents</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columnHeaders.map((header) => (
                <th key={header} className="px-4 py-2 text-left text-sm font-semibold text-gray-600 uppercase border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {columnHeaders.map((key) => (
                  <td key={key} className="px-4 py-2 border-b border-gray-200">
                    {record[key] instanceof Date 
                      ? record[key].toLocaleDateString() 
                      : typeof record[key] === 'object' && record[key] !== null
                        ? JSON.stringify(record[key])
                        : String(record[key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
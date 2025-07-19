import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function executeSQL() {
  try {
    console.log('🔄 Reading SQL file...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('updateData.sql', 'utf8');
    
    console.log('📋 Executing SQL commands...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // If the RPC doesn't exist, try executing it directly
      console.log('🔄 Trying direct SQL execution...');
      
      // Split SQL into individual statements
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
          
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (stmtError) {
            console.error(`❌ Error in statement ${i + 1}:`, stmtError);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        }
      }
    } else {
      console.log('✅ SQL executed successfully');
      console.log('📊 Result:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

executeSQL(); 
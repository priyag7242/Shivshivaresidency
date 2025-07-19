import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function clearData() {
  try {
    console.log('Clearing existing data...');
    
    // Clear tenants table
    const { error: tenantsError } = await supabase
      .from('tenants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (tenantsError) {
      console.error('Error clearing tenants:', tenantsError);
    } else {
      console.log('✅ Tenants table cleared');
    }
    
    // Clear rooms table
    const { error: roomsError } = await supabase
      .from('rooms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (roomsError) {
      console.error('Error clearing rooms:', roomsError);
    } else {
      console.log('✅ Rooms table cleared');
    }
    
    console.log('🎉 All data cleared successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

clearData(); 
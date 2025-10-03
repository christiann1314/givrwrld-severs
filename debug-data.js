// Debug script to check what data is available
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mjhvkvnshnbnxojnandf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5Njg4NTEsImV4cCI6MjA0NzU0NDg1MX0.jaqpjR0s2bgEMxG9gjsg_pgaezEI4'
)

async function debugData() {
  console.log('🔍 Debugging data availability...')
  
  // Check profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5)
  
  console.log('📊 Profiles:', profiles)
  console.log('❌ Profiles Error:', profilesError)
  
  // Check orders table
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .limit(5)
  
  console.log('📊 Orders:', orders)
  console.log('❌ Orders Error:', ordersError)
  
  // Check if there are other server-related tables
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', '%server%')
  
  console.log('📊 Server-related tables:', tables)
}

debugData().catch(console.error)

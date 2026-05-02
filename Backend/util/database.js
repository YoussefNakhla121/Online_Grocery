const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqtuoapuvbotjiczuoqg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdHVvYXB1dmJvdGppY3p1b3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzM4MDMsImV4cCI6MjA5MzEwOTgwM30.cLuj293YtpkO5k2nLArHTYn1nddOsZiEmioo2LOfKMM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    const { error } = await supabase.from('product').select('productid').limit(1);
    if (error) throw error;
    return true;
}

module.exports = { supabase, testConnection };
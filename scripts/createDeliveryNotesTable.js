// Script to create the delivery_notes table
// This script can be run with Node.js if you have the Supabase client installed

import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.SUPABASE_URL || 'https://tymfrdglmbnmzureeien.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createDeliveryNotesTable() {
  try {
    console.log('Creating delivery_notes table...');
    
    // Create delivery_notes table
    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS delivery_notes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (tableError) {
      console.error('Error creating delivery_notes table:', tableError);
    } else {
      console.log('Successfully created delivery_notes table');
    }
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_delivery_notes_user_id ON delivery_notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_delivery_notes_created_at ON delivery_notes(created_at);
      `
    });
    
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('Successfully created indexes');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    } else {
      console.log('Successfully enabled RLS');
    }
    
    // Create policies
    const { error: policyError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE POLICY "Users can view their own delivery notes" ON delivery_notes
          FOR SELECT USING (auth.uid() = user_id);
          
        CREATE POLICY "Users can insert their own delivery notes" ON delivery_notes
          FOR INSERT WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users can update their own delivery notes" ON delivery_notes
          FOR UPDATE USING (auth.uid() = user_id);
          
        CREATE POLICY "Users can delete their own delivery notes" ON delivery_notes
          FOR DELETE USING (auth.uid() = user_id);
          
        GRANT ALL ON TABLE delivery_notes TO authenticated;
      `
    });
    
    if (policyError) {
      console.error('Error creating policies:', policyError);
    } else {
      console.log('Successfully created policies');
    }
    
    console.log('Delivery notes table setup completed');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Run the setup
createDeliveryNotesTable();
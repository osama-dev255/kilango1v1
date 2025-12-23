-- Create delivery_notes table
CREATE TABLE IF NOT EXISTS delivery_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_notes_user_id ON delivery_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_created_at ON delivery_notes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own delivery notes" ON delivery_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery notes" ON delivery_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery notes" ON delivery_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own delivery notes" ON delivery_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE delivery_notes TO authenticated;
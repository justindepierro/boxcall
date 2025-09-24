-- Allow authenticated users to insert achievement definitions (for initialization)
CREATE POLICY "Authenticated users can insert achievement definitions during initialization" ON achievement_definitions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
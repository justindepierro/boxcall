-- Allow inserts for initialization (will be removed after)
CREATE POLICY "Allow achievement definition inserts for initialization" ON achievement_definitions
FOR INSERT WITH CHECK (true);
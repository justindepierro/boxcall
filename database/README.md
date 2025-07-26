# 📚 SQL Learning Guide for BoxCall

## 🎯 **What You'll Learn**
By the end of this guide, you'll understand:
- How to read SQL like a pro
- How to write basic SQL queries
- How BoxCall's database works
- How to modify and extend the database

---

## 🔤 **SQL Basics: Reading SQL Like English**

SQL is actually designed to read like English! Let's start with the basics:

### **Key SQL Words:**
- `SELECT` = "Show me"
- `FROM` = "from this table"
- `WHERE` = "but only rows that match"
- `INSERT` = "Add new data"
- `UPDATE` = "Change existing data"
- `DELETE` = "Remove data"
- `CREATE TABLE` = "Make a new table"

### **Example: Reading a Simple Query**
```sql
SELECT name, email 
FROM users 
WHERE role = 'head_coach';
```

**Translation:** "Show me the name and email from the users table, but only for rows where the role is head_coach"

---

## 🏗️ **Understanding BoxCall's Database Structure**

### **What is a Database Table?**
Think of a table like a spreadsheet:
- **Columns** = Types of information (name, email, age)
- **Rows** = Individual records (one person's info)

### **BoxCall's Main Tables:**
```
📋 teams              - Football teams
👥 user_profiles      - Player/coach info  
📚 playbooks         - Play collections
🎯 plays             - Individual plays
📝 practice_scripts  - Practice plans
💬 team_posts        - Social posts
```

### **How Tables Connect:**
Tables are connected through **relationships**:
```sql
-- A team HAS MANY players
user_profiles.team_id → teams.id

-- A playbook BELONGS TO a team  
playbooks.team_id → teams.id

-- A play BELONGS TO a playbook
plays.playbook_id → playbooks.id
```

---

## 🔍 **Reading BoxCall Schema: Step by Step**

Let's break down a real table from our schema:

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  colors_primary TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Breaking it down:**
- `CREATE TABLE teams` = "Make a new table called teams"
- `id UUID PRIMARY KEY` = "Each team gets a unique ID"
- `name TEXT NOT NULL` = "Team name is required text"
- `school_name TEXT` = "School name is optional text"
- `created_by UUID REFERENCES auth.users(id)` = "Links to who created the team"
- `created_at TIMESTAMP DEFAULT NOW()` = "Automatically records when created"

---

## ✍️ **Writing Your First Queries**

### **1. Getting Data (SELECT)**
```sql
-- Get all teams
SELECT * FROM teams;

-- Get specific columns
SELECT name, mascot FROM teams;

-- Get teams with conditions
SELECT name FROM teams WHERE mascot = 'Eagles';
```

### **2. Adding Data (INSERT)**
```sql
-- Add a new team
INSERT INTO teams (name, school_name, mascot, created_by) 
VALUES ('Hawks', 'Central High', 'Hawks', 'user-id-here');
```

### **3. Updating Data (UPDATE)**
```sql
-- Change a team's mascot
UPDATE teams 
SET mascot = 'Wildcats' 
WHERE name = 'Hawks';
```

### **4. Removing Data (DELETE)**
```sql
-- Remove a team
DELETE FROM teams 
WHERE name = 'Hawks';
```

---

## 🎯 **BoxCall-Specific Examples**

### **Getting Team Information:**
```sql
-- Show all teams with their creator info
SELECT 
  teams.name as team_name,
  teams.mascot,
  user_profiles.display_name as coach_name
FROM teams
JOIN user_profiles ON teams.created_by = user_profiles.user_id;
```

### **Finding Plays for a Team:**
```sql
-- Get all plays for the Eagles team
SELECT 
  plays.name as play_name,
  plays.formation,
  playbooks.name as playbook_name
FROM plays
JOIN playbooks ON plays.playbook_id = playbooks.id  
JOIN teams ON playbooks.team_id = teams.id
WHERE teams.name = 'Eagles';
```

### **Counting Team Members:**
```sql
-- How many players does each team have?
SELECT 
  teams.name,
  COUNT(team_members.user_id) as player_count
FROM teams
LEFT JOIN team_members ON teams.id = team_members.team_id
GROUP BY teams.name;
```

---

## 🔒 **Understanding Security (RLS Policies)**

BoxCall uses **Row Level Security** to keep teams' data private:

```sql
CREATE POLICY "team_members_policy" ON team_members
FOR ALL USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);
```

**Translation:** "Users can only see team_members records for teams they belong to"

---

## 🛠️ **Common SQL Patterns in BoxCall**

### **1. Finding Related Data (JOINs):**
```sql
-- Get player names with their team
SELECT 
  user_profiles.display_name,
  teams.name as team_name
FROM user_profiles
JOIN team_members ON user_profiles.user_id = team_members.user_id
JOIN teams ON team_members.team_id = teams.id;
```

### **2. Filtering by User (Security):**
```sql
-- Get only MY teams
SELECT * FROM teams 
WHERE created_by = auth.uid();
```

### **3. Aggregating Data (COUNT, SUM, etc):**
```sql
-- Count plays by formation type
SELECT 
  formation,
  COUNT(*) as play_count
FROM plays
GROUP BY formation;
```

---

## 🎓 **Practice Exercises**

Try these queries on your BoxCall database:

### **Beginner:**
1. Get all team names
2. Find teams with mascot 'Eagles'
3. Count total number of plays

### **Intermediate:**
1. Get all players for a specific team
2. Find the most recent team posts
3. List playbooks with their play counts

### **Advanced:**
1. Find teams with the most players
2. Get practice scripts for next week
3. Calculate team activity scores

---

## 📖 **SQL Resources for Learning More**

- **W3Schools SQL Tutorial** - Great for basics
- **PostgreSQL Documentation** - BoxCall uses PostgreSQL
- **SQLBolt** - Interactive SQL lessons
- **SQL Murder Mystery** - Fun way to practice

---

## 🎯 **Next Steps**

1. **Practice reading** our schema files
2. **Try the example queries** in Supabase
3. **Experiment** with small changes
4. **Ask questions** - SQL becomes easier with practice!

Remember: SQL is just a way to talk to your database. The more you practice, the more natural it becomes! 🚀

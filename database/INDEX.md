# 📁 BoxCall Database Directory

This directory contains all SQL files for the BoxCall platform, organized for easy learning and maintenance.

## 📂 **Directory Structure**

```
database/
├── README.md                    # 📚 Complete SQL learning guide
├── schema/
│   └── database-schema.sql      # 🏗️ Main database structure 
├── scripts/
│   ├── cleanup-database.sql     # 🧹 Remove existing tables
│   └── test-database.sql        # ✅ Verify database works
└── examples/
    ├── sql-101-tutorial.sql     # 🎓 Beginner SQL lessons
    ├── boxcall-queries.sql      # 🎯 Advanced BoxCall examples
    └── real-world-test.sql      # 🌍 Real user scenarios
```

## 🎯 **What Each File Does**

### **📚 Learning Files (Start Here!)**
- **`README.md`** - Complete SQL guide from beginner to advanced
- **`sql-101-tutorial.sql`** - Step-by-step SQL lessons with BoxCall examples

### **🏗️ Schema Files (Database Structure)**  
- **`database-schema.sql`** - Complete BoxCall database with 18 tables, security policies, and indexes

### **🛠️ Utility Scripts**
- **`cleanup-database.sql`** - Safely removes all BoxCall tables for fresh deployment
- **`test-database.sql`** - Validates database deployment and security

### **🎯 Example Files**
- **`boxcall-queries.sql`** - Advanced queries for teams, plays, analytics
- **`real-world-test.sql`** - Template for testing with real user data

## 🚀 **Getting Started**

### **1. Learn SQL Basics:**
```bash
# Open the learning guide
open database/README.md

# Try the beginner tutorial
cat database/examples/sql-101-tutorial.sql
```

### **2. Deploy Database:**
```bash
# Run deployment guide
node deploy-schema.js

# The script will guide you through:
# - Cleaning existing tables
# - Deploying fresh schema
# - Testing everything works
```

### **3. Practice with Examples:**
```bash
# Copy queries to Supabase SQL Editor
cat database/examples/boxcall-queries.sql
```

## 📖 **SQL Learning Path**

### **Beginner (Start Here):**
1. Read `README.md` - SQL basics section
2. Try `sql-101-tutorial.sql` queries
3. Understand BoxCall's table structure

### **Intermediate:**
1. Practice `boxcall-queries.sql` examples
2. Learn JOINs and relationships
3. Understand security policies (RLS)

### **Advanced:**
1. Write custom analytics queries
2. Optimize query performance  
3. Extend schema for new features

## 🎯 **BoxCall Database Overview**

### **Core Tables:**
- **`teams`** - Football teams and basic info
- **`user_profiles`** - Player/coach extended profiles
- **`team_members`** - Who belongs to which team + roles

### **Playbook System:**
- **`playbooks`** - Collections of plays for teams
- **`plays`** - Individual football plays with formations
- **`practice_scripts`** - Organized practice plans

### **Social Features:**
- **`team_posts`** - Team communication and announcements
- **`post_comments`** - Threaded discussions
- **`post_reactions`** - Likes, reactions to posts

### **Admin & Files:**
- **`super_admins`** - Platform administrators (you!)
- **`file_uploads`** - CSV playbooks, images, documents
- **`achievements`** - Gamification system

## 🔒 **Security Features**

BoxCall uses **Row Level Security (RLS)** to ensure:
- Teams can only see their own data
- Users can only access teams they belong to
- Super admins can manage the platform
- All data is automatically isolated

## 🛠️ **Common Tasks**

### **Add New Team Data:**
```sql
-- Use real-world-test.sql as template
INSERT INTO teams (name, school_name, mascot, created_by) 
VALUES ('Your Team', 'Your School', 'Mascot', auth.uid());
```

### **Query Team Information:**
```sql
-- See boxcall-queries.sql for examples
SELECT name, mascot FROM teams;
```

### **Backup Your Data:**
```sql
-- Export specific table
SELECT * FROM teams;
```

## 🎓 **Learning Resources**

- **This Directory** - Everything you need for BoxCall
- **PostgreSQL Docs** - Official database documentation
- **Supabase Guides** - Platform-specific help
- **W3Schools SQL** - General SQL tutorial

## 💡 **Tips for Success**

1. **Start Small** - Begin with simple SELECT queries
2. **Use Examples** - Copy and modify existing queries
3. **Test Safely** - Always use WHERE clauses with DELETE/UPDATE
4. **Ask Questions** - SQL becomes easier with practice
5. **Read Error Messages** - They usually tell you exactly what's wrong

---

**Ready to become a SQL pro? Start with `README.md` and work your way through the examples! 🚀**

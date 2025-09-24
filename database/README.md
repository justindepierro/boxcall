# BoxCall Database Setup Guide

This guide will help you set up a completely clean BoxCall database from scratch, eliminating all RLS recursion issues and corrupted state.

## Prerequisites

1. **Supabase Project**: Create a new Supabase project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Set up your `.env.local` file with:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **Important**: Use the **Service Role Key** (not the anon key) for database setup scripts. You can find this in your Supabase dashboard under Settings > API.

## Quick Setup (Recommended)

Run the complete setup with one command:

```bash
npm run db:setup
```

This will:

1. Apply the complete database schema
2. Create an admin user
3. Seed demo data

## Clean Database Reset

If you need to completely reset your database:

```bash
# Generate SQL script to drop all tables
npm run db:drop-script

# Copy the generated SQL from database/drop-all-tables.sql
# Run it in your Supabase SQL Editor

# Then run the complete setup
npm run db:setup
```

## Manual Setup Steps

If you prefer to run each step individually:

### 1. Apply Database Schema

```bash
npm run db:schema
```

This creates all tables, indexes, and Row Level Security policies.

### 2. Create Admin User

```bash
npm run db:admin
```

Creates an admin user with full access to all BoxCall features.

**Default Admin Credentials:**

- Email: `admin@boxcall.app`
- Password: `Admin123!`

You can override these with environment variables:

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npm run db:admin
```

### 3. Seed Demo Data

```bash
npm run db:demo
```

Creates sample data including:

- Demo football team (Lincoln High Eagles)
- 15 sample players
- Complete playbook with 5 plays
- Social media posts
- Game results

## Database Schema Overview

The clean schema includes:

### Core Tables

- `teams` - Team information and settings
- `team_members` - User-team relationships with roles
- `team_players` - Player roster data
- `profiles` - User profile information

### Playbook System

- `playbooks` - Organized collections of plays
- `plays` - Individual play definitions
- `play_calls` - Game execution tracking

### Social Features

- `team_posts` - Team social media posts
- `post_likes` - Post interactions
- `post_comments` - Comment threads
- `post_shares` - Content sharing

### Game Management

- `game_plans` - Pre-game planning
- `game_plan_situations` - Situational plays
- `game_plan_plays` - Play assignments
- `game_results` - Game outcome tracking

### Practice & Calendar

- `practice_scripts` - Practice planning
- `practice_schedules` - Scheduled practices
- `practice_attendance` - Attendance tracking
- `calendar_events` - Team calendar

### Analytics & Equipment

- `achievements` - Player accomplishments
- `helmet_stickers` - Recognition system
- `equipment` - Equipment inventory

## Security Model

All tables use Row Level Security (RLS) with team-based access control:

- **Team Members**: Can access data for teams they belong to
- **Role-Based Permissions**: Coaches have full access, players have limited access
- **Admin Override**: Admin users have access to all features

## Troubleshooting

### Schema Application Fails

- Ensure your Supabase service role key has proper permissions
- Verify the database is completely empty (no existing tables)
- Check that `database/schema.sql` exists and is readable

### Admin Creation Fails

- Verify environment variables are set correctly
- Check Supabase project is active and accessible
- Ensure no existing admin user conflicts

### Demo Data Issues

- Run admin setup first (`npm run db:admin`)
- Check for any foreign key constraint errors
- Verify all previous steps completed successfully

### RLS Issues

- The schema includes comprehensive RLS policies
- If queries fail, check user authentication status
- Ensure users are properly added to teams

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for custom admin setup)
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Name
DEMO_TEAM_NAME=Your Team Name
DEMO_SCHOOL_NAME=Your School Name
```

**Finding Your Keys:**

- Go to your Supabase project dashboard
- Navigate to Settings > API
- Copy the "Project URL" for `VITE_SUPABASE_URL`
- Reveal and copy the "service_role" key for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ This key has admin privileges - keep it secure!)

## Next Steps

After setup is complete:

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Login as Admin**:
   - Go to the application
   - Use admin credentials from setup
   - Explore all BoxCall features

3. **Test Features**:
   - Create additional teams
   - Add players and coaches
   - Build playbooks
   - Use social features
   - Schedule games and practices

## Support

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify all prerequisites are met
3. Ensure environment variables are correct
4. Try running individual setup steps to isolate issues

The clean schema eliminates all previous corruption issues and provides a solid foundation for BoxCall development.

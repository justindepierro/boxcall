# BoxCall Database Schema - Complete Table Reference

## All 21 Database Tables

### 🏠 Core User & Team Management (8 tables)

1. **`profiles`** - Basic user profiles (linked to auth.users)
2. **`user_profiles`** - Extended profiles with football-specific data (height, weight, position, jersey #)
3. **`teams`** - Team information and settings
4. **`team_members`** - Primary team membership table
5. **`team_memberships`** - Alternative team membership structure
6. **`team_invites`** - Team invitation system with email-based invites
7. **`super_admins`** - Platform-level administration and permissions
8. **`games`** - Game scheduling, results, and match details

### 🏈 Football Operations (5 tables)

9. **`playbooks`** - Team playbooks (offense/defense/special teams)
10. **`plays`** - Individual plays with formations and routes
11. **`play_calls`** - In-game play execution and results
12. **`practice_scripts`** - Practice planning and templates
13. **`script_plays`** - Plays assigned to practice sessions

### 🏆 Recognition & Goals (3 tables)

14. **`achievements`** - Player achievements and awards
15. **`helmet_stickers`** - Individual helmet sticker rewards
16. **`team_goals`** - Team goal setting and progress tracking

### 💬 Communication & Social (4 tables)

17. **`team_announcements`** - Official team announcements
18. **`team_posts`** - Team social feed and updates
19. **`post_comments`** - Comments on team posts
20. **`post_reactions`** - Post reactions (like, love, celebrate, support, fire)

### 📁 File Management (1 table)

21. **`team_files`** - Document and media file storage

## Key Features by Category

### User Management

- **Dual Profile System**: `profiles` (basic) + `user_profiles` (football-specific)
- **Flexible Team Membership**: Both `team_members` and `team_memberships` for different use cases
- **Invitation System**: Email-based team invites with role assignment
- **Admin Hierarchy**: Platform super admins with granular permissions

### Football Operations

- **Comprehensive Play Management**: Playbooks → Plays → Play Calls
- **Practice Planning**: Scripts with assigned plays and timing
- **Game Tracking**: Full game details with play-by-play calling
- **Advanced Play Data**: Formations, personnel, success rates, confidence scores

### Recognition System

- **Multi-Level Recognition**: Achievements, helmet stickers, team goals
- **Goal Tracking**: Quantified team objectives with progress monitoring
- **Flexible Achievement Types**: Helmets, medals, trophies, certificates

### Communication Platform

- **Rich Social Features**: Posts, comments, reactions
- **Announcement System**: Priority-based team communications
- **Engagement Tracking**: Reaction types and user interactions

### File Management

- **Team File Storage**: Documents, videos, images
- **Access Control**: Public/private file permissions
- **Download Tracking**: File usage analytics

## Database Relationships

### Core Relationships

```
auth.users (Supabase Auth)
├── profiles (1:1)
├── user_profiles (1:1)
├── team_members (1:many)
├── team_memberships (1:many)
└── super_admins (1:1)

teams
├── team_members (1:many)
├── games (1:many)
├── playbooks (1:many)
├── team_goals (1:many)
├── team_posts (1:many)
└── team_files (1:many)

games
└── play_calls (1:many)

playbooks
└── plays (1:many)

plays
└── play_calls (1:many)

practice_scripts
└── script_plays (1:many)

team_posts
├── post_comments (1:many)
└── post_reactions (1:many)
```

## Access Patterns

### ✅ Public Access (No Auth Required)

- `profiles` - Basic user information
- `games` - Game schedules and results

### 🔒 Protected Access (Authentication Required)

All other 19 tables require user authentication due to Row Level Security (RLS) policies.

## TypeScript Integration

All tables have complete TypeScript definitions with:

- **Row types** - For reading data
- **Insert types** - For creating records
- **Update types** - For modifying records
- **Convenience exports** - Easy-to-use type aliases

Example usage:

```typescript
import type { Team, UserProfile, PlayCall } from "./types/database";

const team: Team = await getTeam(teamId);
const profile: UserProfile = await getUserProfile(userId);
const playCalls: PlayCall[] = await getGamePlayCalls(gameId);
```

Your BoxCall platform is now ready for comprehensive football team management! 🏈

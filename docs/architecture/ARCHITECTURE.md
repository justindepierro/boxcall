# BoxCall Architecture Documentation

## System Overview

BoxCall is a comprehensive football coaching platform built with modern web technologies, featuring a robust database-driven architecture for team management, playbook creation, and advanced game planning.

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript throughout

## Database Architecture

### Core Tables

#### Teams & Users

- `teams` - Team information and metadata
- `team_members` - Team membership with roles
- `auth.users` - User authentication (Supabase Auth)

#### Playbook System

- `playbooks` - Playbook containers for teams
- `plays` - Individual play definitions with formations, types, and preferences

#### Game Planning System (Brian Billick Methodology)

- `game_plans` - Master game plans with scouting and preparation data
- `game_plan_situations` - Situational categories (1st & 10, Red Zone, etc.)
- `game_plan_plays` - Play assignments within situations with priority and analytics
- `coach_cards` - Printable sideline reference cards
- `game_plan_templates` - Reusable game plan patterns
- `game_plan_analytics` - Execution tracking and performance analysis

### Key Features

#### Brian Billick Game Planning

Our game planning system implements Coach Brian Billick's proven methodology:

**Situational Categorization**:

- Down & Distance situations (1st & 10, 3rd & Short, etc.)
- Field Position contexts (Red Zone, Goal Line, Plus Territory)
- Game Situations (Two Minute, Clock Management, Fourth Down)
- Special Teams scenarios

**Play Organization**:

- Priority-based play assignments (1-5 scale)
- Personnel requirements (11, 12, 21, 22 personnel)
- Formation strength preferences
- Expected coverage scenarios
- Success probability and risk assessment

**Coach Cards System**:

- Printable sideline reference materials
- Situation-specific play calling aids
- Personnel grouping cards
- Special situation reminders

**Analytics & Tracking**:

- Real-time execution tracking
- Success rate analysis
- Performance improvement insights
- Historical game plan effectiveness

#### Automatic Data Consistency

- **Trigger-based counting**: Automatic updates of play counts and situation counts
- **Row Level Security**: Team-based data isolation
- **Referential integrity**: Cascading deletes and proper foreign key relationships

## Security Architecture

### Row Level Security (RLS)

All tables implement Supabase RLS policies ensuring:

- Team members can only access their team's data
- Public templates are available across teams
- User authentication is required for all operations

### Data Isolation

- Teams are completely isolated from each other
- Game plans and plays are scoped to team membership
- Analytics data is private to each team

## Performance Optimizations

### Database Indexes

- Composite indexes on frequently queried columns
- Team-based partitioning for large datasets
- Full-text search optimization for plays

### Efficient Querying

- Trigger-based count maintenance
- Optimized JOIN patterns
- Minimal N+1 query patterns

## API Design Principles

- RESTful endpoints following Supabase patterns
- TypeScript interfaces for all data structures
- Comprehensive error handling
- Optimistic updates where appropriate

## Component Architecture

### Design System

- Consistent UI components with Tailwind
- Mobile-first responsive design
- Accessibility-focused implementation

### State Management

- React Query for server state
- Local state for UI interactions
- Context for global app state

## Development Workflow

### Code Quality

- TypeScript for type safety
- ESLint for code consistency
- Automated testing (planned)

### Database Migrations

- Version-controlled SQL migrations
- Safe deployment procedures
- Rollback capabilities

## Future Enhancements

### Planned Features

- Advanced analytics dashboard
- Video integration for plays
- Mobile app development
- API integrations with other coaching tools

### Scalability Considerations

- Database sharding strategies
- CDN integration for media
- Caching layer implementation

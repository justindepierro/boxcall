# New Coach Experience Roadmap 🏈

_Comprehensive testing plan for tomorrow's "brand new head coach" user experience session_

## 🎯 Session Objectives

Experience BoxCall as a first-time head coach:

- **Roster Management**: Upload and organize current team roster
- **Playbook Creation**: Build and customize playbooks
- **Calendar Usage**: Schedule practices, games, and team events
- **Team Setup**: Configure team settings and preferences

---

## 🚦 Pre-Session Setup Checklist

### Environment Variables ✅ READY

```bash
# Already configured in .env.local:
VITE_SUPABASE_URL=https://lvmuiqwihlpnwppdqqfl.supabase.co
VITE_SUPABASE_ANON_KEY=[configured]
```

### Database Verification

- [x] Confirm Supabase project is active ✅
- [ ] Verify authentication is working
- [ ] Test database connectivity
- [ ] Ensure team management tables exist

### Build Status Check ✅ READY

- [x] Development server running (`http://localhost:5175/`) ✅
- [x] TypeScript compilation clean ✅
- [ ] No critical console errors (verify tomorrow)

---

## 📋 New Coach Experience Flow

### Phase 1: First Login & Team Setup (15-20 mins)

**Goal**: Get a new coach from signup to team dashboard

#### 1.1 Authentication Flow

- [ ] Visit login page (`/login`)
- [ ] Create new coach account
- [ ] Verify email confirmation works
- [ ] Complete profile setup

#### 1.2 Team Creation

- [ ] Access Team Settings page
- [ ] Create first team profile
- [ ] Set team basic info (name, sport, season)
- [ ] Configure team preferences

#### 1.3 Dashboard Familiarization

- [ ] Explore Profile Card functionality
- [ ] Review empty Trophy Shelf
- [ ] Check Team Feeds (should be empty initially)
- [ ] Navigate Calendar view

### Phase 2: Roster Upload & Management (20-25 mins)

**Goal**: Get players into the system and organized

#### 2.1 Roster Upload Options

- [ ] Test CSV import functionality
- [ ] Try manual player addition
- [ ] Verify player data fields (name, position, number, etc.)
- [ ] Test bulk operations

#### 2.2 Team Member Management

- [ ] Add assistant coaches
- [ ] Set coach roles and permissions
- [ ] Invite team managers
- [ ] Configure access levels

#### 2.3 Player Organization

- [ ] Organize by position groups
- [ ] Set jersey numbers
- [ ] Add player notes/details
- [ ] Test search and filtering

### Phase 3: Playbook Development (25-30 mins)

**Goal**: Create first playbooks and understand play creation tools

#### 3.1 Playbook Basics

- [ ] Access Playbook page (`/playbook`)
- [ ] Understand play organization system
- [ ] Test search functionality
- [ ] Explore filtering options

#### 3.2 Play Creation Methods

- [ ] Try **PlayBuilderWizard** (form-based creation)
- [ ] Test **InteractivePlayBuilder** (visual/drag-drop)
- [ ] Import plays via CSV
- [ ] Create plays manually

#### 3.3 Play Management

- [ ] Organize plays by formation
- [ ] Tag plays by down/distance
- [ ] Create play categories
- [ ] Test play search and retrieval

### Phase 4: Calendar & Scheduling (15-20 mins)

**Goal**: Set up practice and game schedules

#### 4.1 Calendar Navigation

- [ ] Access Calendar page (`/calendar`)
- [ ] Navigate month/week/day views
- [ ] Test date selection

#### 4.2 Event Creation

- [ ] Schedule practices
- [ ] Add games to calendar
- [ ] Set team meetings
- [ ] Create recurring events

#### 4.3 Practice Planning

- [ ] Access Practice Planner
- [ ] Create practice templates
- [ ] Assign plays to practice
- [ ] Set practice objectives

### Phase 5: Feature Discovery (10-15 mins)

**Goal**: Explore additional features and integrations

#### 5.1 Team Communication

- [ ] Test Team Bulletin functionality
- [ ] Send team announcements
- [ ] Check notification system

#### 5.2 Advanced Features

- [ ] Explore Templates page
- [ ] Check demo/examples
- [ ] Test any mobile responsiveness

---

## 🧪 Testing Scenarios

### Scenario A: "Importing Existing Team"

_Coach has spreadsheet with 45 players, needs to get them in quickly_

- Test CSV import with realistic roster data
- Verify data validation and error handling
- Check for duplicate detection
- Test bulk editing capabilities

### Scenario B: "Building First Game Plan"

_Coach needs 20 plays ready for upcoming game_

- Create plays across different formations
- Test play duplication and modification
- Organize plays by down/distance
- Verify play search works under pressure

### Scenario C: "Setting Up Practice Schedule"

_Coach needs to plan 2-week practice cycle_

- Create recurring practice events
- Assign specific plays to practice days
- Set practice objectives and notes
- Test calendar integration

---

## 🐛 Known Issues to Watch For

### Authentication & Setup

- Environment variables not configured
- Supabase connection errors
- Email verification delays
- Profile creation failures

### Data Management

- CSV import validation errors
- Player data corruption
- Duplicate handling issues
- Search performance problems

### UI/UX Issues

- Mobile responsiveness problems
- Loading state confusion
- Navigation unclear for new users
- Error messages not helpful

---

## 📊 Success Metrics

### Completion Rates

- [ ] Can complete full onboarding in < 30 minutes
- [ ] Successfully upload 20+ player roster
- [ ] Create 10+ playbook entries
- [ ] Schedule 1 week of practices

### Usability Feedback

- [ ] Navigation feels intuitive
- [ ] Feature discovery is natural
- [ ] Error recovery is smooth
- [ ] Performance feels responsive

### Technical Validation

- [ ] No critical console errors
- [ ] Data persists correctly
- [ ] All major features functional
- [ ] Authentication remains stable

---

## 🚀 Post-Session Action Items

### Immediate Fixes (if needed)

- [ ] Fix any blocking authentication issues
- [ ] Resolve critical data loss bugs
- [ ] Address major usability problems
- [ ] Update environment configuration

### User Experience Improvements

- [ ] Simplify onboarding flow
- [ ] Add helpful tooltips/guides
- [ ] Improve error messaging
- [ ] Enhance mobile experience

### Feature Prioritization

- [ ] Identify most-used features
- [ ] Note missing functionality gaps
- [ ] Plan integration improvements
- [ ] Update development roadmap

---

## 📱 Device Testing Plan

### Primary Testing

- **Desktop**: MacOS Chrome (primary development environment)
- **Responsive**: Test key breakpoints during session

### Secondary Testing (if time allows)

- Mobile Safari (iOS)
- Mobile Chrome (Android)
- Tablet view (iPad)

---

## 🔧 Emergency Fixes & Fallbacks

### If Supabase is Down

- Use demo/mock data mode
- Test UI/UX without backend
- Focus on component functionality

### If CSV Import Fails

- Test manual player entry
- Use sample data for testing
- Focus on data organization features

### If Authentication Breaks

- Use development bypass mode
- Test logged-in state directly
- Focus on core team features

---

## 🌟 **CURRENT STATUS SUMMARY**

### ✅ Ready for Testing

- **Environment**: Supabase configured and connected
- **Development Server**: Running on `http://localhost:5175/`
- **Authentication**: Components exist (Auth.tsx, LoginForm.tsx, RegisterForm.tsx)
- **Database Schema**: Team management tables defined
- **Core Features**: Dashboard, Playbook, Calendar, Team Settings pages available

### 🔍 Verification Needed Tomorrow

- Database connectivity test
- Authentication flow validation
- Feature functionality check
- Console error review

### 📍 Starting Point

1. Open `http://localhost:5175/`
2. Navigate to login page
3. Begin new coach signup flow

---

_Generated for tomorrow's new coach experience testing session_
_Last updated: August 3, 2025_
_Status: Ready for execution_ ✅

Roster CSV Template ( I will put in assets tomorrow (its the same as maxpreps so people dont need to keep making the same file over and over again.... we can add our own data later...))

iscaptain jersey firstname lastname position1 position2 position3 bio classyear heightfeet heightinches weight

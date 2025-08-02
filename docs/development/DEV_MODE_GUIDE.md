# 🛠️ BoxCall Development Mode System

## Overview

The BoxCall development mode system allows you to switch between different user perspectives and data sources during development. This is essential for testing various user experiences without needing multiple accounts or complex setup.

## Dev Mode Types

### **🏭 Production Mode**

- **Use Case**: Normal app behavior
- **Data Source**: Real database only
- **User Role**: Your actual authenticated role
- **Best For**: Final testing, production deployment

### **👑 Super Admin (Your Team)**

- **Use Case**: Full admin access with your real team data
- **Data Source**: Your actual team in Supabase
- **User Role**: Super admin privileges
- **Best For**: Testing admin features with real data

### **🧪 Super Admin (Mock Data)**

- **Use Case**: Full admin access with consistent test data
- **Data Source**: Mock "Eastside Eagles" team
- **User Role**: Super admin privileges
- **Best For**: Development, testing new features, screenshots

### **🏆 View as Head Coach**

- **Use Case**: Experience the app as a head coach
- **Data Source**: Mock team data
- **User Role**: Head coach permissions
- **Best For**: Testing coach-specific features

### **👨‍🏫 View as Assistant Coach**

- **Use Case**: Experience limited coaching features
- **Data Source**: Mock team data
- **User Role**: Assistant coach permissions
- **Best For**: Testing role-based restrictions

### **🏃‍♂️ View as Player**

- **Use Case**: Player perspective and limitations
- **Data Source**: Mock team data
- **User Role**: Player permissions
- **Best For**: Testing player dashboard features

### **📋 View as Team Manager**

- **Use Case**: Team manager administrative view
- **Data Source**: Mock team data
- **User Role**: Manager permissions
- **Best For**: Testing organizational features

### **👨‍👩‍👧‍👦 View as Family Member**

- **Use Case**: Parent/family member perspective
- **Data Source**: Mock team data
- **User Role**: Family member permissions
- **Best For**: Testing parent portal features

## Mock Team Data

The system includes a comprehensive mock team: **Eastside Eagles**

### Team Details

- **Name**: Eastside Eagles
- **Type**: High School Varsity Football
- **Subscription**: Team Premium (full features)
- **Team Code**: EAGLES

### Mock Players (8 total)

- **Marcus Thompson** (#12, QB, 11th grade)
- **David Rodriguez** (#88, WR/KR, 12th grade)
- **Jake Williams** (#55, LB/FB, 10th grade)
- **Tyler Johnson** (#24, RB/CB, 11th grade)
- **Alex Chen** (#77, OL/DL, 12th grade)
- **Ryan Davis** (#3, K/P, 10th grade)
- **Michael Brown** (#42, S/WR, 11th grade, JV)
- **James Wilson** (#91, DE/TE, 12th grade)

### Mock Coaches

- **Coach Mike Anderson** (Head Coach)
- **Coach Sarah Martinez** (Assistant Coach)
- **Coach Tom Wilson** (Coordinator)
- **Jennifer Smith** (Team Manager)

## Using the Dev Mode Switcher

### **Location**

The Dev Mode Switcher appears as a floating panel in the bottom-right corner during development.

### **Features**

- ✅ **Visual Mode Indicator**: Shows current mode with color coding
- ✅ **User Context Display**: Shows your actual email and role
- ✅ **One-Click Switching**: Easy mode changes
- ✅ **Persistent Settings**: Remembers your choice between sessions
- ✅ **Production Safety**: Automatically hidden in production builds

### **Quick Mode Switch**

1. Look for the 🛠️ Dev Mode panel (bottom-right)
2. Click your desired mode
3. The app immediately switches context
4. Navigate to test features with new permissions

## Database Setup

### **Prerequisites**

1. Supabase project configured
2. Environment variables set in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. PostgreSQL client tools installed

### **Run Database Migration**

```bash
# Make script executable (first time only)
chmod +x scripts/setup-database.sh

# Run the migration
./scripts/setup-database.sh
```

### **What Gets Created**

- ✅ **Teams table** - Team information and settings
- ✅ **Team Members table** - Coach and staff relationships
- ✅ **Team Players table** - Player roster with stats
- ✅ **Team Invites table** - Invitation system
- ✅ **Row Level Security** - Proper access controls
- ✅ **Performance Indexes** - Optimized queries
- ✅ **Helper Functions** - Team code generation

## Development Workflow

### **Recommended Testing Order**

1. **Start with Super Admin (Mock Data)**
   - Test all features with consistent data
   - No risk of breaking real data
   - Full feature access

2. **Switch to View As modes**
   - Test each user role systematically
   - Verify permission restrictions work
   - Check UI adapts to role capabilities

3. **Use Super Admin (Your Team)**
   - Create your actual team
   - Add real players and coaches
   - Test with production-like data

4. **Return to Production Mode**
   - Final testing with real authentication
   - Verify everything works normally
   - Deploy with confidence

### **Best Practices**

- ✅ **Always test in Mock Data mode first** - Prevents accidental data changes
- ✅ **Switch modes frequently** - Catch permission issues early
- ✅ **Test edge cases in each role** - Different users see different features
- ✅ **Use Production mode before deployment** - Final reality check
- ✅ **Document issues found per role** - Track permission-related bugs

## Technical Implementation

### **State Management**

- Uses React Context for global dev mode state
- Persists selection in localStorage
- Automatic restoration on app restart

### **Data Source Logic**

```typescript
const { shouldUseMockData, mockTeamData } = useTeamDataSource();

if (shouldUseMockData) {
  // Use mockTeamData
} else {
  // Query Supabase database
}
```

### **Permission Checking**

```typescript
const { effectiveUserRole } = useEffectiveTeamRole();
const isSuperAdmin = useIsSuperAdmin();

// Use effectiveUserRole instead of profile.role
```

### **Component Integration**

- Components automatically adapt to dev mode
- No manual mode checking required
- Seamless switching between data sources

## Troubleshooting

### **Dev Mode Not Showing**

- Check you're in development mode (`npm run dev`)
- Dev switcher is hidden in production builds
- Look for the floating panel in bottom-right corner

### **Database Connection Issues**

- Verify `.env.local` has correct Supabase credentials
- Ensure PostgreSQL client is installed
- Check network connectivity to Supabase

### **Permission Problems**

- Verify RLS policies are correctly applied
- Check super_admins table has your user ID
- Test with Super Admin (Mock Data) mode first

### **Mock Data Not Loading**

- Check console for errors
- Verify DevModeProvider wraps your app
- Try refreshing the page

## Security Notes

### **Production Safety**

- ✅ Dev mode switcher hidden in production
- ✅ Mock data unavailable in production builds
- ✅ Real authentication always required
- ✅ Database permissions still enforced

### **Development Security**

- ⚠️ Dev mode bypasses some auth checks
- ⚠️ Only use on local development
- ⚠️ Never commit with dev mode enabled
- ⚠️ Mock data contains no real personal information

---

## 🎉 Ready to Start!

1. **Run the database migration**: `./scripts/setup-database.sh`
2. **Start development server**: `npm run dev`
3. **Open the app** and look for the Dev Mode Switcher
4. **Start with "Super Admin (Mock Data)"** mode
5. **Create your first team** and start exploring!

The development mode system makes testing BoxCall features fast, safe, and comprehensive. Happy coding! 🏈

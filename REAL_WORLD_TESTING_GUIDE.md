# Using Your Real Team Data with BoxCall Dev Tools

## 🌍 Quick Start: Testing with Your Actual Team

The professional dev profile system gives you **3 powerful testing modes**:

### 1. 🏭 **Production Mode** - Your Real Team Data

```typescript
// Switch to production mode in QuickDevPanel
devMode: "production";

// Your actual team, players, achievements, calendar events
// Perfect for testing real-world scenarios with your data
```

### 2. 🛠️ **Professional Dev Profiles** - Realistic Test Data

```typescript
// Professional scenarios with realistic data
devMode: "dev_head_coach"; // Coach Sarah Martinez (8 years exp)
devMode: "dev_assistant_coach"; // Coach Mike Johnson (Defense)
devMode: "dev_player"; // Alex Thompson (Quarterback)
devMode: "dev_super_admin"; // Admin Jessica Chen (Full access)
```

### 3. 🆕 **Blank Slate** - New Coach Experience

```typescript
// True new user experience (no preloaded data)
devMode: "blank_slate";

// Perfect for testing onboarding flows
```

## 🚀 Real World Development Workflow

### Daily Development Routine

1. **Start with Production** - Test with your real team data
2. **Switch to Blank Slate** - Test new coach onboarding
3. **Use Professional Profiles** - Test specific role scenarios
4. **Back to Production** - Validate with real data

### Example Component Usage

```typescript
import { useDataContext } from './app/real-world-integration-hooks';

function DashboardComponent() {
  const {
    useRealData,
    useBlankSlate,
    useProfessionalDevData,
    dataSource
  } = useDataContext();

  if (useRealData) {
    // Show your actual team dashboard
    return <RealTeamDashboard />;
  }

  if (useBlankSlate) {
    // Show new coach onboarding
    return <NewCoachOnboarding />;
  }

  if (useProfessionalDevData) {
    // Show professional dev scenario
    return <ProfessionalDevDashboard />;
  }

  // Fallback to legacy mock data
  return <LegacyMockDashboard />;
}
```

## 🔧 Setting Up Your Real Team Data

### Step 1: Ensure Your Team is Set Up in Supabase

```sql
-- Check if you have teams in your database
SELECT * FROM teams WHERE created_by = 'your-user-id';

-- Check your team memberships
SELECT * FROM team_members WHERE user_id = 'your-user-id';
```

### Step 2: Use Production Mode for Real Data Testing

```typescript
// In QuickDevPanel, select:
"🌍 My Real Team - Your actual team and data";

// This will:
// ✅ Use your real Supabase data
// ✅ Show actual team members, events, achievements
// ✅ Test with real user permissions
// ✅ Enable dev tools for debugging
```

### Step 3: Test Realistic Scenarios with Dev Profiles

```typescript
// Switch between professional profiles to test:
// - How a head coach sees the app
// - How an assistant coach has different permissions
// - How a player experiences the interface
// - How a super admin manages everything
```

### Step 4: Validate New User Experience

```typescript
// Use blank slate to ensure:
// ✅ New coaches see proper onboarding
// ✅ No mock data leaks into new user flow
// ✅ Onboarding guides work correctly
// ✅ Empty states display properly
```

## 💡 Pro Tips for Real World Testing

### Mix Real and Test Data

```typescript
// Create a "Dev Copy" of your real team for testing
// This way you can:
// ✅ Test with realistic data structure
// ✅ Avoid affecting your real team data
// ✅ Have consistent test scenarios
```

### Use Development Environment Variables

```bash
# .env.local for development
VITE_SUPABASE_URL=your-dev-instance-url
VITE_SUPABASE_ANON_KEY=your-dev-key

# This lets you test with real patterns but separate data
```

### Smart Data Strategies

```typescript
// Strategy 1: Real data in development
useDataContext().useRealData;
// → Perfect for testing actual user flows

// Strategy 2: Professional dev profiles
useDataContext().useProfessionalDevData;
// → Perfect for testing role-specific scenarios

// Strategy 3: Blank slate
useDataContext().useBlankSlate;
// → Perfect for testing new user onboarding
```

## 🎯 Common Real World Testing Scenarios

### Testing Your Team Setup

```typescript
// Production mode with your data
1. Verify all team members appear correctly
2. Check permissions work as expected
3. Test calendar events display properly
4. Validate achievements system
5. Confirm data relationships are correct
```

### Testing Role-Based Access

```typescript
// Use professional dev profiles
1. dev_head_coach → Full coaching permissions
2. dev_assistant_coach → Limited coaching access
3. dev_player → Player-only features
4. dev_super_admin → Administrative capabilities
```

### Testing New Coach Onboarding

```typescript
// Blank slate mode
1. New coach sign-up flow
2. Team creation process
3. First player invitation
4. Initial setup wizard
5. Empty state handling
```

## 🚀 Next Steps

1. **Open QuickDevPanel** in your app
2. **Select "🌍 My Real Team"** to test with your data
3. **Switch to "🆕 Blank Slate"** to test new user flow
4. **Try Professional Profiles** for role-based testing
5. **Use this hybrid approach** for comprehensive testing

## 🎉 Benefits of This Approach

- ✅ **Real Data Testing** - Validate with your actual team data
- ✅ **Role-Based Testing** - Test different user perspectives
- ✅ **New User Testing** - Ensure great onboarding experience
- ✅ **Quick Switching** - Move between scenarios instantly
- ✅ **Data Safety** - Professional profiles don't affect real data
- ✅ **Comprehensive Coverage** - Test all aspects of your app

This gives you the **best of both worlds**: testing with your real team data when you need authenticity, and using professional profiles when you need specific role scenarios or blank slate testing!

Happy testing! 🚀

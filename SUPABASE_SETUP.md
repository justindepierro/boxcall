# 🔐 Supabase Integration Guide

## Quick Setup for Your Existing Supabase Project

Since you already have a working Supabase account, here's how to integrate it with BoxCall:

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Client Setup

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Auth Integration

Update your auth handlers in `App.tsx`:

```typescript
import { supabase } from "./lib/supabase";

// Login handler
const handleLogin = async (data: LoginCredentials) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    console.error("Login error:", error.message);
  }
};

// Signup handler
const handleSignup = async (data: SignupData) => {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: data.role,
      },
    },
  });
  if (error) {
    console.error("Signup error:", error.message);
  }
};

// Password reset handler
const handleResetPassword = async (data: ResetPasswordData) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email);
  if (error) {
    console.error("Reset error:", error.message);
  }
};
```

### 5. Database Schema (Football-Specific)

Run this SQL in your Supabase SQL editor:

```sql
-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('player', 'coach', 'admin', 'parent')),
  avatar_url TEXT,
  team_id UUID REFERENCES teams(id),
  position TEXT,
  jersey_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT,
  division TEXT,
  conference TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table (detailed player info)
CREATE TABLE public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  height TEXT,
  weight INTEGER,
  grade TEXT CHECK (grade IN ('Freshman', 'Sophomore', 'Junior', 'Senior')),
  gpa DECIMAL(3,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);
```

### 6. Auth State Management

Add to your Zustand store (`src/app/store.ts`):

```typescript
interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthSlice>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### 7. Auth Listener

Add to your main App component:

```typescript
useEffect(() => {
  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser({
        id: session.user.id,
        email: session.user.email!,
        name: profile?.name || "",
        role: profile?.role || "player",
        avatar: profile?.avatar_url,
        teamId: profile?.team_id,
        position: profile?.position,
        jerseyNumber: profile?.jersey_number,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

### 8. Next Steps for Migration

1. **Copy your existing Supabase project URL and keys**
2. **Run the database schema SQL**
3. **Install Supabase client package**
4. **Add environment variables**
5. **Update auth handlers to use Supabase methods**

Your existing Netlify deployment should work seamlessly with these changes!

## 🏈 Football-Specific Features Ready

- **Role-based access** (Player, Coach, Admin, Parent)
- **Team management** with roster tracking
- **Player profiles** with position and stats
- **Jersey number validation** (unique per team)
- **Grade/GPA tracking** for student-athletes

The Auth components are now fully integrated and Supabase-ready! 🚀

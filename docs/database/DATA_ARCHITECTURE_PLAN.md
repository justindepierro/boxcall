# 🏗️ **DATA ARCHITECTURE PLAN - 3-VIEW COACHING SYSTEM**

## 🎯 **OBJECTIVES**
- **Performance**: Sub-100ms response times for all operations
- **Security**: Multi-layer backup system with zero data loss tolerance
- **Scalability**: Handle 10,000+ plays per team without performance degradation
- **Offline Capability**: Core functionality works without internet connection

## 🚀 **SUPABASE SCHEMA DESIGN**

### **Core Tables**

```sql
-- Teams table (existing, enhanced)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Performance optimization
  play_count INTEGER DEFAULT 0,
  last_backup_at TIMESTAMPTZ,
  backup_version INTEGER DEFAULT 1
);

-- Playbooks table (new - separates concerns)
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Performance indexes
  play_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays table (enhanced for performance)
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  
  -- Core play data
  formation TEXT NOT NULL,
  play_name TEXT NOT NULL,
  one_word_play TEXT,
  p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
  
  -- Formation details
  personnel TEXT,
  f_type TEXT,
  f_dir TEXT,
  
  -- Play details
  protection TEXT,
  p_dir TEXT,
  r_str TEXT,
  p_str TEXT,
  
  -- Preferences
  pref_down TEXT,
  pref_dis TEXT,
  pref_hash TEXT,
  pref_cov TEXT,
  pref_front TEXT,
  
  -- Tags and categorization
  ftag1 TEXT,
  ftag2 TEXT,
  p_tag1 TEXT,
  p_tag2 TEXT,
  
  -- Additional data
  back_align TEXT,
  shift TEXT,
  motion TEXT,
  key_player1 TEXT,
  key_player2 TEXT,
  check_into TEXT,
  notes TEXT,
  
  -- Performance metrics
  confidence_base INTEGER DEFAULT 70,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  
  -- Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance optimization
  is_archived BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  complexity_score INTEGER,
  
  -- Full-text search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(play_name, '') || ' ' || 
      COALESCE(formation, '') || ' ' || 
      COALESCE(p_type, '') || ' ' ||
      COALESCE(notes, '')
    )
  ) STORED
);

-- Practice Scripts table (new)
CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date_planned DATE,
  total_duration INTEGER, -- in minutes
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  -- Performance optimization
  play_count INTEGER DEFAULT 0
);

-- Practice Script Plays (junction table with ordering)
CREATE TABLE practice_script_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  repetitions INTEGER DEFAULT 1,
  estimated_time INTEGER DEFAULT 4, -- in minutes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(script_id, order_number)
);

-- Game Plans table (new)
CREATE TABLE game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_number INTEGER,
  opponent TEXT,
  game_date DATE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  -- Performance optimization
  total_plays INTEGER DEFAULT 0
);

-- Game Plan Situations (Brian Billick methodology)
CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "1st & 10", "Red Zone", etc.
  description TEXT,
  category TEXT NOT NULL, -- "down_distance", "red_zone", "special"
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Plan Plays (junction with situational context)
CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5), -- 1=primary, 5=check-down
  notes TEXT,
  times_used INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, play_id)
);
```

### **PERFORMANCE INDEXES**

```sql
-- Full-text search optimization
CREATE INDEX idx_plays_search ON plays USING GIN(search_vector);

-- Common query patterns
CREATE INDEX idx_plays_playbook_type ON plays(playbook_id, p_type) WHERE is_archived = false;
CREATE INDEX idx_plays_formation ON plays(formation) WHERE is_archived = false;
CREATE INDEX idx_plays_updated ON plays(updated_at DESC);

-- Practice script optimization
CREATE INDEX idx_practice_scripts_team_date ON practice_scripts(team_id, date_planned DESC);
CREATE INDEX idx_script_plays_order ON practice_script_plays(script_id, order_number);

-- Game plan optimization
CREATE INDEX idx_game_plans_team_week ON game_plans(team_id, week_number DESC);
CREATE INDEX idx_situation_plays_priority ON game_plan_plays(situation_id, priority);
```

## 🚀 **PERFORMANCE OPTIMIZATION STRATEGIES**

### **1. Smart Caching Layer**

```typescript
// Multi-tier caching for sub-100ms response times
interface CacheStrategy {
  // Level 1: In-memory cache (instant)
  inMemory: Map<string, CachedData>;
  
  // Level 2: IndexedDB cache (fast)
  indexedDB: IDBDatabase;
  
  // Level 3: Supabase with optimized queries
  supabase: SupabaseClient;
}
```

### **2. Optimistic Updates**

```typescript
// UI updates instantly, syncs in background
const updatePlay = async (playId: string, updates: Partial<Play>) => {
  // 1. Update UI immediately
  updateLocalCache(playId, updates);
  
  // 2. Sync to Supabase in background
  try {
    await supabase.from('plays').update(updates).eq('id', playId);
  } catch (error) {
    // 3. Rollback and show error if sync fails
    rollbackLocalCache(playId);
    showSyncError();
  }
};
```

### **3. Incremental Loading**

```typescript
// Load data progressively
const loadPlaybook = async (playbookId: string) => {
  // 1. Load basic play list first (fast)
  const playHeaders = await loadPlayHeaders(playbookId);
  
  // 2. Load full play details on demand
  const fullPlay = await loadPlayDetails(playId); // when user clicks
  
  // 3. Preload likely-needed plays in background
  preloadRelatedPlays(currentPlay);
};
```

## 🔒 **BULLETPROOF BACKUP SYSTEM**

### **1. Automatic Local Backups**

```typescript
// Runs every 5 minutes in background
const createLocalBackup = async () => {
  const backup = {
    timestamp: new Date().toISOString(),
    version: getBackupVersion(),
    data: {
      plays: await getAllPlays(),
      practiceScripts: await getAllPracticeScripts(),
      gamePlans: await getAllGamePlans()
    }
  };
  
  // Store in IndexedDB (works offline)
  await saveToIndexedDB('backups', backup);
  
  // Keep last 50 backups (rolling)
  await cleanupOldBackups(50);
};
```

### **2. CSV Export Integration**

```typescript
// Enhanced CSV exports with metadata
const exportComprehensiveBackup = async (teamId: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Export all data types
  const playsCSV = await CSVService.exportPlaysToCSV(plays);
  const scriptsCSV = await CSVService.exportPracticeScriptsToCSV(scripts);
  const gamePlansCSV = await CSVService.exportGamePlansToCSV(gamePlans);
  
  // Create zip file with all exports
  const zip = new JSZip();
  zip.file(`plays-${timestamp}.csv`, playsCSV);
  zip.file(`practice-scripts-${timestamp}.csv`, scriptsCSV);
  zip.file(`game-plans-${timestamp}.csv`, gamePlansCSV);
  zip.file('backup-info.json', JSON.stringify({ timestamp, version }));
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `playbook-backup-${timestamp}.zip`);
};
```

### **3. Mobile Backup Strategy**

```typescript
// Capacitor-based mobile backup
import { Filesystem, Directory } from '@capacitor/filesystem';

const saveMobileBackup = async (data: BackupData) => {
  // Save to device storage
  await Filesystem.writeFile({
    path: `backups/playbook-${Date.now()}.json`,
    data: JSON.stringify(data),
    directory: Directory.Documents
  });
  
  // Notify user of backup location
  showToast('Backup saved to Documents/backups/');
};
```

## 📊 **REAL-TIME SYNC ARCHITECTURE**

### **Supabase Realtime Integration**

```typescript
// Real-time updates across devices
const setupRealtimeSync = (teamId: string) => {
  supabase
    .channel(`team-${teamId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'plays' },
      (payload) => {
        // Update local cache with remote changes
        updateLocalCache(payload.new);
        
        // Show notification if change from another user
        if (payload.new.updated_by !== currentUser.id) {
          showSyncNotification('Playbook updated by teammate');
        }
      }
    )
    .subscribe();
};
```

## 🎯 **IMPLEMENTATION PHASES**

### **Phase 1: Database Setup** (Week 1)
- [ ] Create Supabase tables and indexes
- [ ] Set up RLS (Row Level Security) policies
- [ ] Create performance monitoring

### **Phase 2: Caching Layer** (Week 2)
- [ ] Implement IndexedDB caching
- [ ] Add optimistic updates
- [ ] Create offline-first architecture

### **Phase 3: Backup System** (Week 3)
- [ ] Automatic local backups
- [ ] Enhanced CSV exports
- [ ] Mobile backup integration

### **Phase 4: Real-time Sync** (Week 4)
- [ ] Supabase realtime setup
- [ ] Conflict resolution
- [ ] Performance monitoring

## 🔍 **MONITORING & ANALYTICS**

```typescript
// Performance monitoring
const trackPerformance = () => {
  // Track key metrics
  analytics.track('query_performance', {
    operation: 'load_playbook',
    duration: performanceTimer.end(),
    cacheHit: wasCacheHit,
    recordCount: results.length
  });
};
```

**Success Metrics:**
- Query response time < 100ms (cached)
- Query response time < 500ms (database)
- Backup frequency: every 5 minutes
- Data loss incidents: 0
- Offline functionality: 95% of features work offline

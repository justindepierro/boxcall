# Formation Data Diagnostic - Browser Console Guide

Since your app is already running, you can check your formation data directly in the browser console!

## 🔍 Quick Check (Copy & Paste into Browser Console)

### 1. Basic Formation Count
```javascript
// Get all formations
const { data: formations } = await supabase
  .from('formations')
  .select('id, name, direction, opposite_formation_id, usage_count');

console.log(`Total formations: ${formations?.length || 0}`);
console.table(formations);
```

### 2. Check Formations Needing Opposites
```javascript
// Import the audit function
const { auditFormationDirections } = await import('./src/utils/formationAudit.ts');

// Get your playbook ID (replace with actual ID)
const playbookId = 'YOUR_PLAYBOOK_ID_HERE';

// Run audit
const results = await auditFormationDirections(playbookId);

console.log('Audit Results:', results);
console.table(results);

// Summary by priority
const highPriority = results.filter(r => r.severity === 'high');
const mediumPriority = results.filter(r => r.severity === 'medium');
const lowPriority = results.filter(r => r.severity === 'low');

console.log('\n📊 Priority Breakdown:');
console.log(`🔴 High Priority: ${highPriority.length}`);
console.log(`🟡 Medium Priority: ${mediumPriority.length}`);
console.log(`🟢 Low Priority: ${lowPriority.length}`);
```

### 3. Check Formations By Direction
```javascript
const { data: formations } = await supabase
  .from('formations')
  .select('*');

const leftFormations = formations?.filter(f => f.direction === 'left') || [];
const rightFormations = formations?.filter(f => f.direction === 'right') || [];
const noDirection = formations?.filter(f => !f.direction) || [];

console.log('📍 Direction Breakdown:');
console.log(`Left: ${leftFormations.length}`);
console.log(`Right: ${rightFormations.length}`);
console.log(`No direction: ${noDirection.length}`);

console.table(leftFormations);
console.table(rightFormations);
```

### 4. Check Which Formations Have Opposites
```javascript
const { data: formations } = await supabase
  .from('formations')
  .select('id, name, direction, opposite_formation_id, usage_count')
  .order('usage_count', { ascending: false });

const withOpposites = formations?.filter(f => 
  f.opposite_formation_id && f.opposite_formation_id !== f.id
) || [];

const standalone = formations?.filter(f => 
  f.opposite_formation_id === f.id
) || [];

const needingOpposites = formations?.filter(f => 
  f.direction && !f.opposite_formation_id
) || [];

console.log('✅ Formations with opposites:', withOpposites.length);
console.log('🔷 Standalone formations:', standalone.length);
console.log('⚠️  Formations needing opposites:', needingOpposites.length);

console.table(needingOpposites);
```

## 🎯 Even Easier: Use the UI!

Since Phase 1 is complete, you can just:

1. **Navigate to your app** (likely running at `http://localhost:5173`)
2. **Go to Formation Builder / Formation Manager**
3. **Click the "Direction Review" tab**
4. **See all formations grouped by priority!**

The UI will show you:
- Which formations need opposites
- Priority grouping (High/Med/Low)
- Usage counts for each formation
- Action buttons to fix them

## 📊 To Get Your Playbook ID

```javascript
// In browser console
const { data: playbooks } = await supabase
  .from('playbooks')
  .select('*');

console.table(playbooks);
// Copy the ID from the playbook you want to check
```

## 🔧 Alternative: Check via Network Tab

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to "Network" tab
3. Filter by "supabase"
4. Navigate to Formation Builder
5. Look at the API responses to see what formations are loaded

## ✨ Recommended Approach

**Just use the UI we built!** 

The Direction Review tab does all of this automatically:
- Loads all formations
- Groups by priority
- Shows which need opposites
- Lets you fix them with one click

Navigate to: **Formation Builder → Direction Review tab**

That's the whole point of Phase 1! 🎉

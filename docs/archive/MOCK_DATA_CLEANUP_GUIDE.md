# 🧹 Clear Mock Data from BoxCall Dashboard

This guide helps you remove all mock/demo data from your BoxCall dashboard to have a clean, production-ready experience.

## ✅ Changes Made

### 1. **Dashboard Default Mode**

- Changed default dev mode from `"production"` to `"blank_slate"`
- This ensures new users see a clean dashboard without mock data

### 2. **Sample Data Creation Disabled**

- Disabled `src/utils/create-sample-data.ts` to prevent mock data creation
- The function now returns an error instead of creating demo data

### 3. **Updated UI Messages**

- Changed "Demo Data Loaded Successfully" to "Database Connected"
- Updated empty state from "Run demo data loader" to "Create your first team"
- More professional, production-ready messaging

### 4. **Database Cleaner Script**

- Created `scripts/clear-demo-data.mjs` to remove existing demo data from database

## 🚀 How to Clear Mock Data

### Option 1: Clear Database Demo Data (Recommended)

```bash
# Run the database cleaner script
cd /Users/justindepierro/Documents/boxcall
node scripts/clear-demo-data.mjs
```

### Option 2: Switch to Blank Slate Mode

1. Open your dashboard at http://localhost:5173/
2. Open browser DevTools (F12)
3. Look for the BoxCall dev tools panel
4. Switch mode to "📄 Blank Slate"
5. Refresh the page

### Option 3: Set Production Mode

1. Open browser DevTools
2. Go to Console tab
3. Type: `localStorage.setItem('boxcall-dev-mode', 'blank_slate')`
4. Refresh the page

## 📊 What You'll See After Clearing

### Clean Dashboard Components:

- **Profile Card**: Shows your real profile information
- **Team Feeds**: Empty state with "No teams yet" message
- **Trophy Shelf**: Empty achievements waiting for real accomplishments
- **Calendar**: Clean calendar ready for real events
- **Database Display**: "Ready to Start" message instead of demo data

### Benefits:

- ✅ Professional, production-ready appearance
- ✅ No confusing mock data
- ✅ Clean slate for real team creation
- ✅ Authentic user experience

## 🎯 Next Steps

1. **Clear existing demo data** (run the script above)
2. **Create your first real team**
3. **Add real team members**
4. **Start using BoxCall with real data**

## 🔄 Re-enabling Demo Data (If Needed)

If you ever need demo data for testing:

1. Edit `src/utils/create-sample-data.ts`
2. Uncomment the implementation section
3. Run `node scripts/load-demo-data.mjs`
4. Switch dev mode to show the demo data

## 🎉 Result

Your BoxCall dashboard is now clean and ready for production use! No more mock data cluttering the interface.

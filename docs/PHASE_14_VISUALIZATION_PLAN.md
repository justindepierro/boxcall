# Phase 14: Visualization & Dashboards - Implementation Plan

**Date Started**: October 21, 2025  
**Status**: 🚧 IN PROGRESS  
**Goal**: Make data beautiful and actionable

---

## 📋 Overview

Transform BoxCall's analytics from data tables into stunning, actionable visualizations that coaches can use to make instant decisions and share with staff.

### Key Objectives:

1. **Session Analytics Dashboard** - Post-game/practice summary with charts
2. **Play Success Heatmap** - Visual field representation of success zones
3. **Confidence Trend Charts** - Track play confidence over time
4. **Export & Share** - Generate shareable reports

---

## 🎯 Phase 14.1: Session Analytics Dashboard

**Priority**: HIGH | **Effort**: Large | **Impact**: High

### What We're Building:

A comprehensive post-session summary page that shows:

- **Success Rate by Down/Distance** (bar chart)
- **Play Type Distribution** (pie/donut chart)
- **Yards Per Play Average** (line chart over time)
- **Formation Effectiveness** (horizontal bar chart)
- **Coverage Performance** (grouped bar chart - NEW from Phase 13)
- **Hash Success Rates** (3-column comparison - NEW from Phase 13)
- **Session Timeline** (line chart showing score/momentum)

### Technical Stack:

**Option 1: Recharts** (Recommended)

- ✅ React-native, composable
- ✅ Responsive out of the box
- ✅ Great TypeScript support
- ✅ MIT license
- ✅ Active maintenance

**Option 2: Victory**

- More animation options
- Heavier bundle size
- Steeper learning curve

**Decision**: Use **Recharts** for simplicity and bundle size.

### Installation:

```bash
npm install recharts
npm install --save-dev @types/recharts
```

### Component Structure:

```
src/components/analytics/
├── SessionAnalyticsDashboard.tsx    # Main dashboard (NEW)
├── charts/
│   ├── SuccessRateBarChart.tsx      # Down/distance success
│   ├── PlayTypeDistributionChart.tsx # Play type pie chart
│   ├── YardsPerPlayLineChart.tsx    # Yards over time
│   ├── FormationEffectivenessChart.tsx # Formation bars
│   ├── CoveragePerformanceChart.tsx  # Coverage grouped bars
│   ├── HashSuccessChart.tsx         # Hash 3-column comparison
│   └── SessionTimelineChart.tsx     # Game timeline
├── AnalyticsDashboard.tsx (existing)
└── AnalyticsProvider.tsx (existing)
```

### Data Services:

```typescript
// src/services/sessionAnalyticsService.ts (NEW)
interface SessionAnalytics {
  sessionId: string;
  sessionType: "game" | "practice";
  date: string;

  // Overall stats
  totalPlays: number;
  successRate: number;
  avgYardsPerPlay: number;

  // Breakdown by down/distance
  byDown: {
    down: number;
    attempts: number;
    successes: number;
    successRate: number;
    avgYards: number;
  }[];

  // Play type distribution
  byPlayType: {
    type: string;
    count: number;
    percentage: number;
    successRate: number;
  }[];

  // Formation effectiveness
  byFormation: {
    formationName: string;
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];

  // Coverage performance (Phase 13)
  byCoverage: {
    coverage: string;
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];

  // Hash success (Phase 13)
  byHash: {
    hash: "left" | "middle" | "right";
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];

  // Timeline data
  timeline: {
    playNumber: number;
    yardsGained: number;
    runningAverage: number;
    quarter?: number;
    time?: string;
  }[];
}
```

### Database Queries:

```sql
-- Get session analytics
CREATE OR REPLACE FUNCTION get_session_analytics(p_session_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'sessionId', ls.id,
    'sessionType', ls.session_type,
    'date', ls.created_at,
    'totalPlays', COUNT(*),
    'successRate', ROUND(AVG(CASE WHEN pe.result = 'success' THEN 1 ELSE 0 END) * 100, 1),
    'avgYardsPerPlay', ROUND(AVG(pe.yards_gained), 1),
    'byDown', (
      SELECT json_agg(down_stats)
      FROM (
        SELECT
          pe.down,
          COUNT(*) as attempts,
          SUM(CASE WHEN pe.result = 'success' THEN 1 ELSE 0 END) as successes,
          ROUND(AVG(CASE WHEN pe.result = 'success' THEN 1 ELSE 0 END) * 100, 1) as success_rate,
          ROUND(AVG(pe.yards_gained), 1) as avg_yards
        FROM play_executions pe
        WHERE pe.session_id = p_session_id
        GROUP BY pe.down
        ORDER BY pe.down
      ) down_stats
    ),
    'byCoverage', (
      SELECT json_agg(coverage_stats)
      FROM (
        SELECT
          pe.opponent_coverage as coverage,
          COUNT(*) as attempts,
          ROUND(AVG(CASE WHEN pe.result = 'success' THEN 1 ELSE 0 END) * 100, 1) as success_rate,
          ROUND(AVG(pe.yards_gained), 1) as avg_yards
        FROM play_executions pe
        WHERE pe.session_id = p_session_id AND pe.opponent_coverage IS NOT NULL
        GROUP BY pe.opponent_coverage
        ORDER BY attempts DESC
      ) coverage_stats
    ),
    'byHash', (
      SELECT json_agg(hash_stats)
      FROM (
        SELECT
          pe.hash_mark as hash,
          COUNT(*) as attempts,
          ROUND(AVG(CASE WHEN pe.result = 'success' THEN 1 ELSE 0 END) * 100, 1) as success_rate,
          ROUND(AVG(pe.yards_gained), 1) as avg_yards
        FROM play_executions pe
        WHERE pe.session_id = p_session_id AND pe.hash_mark IS NOT NULL
        GROUP BY pe.hash_mark
        ORDER BY CASE pe.hash_mark WHEN 'left' THEN 1 WHEN 'middle' THEN 2 WHEN 'right' THEN 3 END
      ) hash_stats
    )
  ) INTO result
  FROM live_sessions ls
  LEFT JOIN play_executions pe ON pe.session_id = ls.id
  WHERE ls.id = p_session_id
  GROUP BY ls.id, ls.session_type, ls.created_at;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### UI/UX Design:

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│  📊 Game Session Analytics - vs Eagles (Oct 21)     │
│  Final Score: 28-21 | 45 Total Plays                │
└─────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬────────┐
│ Success Rate │   Avg Yards  │ Total Plays  │ Export │
│    73.3%     │     5.2      │      45      │   📄   │
└──────────────┴──────────────┴──────────────┴────────┘

┌────────────────────────────────────────────────────┐
│  Success Rate by Down                              │
│  ████████████████ 1st: 80% (20 plays)             │
│  ███████████ 2nd: 70% (15 plays)                  │
│  █████████ 3rd: 60% (10 plays)                    │
└────────────────────────────────────────────────────┘

┌────────────────────┬───────────────────────────────┐
│  Play Type Mix     │  Formation Effectiveness      │
│  [PIE CHART]       │  [BAR CHART]                  │
│  Run: 55%          │  Spread: 85%                  │
│  Pass: 45%         │  I-Form: 70%                  │
└────────────────────┴───────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Coverage Performance (Phase 13)                   │
│  Cover 2: ████████████ 85% (12 plays)            │
│  Cover 3: ██████ 60% (8 plays)                    │
│  Man: ████████ 75% (4 plays)                      │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Hash Success Comparison (Phase 13)                │
│  Left: 70%     Middle: 80% ⭐    Right: 75%       │
│  [3-column visual bars]                            │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Session Timeline                                  │
│  [LINE CHART: Yards per play over time]           │
│  Shows momentum and trends                         │
└────────────────────────────────────────────────────┘
```

### Color Palette (Using Design System):

```typescript
const CHART_COLORS = {
  success: "var(--color-success-500)", // Green
  warning: "var(--color-warning-500)", // Yellow
  error: "var(--color-error-500)", // Red
  primary: "var(--color-jade-600)", // Jade
  secondary: "var(--color-surface-tertiary)", // Gray
  run: "#3b82f6", // Blue
  pass: "#8b5cf6", // Purple
  special: "#f59e0b", // Orange
};
```

---

## 🗺️ Phase 14.2: Play Success Heatmap

**Priority**: MEDIUM | **Effort**: Medium | **Impact**: Medium

### What We're Building:

Visual football field representation showing success rates by field zone.

### Field Zones:

```
Own End Zone (0-10)
Own 10-25
Own 25-40
Own 40-50 (Midfield)
Opp 50-40
Opp 40-25 (Red Zone Approach)
Opp 25-10 (Red Zone)
Opp 10-Goal (Goal Line)
```

### Color Coding:

- **90%+**: Dark Green (#15803d)
- **75-89%**: Green (#22c55e)
- **60-74%**: Yellow (#eab308)
- **45-59%**: Orange (#f97316)
- **<45%**: Red (#dc2626)

### Component:

```typescript
// src/components/analytics/PlaySuccessHeatmap.tsx
interface HeatmapData {
  zone: string;
  yardLine: number;
  attempts: number;
  successRate: number;
  avgYards: number;
}
```

### Visual Representation:

Use SVG to draw football field with clickable zones.

---

## 📈 Phase 14.3: Confidence Trend Charts

**Priority**: MEDIUM | **Effort**: Medium | **Impact**: Medium

### What We're Building:

Line charts showing how play confidence evolves over time.

### Features:

- **Play-specific trends** - Single play confidence over weeks
- **Formation trends** - Formation family confidence
- **Overall playbook health** - Average confidence trend
- **Practice impact visualization** - Show practice reps boosting confidence

### Component:

```typescript
// src/components/analytics/ConfidenceTrendChart.tsx
interface TrendData {
  date: string;
  confidence: number;
  gamesPlayed: number;
  practiceReps: number;
  annotation?: string; // "Big win vs Eagles"
}
```

---

## 📤 Phase 14.4: Export & Share

**Priority**: HIGH | **Effort**: Medium | **Impact**: High

### Export Formats:

1. **PDF Report** - Use `jsPDF` + `html2canvas`
2. **PNG/Image** - Screenshot of dashboard
3. **CSV Data** - Raw numbers
4. **Share Link** - URL with read-only access

### Implementation:

```bash
npm install jspdf html2canvas
```

```typescript
// src/services/exportService.ts (extend existing)
class SessionAnalyticsExportService {
  static async exportToPDF(sessionId: string): Promise<void>;
  static async exportToImage(element: HTMLElement): Promise<Blob>;
  static async generateShareLink(sessionId: string): Promise<string>;
}
```

---

## 🗓️ Implementation Timeline

### Week 1 (Days 1-3):

- ✅ Install Recharts
- ✅ Create SessionAnalyticsService
- ✅ Build database functions
- ✅ Create basic chart components

### Week 1 (Days 4-5):

- Build SessionAnalyticsDashboard layout
- Integrate chart components
- Add responsive design
- Test with real data

### Week 2 (Days 1-2):

- Build PlaySuccessHeatmap (SVG field)
- Add click interactions
- Color coding logic

### Week 2 (Days 3-4):

- Build ConfidenceTrendChart
- Add annotations
- Practice impact visualization

### Week 2 (Day 5):

- Export functionality (PDF, PNG, CSV)
- Share link generation
- Polish and testing

---

## 🎨 Design Principles

1. **Mobile-First**: Charts must work on phones (coaches use iPads on sideline)
2. **Colorblind-Friendly**: Use patterns + colors
3. **Print-Friendly**: Black & white exports must be readable
4. **Fast Loading**: Lazy load heavy charts
5. **Actionable**: Every chart should answer a coaching question

---

## 📊 Success Metrics

- [ ] Session analytics load in <1 second
- [ ] Charts render correctly on mobile/tablet/desktop
- [ ] PDF exports generate in <3 seconds
- [ ] User can answer "What's my 3rd down success rate?" in 5 seconds
- [ ] Heatmap shows clear field position strengths/weaknesses

---

## 🔗 Integration Points

### Existing Systems:

- ExecutionTrackingService (Phase 13)
- PlayConfidenceService (Phase 11)
- SituationalRecommender (Phase 13)
- AnalyticsDashboard (existing)

### New Systems:

- SessionAnalyticsService (NEW)
- ChartConfigService (NEW)
- ExportService (extend existing)

---

## 🚀 Next Steps

1. Install Recharts
2. Create SessionAnalyticsService
3. Build first chart (SuccessRateBarChart)
4. Test with real session data
5. Iterate on design

Let's start building! 🎉

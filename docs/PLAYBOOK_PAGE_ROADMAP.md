# 🏈 Playbook Page Implementation Roadmap

## 📝 Overview

The Playbook page will be the heart of BoxCall's tactical system - where coaches create, organize, and manage their team's plays, formations, and strategic content. This page needs to balance professional coaching tools with intuitive design.

## 🎯 Core Vision

**"Digital playbook that coaches actually want to use"**

- **Builder Mode First**: Primary interface for coaches to create plays step-by-step
- CSV Import capability for existing playbooks and bulk data entry
- Visual play creation with drag-and-drop
- Organized play categorization and tagging
- Quick search and filtering for game situations
- Integration with practice planning and game preparation
- Professional PDF export for physical playbooks
- Play Diagram Editor integration (future phase)

## 🗺️ Implementation Roadmap

### ✅ Phase 1: Foundation & Architecture (COMPLETE)

**Goal**: Solid foundation with basic play management

#### 1.1 Data Models & Types

- [x] Play interface definition (formation, routes, assignments)
- [x] Formation types (I-Formation, Shotgun, Pistol, etc.)
- [x] Position definitions (QB, RB, WR1-3, TE, etc.)
- [x] Route types (Slant, Out, Go, Post, Curl, etc.)
- [x] Play categories (Offense, Defense, Special Teams)
- [x] Tags system (Down & Distance, Situation, Personnel)

#### 1.2 Page Structure & Layout

- [x] Main playbook layout with sidebar navigation
- [x] Play grid/list view with preview cards
- [x] Play detail view for editing/viewing
- [x] Search and filter interface
- [x] Category organization sidebar

#### 1.3 Basic CRUD Operations

- [x] **Builder Mode Interface**: Step-by-step play creation wizard (PRIMARY)
- [x] **CSV Import System**: Bulk import existing playbooks and data
- [x] Create new play (basic form)
- [x] Edit existing plays
- [x] Delete plays with confirmation
- [x] Duplicate plays for variations
- [x] Save/auto-save functionality
- [x] **Play Diagram Button**: Scaffold integration with Play Editor (future)

**🎉 PHASE 1 ACHIEVEMENTS:**

- ✅ Professional Playbook page with coaching-first design
- ✅ 6-step Builder Mode wizard with progress tracking
- ✅ Visual play cards with success metrics and one-word calls
- ✅ Smart filtering by formation, play type, down, distance, tags
- ✅ CSV import system with 4-step workflow (upload→mapping→preview→complete)
- ✅ Demo data with 6 realistic football plays for immediate testing
- ✅ TypeScript types perfectly aligned with existing database schema
- ✅ Component architecture ready for Phase 2 visual expansion
- ✅ Professional coaching UX with real terminology and workflows

### ✅ Phase 2: Visual Play Builder (COMPLETE)

**Goal**: Interactive play creation with field visualization

#### 2.1 Field Canvas Component

- [x] **NFHS-Compliant Football Field**: Accurate 53⅓ yard field with proper dimensions
- [x] **6 Background Modes**: Football field, red zone, blank, lines, grid, dots
- [x] **Professional Field Markings**: Yard lines, hash marks, and proper orientation
- [x] **Responsive Scaling**: Field adapts to different screen sizes
- [x] **Zoom Controls**: 0.5x to 3.0x zoom with smooth controls
- [x] **Interactive Canvas**: Fabric.js 6.7.1 integration for professional interaction

#### 2.2 Player Position System

- [x] **Draggable Player Icons**: Position-specific colors (QB=Blue, RB=Red, WR=Green, etc.)
- [x] **Formation Templates**: Pre-built offensive formations with proper spacing
- [x] **Position Labels**: Dynamic positioning with jersey numbers
- [x] **Constraint System**: Players stay within field boundaries
- [x] **Real-time Updates**: Live position tracking and updates

#### 2.3 Route Drawing Tools

- [x] **Professional Drawing Tools**: 9-tool palette with coaching standards
- [x] **Route Styles**: Solid, dashed, hot (red), option (blue), motion (green)
- [x] **Player Tools**: QB, RB, WR, TE with position-specific colors
- [x] **Text Annotations**: Yard markers, alerts, coaching notes
- [x] **Quick Annotations**: Instant 5YDS, 10YDS, HOT, ALERT buttons
- [x] **Color Selection**: 6-color palette for route customization
- [x] **Arrow Tools**: Direction indicators for complex plays

**� PHASE 2 ACHIEVEMENTS:**

- ✅ **EnhancedFieldCanvas**: NFHS-compliant field with 6 background modes
- ✅ **FieldBackgrounds Component**: Professional field rendering system
- ✅ **DrawingTools Component**: Coaching-grade annotation and route tools
- ✅ **Fabric.js Integration**: Professional canvas library with v6 API
- ✅ **Interactive Play Builder**: Modal interface with full drawing capabilities
- ✅ **Professional Standards**: Based on real coaching diagram requirements
- ✅ **TypeScript Perfect**: Zero lint errors, proper type safety
- ✅ **Mobile Ready**: Responsive design with touch optimization
- ✅ **Zoom & Pan**: Professional field navigation controls
- ✅ **Tool Integration**: Drawing tools seamlessly integrated with field canvas

### ✅ Phase 2.5: Enhanced Play Management (COMPLETE)

**Goal**: Professional play card design with advanced naming and display systems

#### 2.5.1 Custom Play Name Generation

- [x] **Intelligent Field Concatenation**: Formation + direction + tags + motion + protection + core play
- [x] **One-Word Call Integration**: Priority system for coaching audibles
- [x] **Smart Field Mapping**: Accurate database schema alignment (ftag1, ftag2, f_dir, p_dir, etc.)
- [x] **Coaching Logic**: Suppress redundant directional tags for specific formations
- [x] **Fallback Handling**: Graceful handling of incomplete play data

#### 2.5.2 Professional Play Card Design

- [x] **MonoCode Typography**: Technical, coaching-friendly font aesthetic
- [x] **Expand/Collapse Functionality**: Skinny mode for scanning, detailed view for analysis
- [x] **One-Word Call Toggle**: Global toggle between full names and coaching calls
- [x] **Color-Coded Play Types**: Visual identification (Pass=blue, Run=green, RPO=purple, Play Action=orange)
- [x] **Confidence Color Coding**: Green (80%+), Yellow (60%+), Red (<60%)
- [x] **Italic Subtitle Display**: Full names shown underneath one-word calls

#### 2.5.3 Comprehensive Data Display

- [x] **Formation Details Section**: Base formation, direction, tags, alignment, shifts, motion
- [x] **Play Details Section**: Core play, direction, protection, tags, run/pass strength
- [x] **Usage & Stats Section**: Success rate, times called/successful, situational preferences
- [x] **Notes & Tags Section**: Coaching notes and categorization tags
- [x] **Responsive Grid Layout**: 3-column layout on desktop, stacked on mobile
- [x] **Icon Integration**: Target, Hash, Clock icons for section identification

**🏆 PHASE 2.5 ACHIEVEMENTS:**

- ✅ **Custom Play Name Utils**: Professional naming logic with field concatenation
- ✅ **Enhanced PlayCard Component**: MonoCode fonts with expand/collapse functionality
- ✅ **One-Word Call System**: Toggle between coaching calls and full tactical names
- ✅ **Professional Typography**: Coaching-grade design with technical aesthetics
- ✅ **Comprehensive Stats Display**: All play data organized in coaching-friendly sections
- ✅ **Color-Coded Organization**: Visual play type and confidence identification
- ✅ **Play Action Support**: Added to TypeScript types and demo data
- ✅ **Mobile-Optimized Design**: Responsive layout for coaching on the go

### 🎯 Phase 3: Advanced Coaching Features (NEXT)

**Goal**: Professional coaching tools and enhanced play organization

#### 3.1 Play Organization

- [ ] Folder/category system for plays
- [ ] Tag-based organization
- [ ] Favorite plays system
- [ ] Recent plays tracking
- [ ] Play sequence creation (series)

#### 3.2 Search & Filtering

- [ ] Text search across play names and descriptions
- [ ] Filter by formation type
- [ ] Filter by down & distance
- [ ] Filter by personnel grouping
- [ ] Filter by play success rate (future)

#### 3.3 Play Variations

- [ ] Base play with multiple variations
- [ ] Hot routes and audibles
- [ ] Automatic route adjustments
- [ ] Check-down options
- [ ] Red zone adaptations

### Phase 4: Integration & Sharing (Week 4)

**Goal**: Connect with practice planning and team sharing

#### 4.1 Practice Integration

- [ ] Link plays to practice blocks
- [ ] Play installation tracking
- [ ] Practice script generation
- [ ] Rep counting and tracking
- [ ] Installation progress monitoring

#### 4.2 Export & Sharing

- [ ] PDF playbook generation
- [ ] Individual play cards
- [ ] Practice script exports
- [ ] Share plays with assistants
- [ ] Print-friendly formats

#### 4.3 Game Preparation

- [ ] Game plan creation from playbook
- [ ] Situation-specific play calling sheets
- [ ] Down & distance recommendations
- [ ] Personnel package organization
- [ ] Quick-access play cards

## 🎨 UI/UX Design Concepts

### Main Layout Ideas

```
┌─────────────────────────────────────────────────────────────┐
│ 🏈 BoxCall Playbook                    [Search] [+ New Play] │
├─────────────────────────────────────────────────────────────┤
│ Sidebar                │ Main Content Area                   │
│ ┌─────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ 📁 Categories       │ │ │         Play Grid               │ │
│ │   • Offense         │ │ │ ┌─────┐ ┌─────┐ ┌─────┐        │ │
│ │   • Defense         │ │ │ │Play1│ │Play2│ │Play3│        │ │
│ │   • Special Teams   │ │ │ └─────┘ └─────┘ └─────┘        │ │
│ │                     │ │ │                                 │ │
│ │ 🏷️ Tags              │ │ │ ┌─────┐ ┌─────┐ ┌─────┐        │ │
│ │   • 3rd & Short     │ │ │ │Play4│ │Play5│ │Play6│        │ │
│ │   • Red Zone        │ │ │ └─────┘ └─────┘ └─────┘        │ │
│ │   • Two Minute      │ │ │                                 │ │
│ │                     │ │ └─────────────────────────────────┘ │
│ │ ⭐ Favorites         │ │                                     │
│ │ 📋 Recent           │ │                                     │
│ └─────────────────────┘ │                                     │
└─────────────────────────────────────────────────────────────┐
```

### Play Card Design

```
┌─────────────────────────┐
│ 🏈 Traffic              │
│ Formation: Trio Right   │
│ One Word: "Traffic"     │
│ ┌─────────────────────┐ │
│ │   [Field Preview]   │ │
│ │     🔵 🔵 🔵       │ │
│ │       🔴           │ │
│ │   /assets/diagrams  │ │
│ └─────────────────────┘ │
│ Type: Drop | Tight Bunch│
│ Confidence: 70%         │
│ [Edit] [Duplicate]      │
│ [📐 Create Diagram]     │
└─────────────────────────┘
```

### Play Builder Interface (Coach-First Design)

```
┌─────────────────────────────────────────────────────────────┐
│ Play Builder: Step 2/6 - Formation Setup   [Save Draft] [X] │
├─────────────────────────────────────────────────────────────┤
│ Progress: ●●○○○○                                             │
│ ┌─────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ Formation Setup     │ │ │         Live Preview           │ │
│ │                     │ │ │                                 │ │
│ │ Base Formation:     │ │ │   Formation: Trio Right        │ │
│ │ [Trio      ▼]      │ │ │                                 │ │
│ │                     │ │ │   🔵────🔵────🔵────🔵────🔵   │ │
│ │ Direction:          │ │ │              🔴                 │ │
│ │ ● Right  ○ Left     │ │ │                                 │ │
│ │                     │ │ │   Personnel: Regular (11)      │ │
│ │ Formation Tags:     │ │ │                                 │ │
│ │ ☑ Far              │ │ │                                 │ │
│ │ ☐ Near             │ │ │                                 │ │
│ │ ☐ Flex             │ │ │                                 │ │
│ │                     │ │ │                                 │ │
│ │ Back Alignment:     │ │ │                                 │ │
│ │ [Default    ▼]     │ │ │                                 │ │
│ │                     │ │ │                                 │ │
│ │     [← Back] [Next →] │ │ │                                 │ │
│ └─────────────────────┘ │ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technical Implementation

### ✅ Recent Technical Achievements (Phase 2.5)

#### Enhanced Component Architecture

- **PlayCard.tsx**: Completely rewritten with MonoCode fonts, expand/collapse functionality
- **PlayGrid.tsx**: Updated with one-word call toggle and vertical layout optimization
- **playNameUtils.ts**: New utility module with intelligent play name generation
- **Enhanced Type Support**: Added "Play Action" to PlayType union with proper TypeScript integration

#### Advanced Play Name Generation

```typescript
// Intelligent field concatenation logic
export function generatePlayName(play: Play): string {
  // Formation + Direction + Tags + Motion + Protection + Core + Direction + Tags
  // Example: "Gun Spread Wide Trips Big Four Verticals Middle"
  // Or: "TRAFFIC" (one-word priority)
}

export function getDisplayName(play: Play, showOneWord: boolean): string {
  // Toggle logic for coaching display modes
}
```

#### Professional UI Components

- **MonoCode Typography**: Technical coaching aesthetic with `font-mono` class
- **Expandable Cards**: Skinny scanning mode + detailed analysis view
- **Color-Coded Systems**: Play types, confidence levels, and status indicators
- **Responsive Design**: Mobile-optimized with touch-friendly controls

### Core Components Architecture

```
src/pages/PlaybookPage.tsx
├── components/playbook/
│   ├── PlayGrid.tsx              # Grid view of all plays
│   ├── PlayCard.tsx              # Individual play preview card
│   ├── PlayDetail.tsx            # Detailed play view/edit
│   ├── PlayBuilder/              # PRIMARY COACH INTERFACE
│   │   ├── PlayBuilderWizard.tsx # Step-by-step play creation
│   │   ├── FormationStep.tsx     # Formation selection & config
│   │   ├── ProtectionStep.tsx    # Protection scheme setup
│   │   ├── MotionStep.tsx        # Pre-snap motion/shifts
│   │   ├── TaggingStep.tsx       # Tags & situational data
│   │   ├── PreferencesStep.tsx   # Down/distance/hash prefs
│   │   └── ReviewStep.tsx        # Final review before save
│   ├── CSVImport/
│   │   ├── CSVUploader.tsx       # File upload interface
│   │   ├── CSVMapper.tsx         # Column mapping tool
│   │   ├── CSVPreview.tsx        # Import preview/validation
│   │   └── CSVProcessor.tsx      # Data transformation
│   ├── PlayFilters.tsx           # Search and filter sidebar
│   ├── PlayCategories.tsx        # Category organization
│   ├── PlayExporter.tsx          # PDF/print functionality
│   └── PlayDiagramButton.tsx     # Integration scaffold for Play Editor
├── services/playbook/
│   ├── playbookService.ts        # API calls
│   ├── playValidation.ts         # Play data validation
│   ├── csvImportService.ts       # CSV processing logic
│   └── exportService.ts          # Export functionality
├── types/
│   ├── play.ts                   # Play data structures (matches DB)
│   ├── csvMapping.ts             # CSV import types
│   └── playBuilder.ts            # Builder wizard types
└── hooks/
    ├── usePlaybook.ts            # Main playbook state
    ├── usePlayBuilder.ts         # Builder wizard state
    ├── useCSVImport.ts           # CSV import workflow
    └── usePlayFilters.ts         # Filtering and search
```

### Database Schema Integration (Based on Existing Schema)

```typescript
// Updated to match existing database structure
interface Play {
  id: string;
  playbook_id: string;
  formation: string; // Main formation name
  f_dir?: string; // Formation direction/strength
  ftag1?: string; // Formation tag 1
  ftag2?: string; // Formation tag 2
  back_align?: string; // RB alignment
  shift?: string; // Formation shift
  motion?: string; // Pre-snap motion
  protection?: string; // Protection scheme
  play_name: string; // Main play name
  one_word_play?: string; // "Corndog" style audible call
  p_tag1?: string; // Play tag 1
  p_tag2?: string; // Play tag 2
  p_dir?: string; // Play direction
  f_type?: string; // Formation type (10P, 11P, etc)
  p_type: "Pass" | "Run" | "RPO"; // Play type
  key_player1?: string; // Key player identifier
  key_player2?: string; // Second key player
  pref_down?: string; // Preferred down
  pref_dis?: string; // Preferred distance
  pref_hash?: string; // Preferred hash
  pref_cov?: string; // Preferred coverage
  pref_front?: string; // Preferred front
  check_into?: string; // Check/audible options
  r_str?: string; // Run strength
  p_str?: string; // Pass strength
  personnel?: string; // Personnel grouping
  confidence_base: number; // Base confidence (default 70)
  success_rate?: number; // Historical success rate
  times_called: number; // Usage tracking
  times_successful: number; // Success tracking
  diagram_url?: string; // Play diagram image
  video_url?: string; // Instructional video
  notes?: string; // Additional notes
  tags?: string[]; // Flexible tagging
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface CSVImportMapping {
  personnel: string;
  formation: string;
  formDir: string;
  fTag1: string;
  fTag2: string;
  fTag3: string;
  backAlign: string;
  shift: string;
  motion: string;
  action: string;
  protection: string;
  play: string; // Maps to play_name
  playDir: string;
  backsideRoute: string;
  oneWordPlay: string; // Critical for audibles!
  pTag1: string;
  pTag2: string;
  // ... (all other CSV columns)
}
```

## 🎮 User Experience Flow

### New Play Creation (Builder Mode - PRIMARY)

1. **Play Name & Type**: Basic info and play type selection
2. **Formation Setup**: Choose formation, direction, tags, alignment
3. **Protection & Motion**: Set protection scheme, shifts, motion
4. **Play Details**: Routes, direction, key players
5. **Situational Preferences**: Down/distance/hash/coverage preferences
6. **One Word Call**: Set audible/code word (like "Corndog")
7. **Review & Save**: Final review with auto-generated preview

### CSV Import Workflow (Bulk Entry)

1. **Upload CSV**: Drag & drop or file select
2. **Column Mapping**: Map CSV columns to database fields
3. **Data Validation**: Check for errors and conflicts
4. **Preview Import**: Review plays before final import
5. **Bulk Import**: Process all valid plays
6. **Review Results**: Summary of successful/failed imports

### Play Diagram Integration (Future)

1. **"Create Diagram" Button**: Available on each play card
2. **Navigation to Editor**: Seamless transition to Play Editor
3. **Data Passing**: Send play data to diagram editor
4. **Return Integration**: Save diagram back to play record
5. **Preview Integration**: Show diagram thumbnails in playbook

### Play Organization

1. **Browse**: Grid view with visual previews
2. **Search**: Text search with smart filters
3. **Filter**: By formation, situation, tags
4. **Organize**: Drag to categories, add to favorites
5. **Share**: Export individual plays or full categories

### Practice Integration

1. **Script Building**: Add plays to practice blocks
2. **Installation**: Track which plays team knows
3. **Progression**: Build from basic to complex
4. **Evaluation**: Track success rates and adjustments

## 📋 Manual Entry Checklist

When you return, feel free to add your thoughts on:

### Design Preferences

- [ ] **Field Orientation**: Horizontal vs Vertical field layout
- [ ] **Color Scheme**: Player position colors and field styling
- [ ] **Icon Style**: Realistic vs abstract player representations
- [ ] **Layout Priority**: Sidebar-heavy vs full-width design

### Feature Priorities

- [ ] **Must-Have Features**:
  - [ ] Builder Mode wizard (primary interface)
  - [ ] CSV import for existing playbooks
  - [ ] One-word play calls/audibles
  - [ ] Formation and protection setup
  - [ ] Situational preferences (down/distance/etc)
- [ ] **Nice-to-Have**:
  - [ ] Visual field diagrams (Phase 2)
  - [ ] Advanced analytics and success tracking
  - [ ] Video integration
  - [ ] Mobile-optimized builder
- [ ] **Coach Workflow**: How coaches actually use playbooks
- [ ] **Mobile Considerations**: Tablet/phone usage patterns

### Integration Points

- [ ] **Practice Connection**: How plays link to practice planning
- [ ] **Game Prep**: Game plan creation from playbook
- [ ] **Player Access**: What players see vs coaches
- [ ] **Assistant Coaches**: Collaboration and permissions
- [ ] **Play Diagram Editor**: Future integration for visual play creation
- [ ] **CSV Export/Import**: Bidirectional data exchange with other systems

### Technical Concerns

- [ ] **Performance**: Large playbook handling
- [ ] **Storage**: Local vs cloud play storage
- [ ] **Offline**: Offline playbook access needs
- [ ] **Export**: PDF quality and formatting requirements

---

**Next Steps**:

1. 🏃‍♂️ Your run + design sketches
2. 📝 Manual roadmap updates based on your vision
3. 🏗️ Begin Phase 1 implementation (Builder Mode first!)
4. 🎨 Iterate on design based on your drawings

## 🗄️ Database Schema Context

**Existing Table Structure:**

- Rich coaching terminology already captured
- Formation tags, protection schemes, motion calls
- Situational preferences (down, distance, hash, coverage)
- Success tracking and confidence ratings
- Diagram/video URL storage ready

**Key Missing Field Identified:**

- ✅ **one_word_play** field (the "Corndog" audible calls) - needs to be added to database

**CSV Import Ready:**

- Existing CSV structure matches database fields
- All coaching terminology preserved
- Bulk import capability for existing playbooks

Enjoy your run! The builder mode will make this incredibly coach-friendly! 🏈

lets me add some context of whats in our database for play book

create table public.plays (
id uuid not null default gen_random_uuid (),
playbook_id uuid not null,
formation text not null, this is the offensive formation
f_dir text null, this is the offensive strength of formation or direction
ftag1 text null, this is a tag on the formation
ftag2 text null, this is a second tag on the formation
back_align text null, this tell the running back how to allign
shift text null, this is a shift in the offensive formation
motion text null, this is a motion in the offensive formation
protection text null, this is the protection call
play_name text not null, this is the play name
p_tag1 text null, this is a play tag
p_tag2 text null, this is a second play tag
p_dir text null, this is the play direction
f_type text null, this is the type of formation (10P, 11P, Empty etc)
p_type text not null, this is play type (run, pass, play action, screenm, RPO etc)
key_player1 text null, this is a key player tag (could be a name @ or a # or just a typed name)
key_player2 text null, this is the second key player
pref_down text null, this is prefered down to run this play
pref_dis text null, this is the preferred distance to run the play
pref_hash text null, this is the prefeered hash to run the play
pref_cov text null, this is the preferred coverage to run the play
pref_front text null, this is the preferred front to run the play
check_into text null,
r_str text null,
p_str text null,
personnel text null,
confidence_base numeric(5, 2) null default 70.0,
success_rate numeric(5, 2) null,
times_called integer null default 0,
times_successful integer null default 0,
diagram_url text null,
video_url text null,
notes text null,
tags text[] null,
created_by uuid not null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint plays_pkey primary key (id),
constraint plays_created_by_fkey foreign KEY (created_by) references auth.users (id),
constraint plays_playbook_id_fkey foreign KEY (playbook_id) references playbooks (id) on delete CASCADE,
constraint plays_p_type_check check (
(
p_type = any (array['Pass'::text, 'Run'::text, 'RPO'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_plays_playbook_id on public.plays using btree (playbook_id) TABLESPACE pg_default;

create index IF not exists idx_plays_formation on public.plays using btree (formation) TABLESPACE pg_default;

create index IF not exists idx_plays_p_type on public.plays using btree (p_type) TABLESPACE pg_default;

create index IF not exists idx_plays_pref_down on public.plays using btree (pref_down) TABLESPACE pg_default;

create index IF not exists idx_plays_pref_dis on public.plays using btree (pref_dis) TABLESPACE pg_default;

hereis the csv we were working with

there should be a One Word or Code word column. A lot of teams call their complicated plays one word (remember the Kansas City Cheifs Calling "Corndog"... its kinda like an audible. that needs to be collected.

personnel formation formDir fTag1 fTag2 fTag3 backAlign shift motion action protection play playDir backsideRoute oneWordPlay pTag1 pTag2 backRoute checkInto1 checkInto2 keyPlayer1 keyPlayer2 hAlign zAlign playType formType passStr runStr prefHash prefDown prefDis prefFieldPos prefDFront prefDCov PrefDBlitz prefSituation diagramPath conf
Regular Empty Left eFar Hag Half Chip Sooners Rt Choice Snag Z T Left Right Drop Empty Right Right Left 70
Regular Doubles Right Near Half Trail Rt Post Rail T Z Right Left Drop Tight Bunch 70
Regular Empty Left eFar Happy Half Florida Rt Post Z R Left Right Drop Empty Right 70
Regular Deuce Left Far Half Sooners Rt Syracuse Tub R Z Left Right Drop Twins 70
Regular Trio Right Far Half Traffic Rt Traffic T L Right Right Drop Tight Bunch /assets/playDiagrams/traffic.png 70
Regular Trio Left Far Half H Irish Lt R Shallow H Z Left Left Drop Tight Bunch 70
Regular Empty Left eFar Half R Chop Rt Houston Fin R T Left Right Drop Empty 70
Regular Dice Left Near Action Half Saber L R Left Right Quick Wide Stack Left Left Middle 1 Long Green 70
Regular River Right Flex Stack Near Hot Action Half Squid Rt Glance Quick Z L Right Right Quick Wide Stack Right Right Right 70
Regular West Left Far Half Chat Lt Slant Chat Tub L R Left Left Quick Trips 70
Regular Empty Left eFar Hag Half Halo Rt Choice Hitch Z L Left Right Quick Empty 70
Regular Transport Right Near Action Half Squid Rt Choice Z L Right Right Quick Wide Bunch 70
Regular Deuce Left Flex Far Blast Rt Honolulu Hawaii T Z Left Right RPO Twins Right Left Left /assets/playDiagrams/honolulu.png 70
Regular Twins Right Stack Near IZ Lt Alpha Squid T R Right Left RPO Wide Stack Right Right Right 2 Medium 70
Regular Doubles Left Far OZ Lt Seattle Wazzu T Z Left Right RPO Tight Bunch Right Left Left 70
Regular Lake Left Next Far IZ Lt Lima Gas T L Left Left RPO Trips Left Left Right 3 Short Fringe 70
Regular Ace Left Far Base Rt Gas Echo Lucy L T Left Right RPO Twins /assets/playDiagrams/echo.png 70
Regular Doubles Right Far OZ Rt Sonics Wazzu T Z Right Left RPO Tight Bunch 70
Regular Hard Left Near Hag Tear QB Base Lt Tub Q T Left Right RPO Twins 70
Regular Trio Right Near IZ Lt Golf Truck T L Right Right Run Tight Bunch /assets/playDiagrams/golf.png 70
Regular Doubles Left Near QB OZ Lt Q Left Right Run Tight Bunch 70
QB Trey Rt Q Run 70
Tank Lt Read 70

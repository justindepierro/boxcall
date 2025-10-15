# Roster Phase 2: Professional Features - Implementation Plan

**Status**: 🚀 IN PROGRESS  
**Start Date**: October 15, 2025  
**Estimated Duration**: 3-5 days  
**Priority**: HIGH

---

## Overview

Phase 2 transforms the RosterPage from a basic CRUD interface into a professional roster management system with bulk operations, advanced filtering, export capabilities, and detailed player profiles.

---

## Task Breakdown

### Task 1: Bulk Selection System ⏳ (2-3 hours)

**Status**: NOT STARTED  
**Files to Modify**:

- `src/pages/RosterPage.tsx`

**Implementation Steps**:

1. Add selection state: `const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())`
2. Add checkbox to each player card (top-right corner)
3. Implement individual selection toggle
4. Add "Select All" / "Deselect All" button in header
5. Show selection counter when items selected: "3 players selected"
6. Add visual indication on selected cards (border highlight)

**UI Changes**:

```tsx
// Header area (when selections exist)
{
  selectedPlayerIds.size > 0 && (
    <div className="flex items-center gap-spacing-md bg-primary-50 p-spacing-sm rounded-lg">
      <Typography variant="body-sm" className="text-primary-700">
        {selectedPlayerIds.size} player{selectedPlayerIds.size !== 1 ? "s" : ""}{" "}
        selected
      </Typography>
      <Button size="sm" variant="ghost" onClick={clearSelection}>
        Clear
      </Button>
    </div>
  );
}

// Player card (top-right)
<input
  type="checkbox"
  checked={selectedPlayerIds.has(player.id)}
  onChange={() => togglePlayerSelection(player.id)}
  className="w-5 h-5 rounded border-surface-secondary"
/>;
```

**State Management**:

```tsx
const togglePlayerSelection = (playerId: string) => {
  setSelectedPlayerIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    return newSet;
  });
};

const selectAll = () => {
  setSelectedPlayerIds(new Set(filteredPlayers.map((p) => p.id)));
};

const clearSelection = () => {
  setSelectedPlayerIds(new Set());
};
```

**Success Criteria**:

- ✅ Checkboxes appear on all player cards
- ✅ Individual selection works
- ✅ Select All / Clear works
- ✅ Selection counter displays correctly
- ✅ Visual feedback on selected cards

---

### Task 2: Bulk Delete Operation ⏳ (1-2 hours)

**Status**: NOT STARTED  
**Dependencies**: Task 1 complete  
**Files to Modify**:

- `src/pages/RosterPage.tsx`
- `src/services/rosterService.ts`

**Implementation Steps**:

1. Add "Delete Selected" button in header (visible when selections exist)
2. Update DeleteConfirmationDialog to handle multiple players
3. Add `deleteMultiplePlayers` method to rosterService
4. Implement bulk delete handler with error handling
5. Clear selection after successful delete
6. Show appropriate toast messages

**Service Layer**:

```typescript
// src/services/rosterService.ts
async deleteMultiplePlayers(playerIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('player_roster')
    .delete()
    .in('id', playerIds);

  if (error) throw error;
}
```

**UI Implementation**:

```tsx
// Header area (with Delete button)
{
  selectedPlayerIds.size > 0 && (
    <div className="flex items-center gap-spacing-md">
      <Typography>...</Typography>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => confirmBulkDelete()}
        leftIcon={<Icon name="delete" />}
      >
        Delete Selected
      </Button>
    </div>
  );
}

// Handler
const confirmBulkDelete = () => {
  setShowDeleteDialog(true);
  // Dialog will use selectedPlayerIds.size for count
};

const handleBulkDelete = async () => {
  try {
    await rosterService.deleteMultiplePlayers(Array.from(selectedPlayerIds));
    toast.success(`Successfully deleted ${selectedPlayerIds.size} players`);
    clearSelection();
    loadRoster();
  } catch (error) {
    toast.error("Failed to delete players");
  }
};
```

**Dialog Enhancement**:

```tsx
<DeleteConfirmationDialog
  isOpen={showDeleteDialog}
  onClose={handleCloseDeleteDialog}
  onConfirm={playerToDelete ? handleDeletePlayer : handleBulkDelete}
  title={playerToDelete ? "Delete Player" : "Delete Multiple Players"}
  entityName={playerToDelete?.name || `${selectedPlayerIds.size} players`}
/>
```

**Success Criteria**:

- ✅ Delete Selected button appears when items selected
- ✅ Confirmation dialog shows correct count
- ✅ Bulk delete succeeds for all selected players
- ✅ Toast shows success with count
- ✅ Selection cleared after delete
- ✅ Roster refreshes automatically

---

### Task 3: Bulk Edit Modal ⏳ (2-3 hours)

**Status**: NOT STARTED  
**Dependencies**: Task 1 complete  
**Files to Create**:

- `src/components/roster/BulkEditModal.tsx`

**Files to Modify**:

- `src/pages/RosterPage.tsx`
- `src/services/rosterService.ts`

**Implementation Steps**:

1. Create BulkEditModal component with partial update fields
2. Add "Edit Selected" button in header
3. Implement `updateMultiplePlayers` in rosterService
4. Handle partial updates (only update filled fields)
5. Add validation for bulk updates
6. Show progress indicator for large updates

**Component Structure**:

```tsx
// src/components/roster/BulkEditModal.tsx
interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<PlayerRosterUpdate>) => Promise<void>;
  playerCount: number;
}

export function BulkEditModal({
  isOpen,
  onClose,
  onSave,
  playerCount,
}: BulkEditModalProps) {
  const [updates, setUpdates] = useState<Partial<PlayerRosterUpdate>>({});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${playerCount} Players`}
    >
      <div className="space-y-spacing-md">
        <Typography variant="body-sm" className="text-text-secondary">
          Only filled fields will be updated. Leave blank to keep existing
          values.
        </Typography>

        {/* Position dropdown (optional) */}
        <div>
          <label>Position</label>
          <select
            onChange={(e) =>
              setUpdates({ ...updates, position: e.target.value || undefined })
            }
          >
            <option value="">-- No Change --</option>
            <option value="QB">QB</option>
            {/* ... other positions */}
          </select>
        </div>

        {/* Grade Level dropdown (optional) */}
        <div>
          <label>Grade Level</label>
          <select
            onChange={(e) =>
              setUpdates({
                ...updates,
                grade_level: e.target.value || undefined,
              })
            }
          >
            <option value="">-- No Change --</option>
            <option value="9">9th Grade</option>
            {/* ... other grades */}
          </select>
        </div>

        {/* Status dropdown (optional) */}
        <div>
          <label>Status</label>
          <select
            onChange={(e) =>
              setUpdates({ ...updates, status: e.target.value || undefined })
            }
          >
            <option value="">-- No Change --</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-spacing-sm justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(updates)}>
            Update {playerCount} Players
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

**Service Layer**:

```typescript
// src/services/rosterService.ts
async updateMultiplePlayers(
  playerIds: string[],
  updates: Partial<PlayerRosterUpdate>
): Promise<void> {
  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  const { error } = await supabase
    .from('player_roster')
    .update(cleanUpdates)
    .in('id', playerIds);

  if (error) throw error;
}
```

**Integration**:

```tsx
// RosterPage.tsx
const [showBulkEditModal, setShowBulkEditModal] = useState(false);

const handleBulkEdit = async (updates: Partial<PlayerRosterUpdate>) => {
  try {
    setSaving(true);
    await rosterService.updateMultiplePlayers(
      Array.from(selectedPlayerIds),
      updates
    );
    toast.success(`Successfully updated ${selectedPlayerIds.size} players`);
    setShowBulkEditModal(false);
    clearSelection();
    loadRoster();
  } catch (error) {
    toast.error("Failed to update players");
  } finally {
    setSaving(false);
  }
};
```

**Success Criteria**:

- ✅ Edit Selected button appears when items selected
- ✅ Modal opens with partial update form
- ✅ Only filled fields are updated
- ✅ Validation prevents invalid combinations
- ✅ Toast shows success with count
- ✅ Roster refreshes with updated data

---

### Task 4: Advanced Multi-Filter System ⏳ (2-3 hours)

**Status**: NOT STARTED  
**Files to Modify**:

- `src/pages/RosterPage.tsx`

**Implementation Steps**:

1. Replace single-select filters with multi-select components
2. Add grade level filter dropdown
3. Add active/inactive status filter
4. Implement combined filter logic (AND operation)
5. Add filter badges showing active filters
6. Add "Clear All Filters" button
7. Persist filters in URL params for sharing

**UI Structure**:

```tsx
// Filter bar with multi-select
<div className="flex flex-wrap gap-spacing-md items-center">
  {/* Multi-select Position Filter */}
  <MultiSelect
    label="Positions"
    options={POSITION_OPTIONS}
    selected={positionFilters}
    onChange={setPositionFilters}
    placeholder="All Positions"
  />

  {/* Multi-select Grade Level Filter */}
  <MultiSelect
    label="Grade Levels"
    options={GRADE_OPTIONS}
    selected={gradeLevelFilters}
    onChange={setGradeLevelFilters}
    placeholder="All Grades"
  />

  {/* Status Filter */}
  <Select
    label="Status"
    value={statusFilter}
    onChange={setStatusFilter}
    options={[
      { value: "", label: "All Players" },
      { value: "active", label: "Active Only" },
      { value: "inactive", label: "Inactive Only" },
    ]}
  />

  {/* Clear Filters Button */}
  {hasActiveFilters && (
    <Button size="sm" variant="ghost" onClick={clearAllFilters}>
      Clear Filters
    </Button>
  )}
</div>;

{
  /* Active Filter Badges */
}
{
  hasActiveFilters && (
    <div className="flex flex-wrap gap-spacing-xs">
      {positionFilters.map((pos) => (
        <Badge key={pos} onRemove={() => removePositionFilter(pos)}>
          {pos}
        </Badge>
      ))}
      {/* ... other filter badges */}
    </div>
  );
}
```

**Filter Logic**:

```tsx
const [positionFilters, setPositionFilters] = useState<string[]>([]);
const [gradeLevelFilters, setGradeLevelFilters] = useState<string[]>([]);
const [statusFilter, setStatusFilter] = useState<string>("");

const filteredPlayers = useMemo(() => {
  let filtered = players;

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter((p) =>
      `${p.first_name} ${p.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }

  // Position filter (OR within, AND with others)
  if (positionFilters.length > 0) {
    filtered = filtered.filter((p) => positionFilters.includes(p.position));
  }

  // Grade level filter
  if (gradeLevelFilters.length > 0) {
    filtered = filtered.filter(
      (p) => p.grade_level && gradeLevelFilters.includes(p.grade_level)
    );
  }

  // Status filter
  if (statusFilter) {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }

  return filtered;
}, [players, searchTerm, positionFilters, gradeLevelFilters, statusFilter]);
```

**URL Persistence**:

```tsx
// Sync filters with URL
useEffect(() => {
  const params = new URLSearchParams(location.search);

  // Read filters from URL on mount
  const urlPositions = params.get("positions")?.split(",") || [];
  const urlGrades = params.get("grades")?.split(",") || [];
  const urlStatus = params.get("status") || "";

  if (urlPositions.length) setPositionFilters(urlPositions);
  if (urlGrades.length) setGradeLevelFilters(urlGrades);
  if (urlStatus) setStatusFilter(urlStatus);
}, [location.search]);

// Update URL when filters change
useEffect(() => {
  const params = new URLSearchParams();

  if (positionFilters.length)
    params.set("positions", positionFilters.join(","));
  if (gradeLevelFilters.length)
    params.set("grades", gradeLevelFilters.join(","));
  if (statusFilter) params.set("status", statusFilter);

  const newSearch = params.toString();
  if (newSearch !== location.search.slice(1)) {
    navigate(`?${newSearch}`, { replace: true });
  }
}, [positionFilters, gradeLevelFilters, statusFilter]);
```

**Success Criteria**:

- ✅ Multi-select dropdowns work correctly
- ✅ Combined filters show correct results
- ✅ Filter badges display active filters
- ✅ Clear filters button works
- ✅ URL updates with filter changes
- ✅ Shareable URLs work correctly

---

### Task 5: Export Functionality ⏳ (2-3 hours)

**Status**: NOT STARTED  
**Files to Create**:

- `src/utils/exportUtils.ts`

**Files to Modify**:

- `src/pages/RosterPage.tsx`

**Implementation Steps**:

1. Create export utilities for CSV and PDF
2. Add Export dropdown button in header
3. Implement CSV export with all player data
4. Implement PDF export with formatted table
5. Handle filtered vs. full roster exports
6. Add proper filenames with date/team name

**Export Utilities**:

```typescript
// src/utils/exportUtils.ts
import { RosterPlayerView } from "../types/roster";

export function exportToCSV(
  players: RosterPlayerView[],
  filename: string
): void {
  const headers = [
    "First Name",
    "Last Name",
    "Jersey #",
    "Position",
    "Grade",
    "Height",
    "Weight",
    "Status",
    "Notes",
  ];

  const rows = players.map((p) => [
    p.first_name,
    p.last_name,
    p.jersey_number || "",
    p.position,
    p.grade_level || "",
    p.height_inches
      ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"`
      : "",
    p.weight_lbs || "",
    p.status || "active",
    p.notes || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export async function exportToPDF(
  players: RosterPlayerView[],
  teamName: string,
  filename: string
): Promise<void> {
  // Use jsPDF or similar library
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`${teamName} - Roster`, 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  // Add table with autoTable plugin
  const tableData = players.map((p) => [
    `${p.first_name} ${p.last_name}`,
    p.jersey_number || "-",
    p.position,
    p.grade_level || "-",
    p.height_inches
      ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"`
      : "-",
    p.weight_lbs || "-",
  ]);

  (doc as any).autoTable({
    head: [["Name", "Jersey", "Position", "Grade", "Height", "Weight"]],
    body: tableData,
    startY: 35,
  });

  doc.save(`${filename}.pdf`);
}
```

**UI Implementation**:

```tsx
// RosterPage.tsx
import { exportToCSV, exportToPDF } from "../utils/exportUtils";

const handleExport = async (format: "csv" | "pdf") => {
  const playersToExport =
    selectedPlayerIds.size > 0
      ? players.filter((p) => selectedPlayerIds.has(p.id))
      : filteredPlayers;

  const filename = `roster-${teamName || "export"}-${new Date().toISOString().split("T")[0]}`;

  try {
    if (format === "csv") {
      exportToCSV(playersToExport, filename);
      toast.success(`Exported ${playersToExport.length} players to CSV`);
    } else {
      await exportToPDF(playersToExport, teamName || "Team", filename);
      toast.success(`Exported ${playersToExport.length} players to PDF`);
    }
  } catch (error) {
    toast.error(`Failed to export ${format.toUpperCase()}`);
  }
};

// Export button in header
<DropdownMenu>
  <DropdownMenu.Trigger asChild>
    <Button variant="outline" size="sm" leftIcon={<Icon name="download" />}>
      Export
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onClick={() => handleExport("csv")}>
      Export as CSV
    </DropdownMenu.Item>
    <DropdownMenu.Item onClick={() => handleExport("pdf")}>
      Export as PDF
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>;
```

**Success Criteria**:

- ✅ Export dropdown appears in header
- ✅ CSV export works with all data
- ✅ PDF export generates formatted table
- ✅ Exports respect current filters
- ✅ Exports selected players when applicable
- ✅ Filenames include date and team name

---

### Task 6: Player Detail Page ⏳ (3-4 hours)

**Status**: NOT STARTED  
**Files to Create**:

- `src/pages/PlayerDetailPage.tsx`
- `src/components/roster/PlayerProfile.tsx`

**Files to Modify**:

- `src/App.tsx` (add route)
- `src/pages/RosterPage.tsx` (add navigation)

**Implementation Steps**:

1. Create PlayerDetailPage route (`/roster/:playerId`)
2. Design player profile layout with sections
3. Add click handler to roster cards for navigation
4. Implement edit mode on detail page
5. Add breadcrumb navigation back to roster
6. Add player stats section (placeholder for Phase 4)

**Route Configuration**:

```tsx
// src/App.tsx
<Route
  path={ROUTES.PLAYER_DETAIL}
  element={
    <ProtectedRoute allowedRoles={["admin", "coach", "super_admin"]}>
      <LazyPlayerDetailPage />
    </ProtectedRoute>
  }
/>;

// src/utils/navigation.ts
export const ROUTES = {
  // ... existing routes
  PLAYER_DETAIL: "/roster/:playerId",
} as const;
```

**Page Structure**:

```tsx
// src/pages/PlayerDetailPage.tsx
export function PlayerDetailPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<RosterPlayerView | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  const loadPlayer = async () => {
    // Load player data
  };

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-spacing-xs mb-spacing-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ROSTER)}
        >
          <Icon name="arrow_back" />
          Back to Roster
        </Button>
      </div>

      {/* Player Header */}
      <div className="flex items-start justify-between mb-spacing-lg">
        <div>
          <Typography variant="h1">
            {player?.first_name} {player?.last_name}
          </Typography>
          <Typography variant="body-lg" className="text-text-secondary">
            #{player?.jersey_number} • {player?.position}
          </Typography>
        </div>
        <Button onClick={() => setIsEditing(true)}>Edit Player</Button>
      </div>

      {/* Player Profile Component */}
      <PlayerProfile player={player} />

      {/* Edit Modal */}
      {isEditing && (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          {/* Same form as Edit Player Modal from RosterPage */}
        </Modal>
      )}
    </PageLayout>
  );
}
```

**Profile Component**:

```tsx
// src/components/roster/PlayerProfile.tsx
interface PlayerProfileProps {
  player: RosterPlayerView | null;
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  if (!player) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-spacing-lg">
      {/* Basic Info Card */}
      <Card>
        <Card.Header>Basic Information</Card.Header>
        <Card.Content>
          <dl className="space-y-spacing-sm">
            <div>
              <dt className="text-text-secondary">Position</dt>
              <dd className="font-medium">{player.position}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Jersey Number</dt>
              <dd className="font-medium">{player.jersey_number || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Grade Level</dt>
              <dd className="font-medium">{player.grade_level || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Status</dt>
              <dd>
                <Badge
                  variant={player.status === "active" ? "success" : "default"}
                >
                  {player.status || "Active"}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card.Content>
      </Card>

      {/* Physical Info Card */}
      <Card>
        <Card.Header>Physical Information</Card.Header>
        <Card.Content>
          <dl className="space-y-spacing-sm">
            <div>
              <dt className="text-text-secondary">Height</dt>
              <dd className="font-medium">
                {player.height_inches
                  ? `${Math.floor(player.height_inches / 12)}'${player.height_inches % 12}"`
                  : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Weight</dt>
              <dd className="font-medium">
                {player.weight_lbs ? `${player.weight_lbs} lbs` : "N/A"}
              </dd>
            </div>
          </dl>
        </Card.Content>
      </Card>

      {/* Notes Card */}
      <Card>
        <Card.Header>Notes</Card.Header>
        <Card.Content>
          <Typography variant="body-sm">
            {player.notes || "No notes available"}
          </Typography>
        </Card.Content>
      </Card>

      {/* Stats Placeholder (Phase 4) */}
      <Card className="lg:col-span-3">
        <Card.Header>Player Statistics</Card.Header>
        <Card.Content>
          <EmptyState
            icon="analytics"
            title="Statistics Coming Soon"
            description="Player statistics and performance tracking will be available in Phase 4"
          />
        </Card.Content>
      </Card>
    </div>
  );
}
```

**Navigation from Roster**:

```tsx
// RosterPage.tsx - update player card to be clickable
<Card
  key={player.id}
  className="cursor-pointer hover:shadow-lg transition-shadow"
  onClick={() => navigate(`/roster/${player.id}`)}
>
  {/* ... card content */}
</Card>
```

**Success Criteria**:

- ✅ Route `/roster/:playerId` works
- ✅ Clicking player card navigates to detail page
- ✅ Player data loads and displays correctly
- ✅ Edit button opens edit modal
- ✅ Breadcrumb navigation back to roster works
- ✅ Profile shows all player information

---

## Testing Checklist

After each task completion:

### Functional Testing

- [ ] Feature works as expected
- [ ] Error handling works correctly
- [ ] Toast notifications appear
- [ ] Loading states display properly
- [ ] Empty states show when appropriate

### Integration Testing

- [ ] Works with existing features (search, filters)
- [ ] Doesn't break existing functionality
- [ ] State management is clean
- [ ] No console errors

### UI/UX Testing

- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation)
- [ ] Visual feedback is clear
- [ ] Loading indicators appear
- [ ] Error messages are helpful

### Performance Testing

- [ ] No unnecessary re-renders
- [ ] Large datasets handle well
- [ ] Bulk operations perform efficiently

---

## Dependencies to Install

```bash
# For PDF export (Task 5)
npm install jspdf jspdf-autotable
npm install -D @types/jspdf

# Optional: For better multi-select dropdowns (Task 4)
npm install @radix-ui/react-select
```

---

## Timeline Estimate

| Task                | Estimated Time  | Priority     |
| ------------------- | --------------- | ------------ |
| 1. Bulk Selection   | 2-3 hours       | HIGH         |
| 2. Bulk Delete      | 1-2 hours       | HIGH         |
| 3. Bulk Edit        | 2-3 hours       | MEDIUM       |
| 4. Advanced Filters | 2-3 hours       | MEDIUM       |
| 5. Export           | 2-3 hours       | MEDIUM       |
| 6. Player Detail    | 3-4 hours       | LOW          |
| **Total**           | **12-18 hours** | **3-5 days** |

---

## Success Metrics

### Phase 2 Complete When:

- ✅ Users can select multiple players at once
- ✅ Bulk delete works for 2+ players
- ✅ Bulk edit updates multiple players
- ✅ Multi-select filters work correctly
- ✅ Export to CSV and PDF functions
- ✅ Player detail page shows full profile
- ✅ All features are tested and documented
- ✅ No regression in existing features
- ✅ Zero critical bugs

---

## Next Steps

1. **Start with Task 1**: Bulk Selection System (foundation for Tasks 2-3)
2. **Then Task 2**: Bulk Delete (builds on selection)
3. **Then Task 3**: Bulk Edit (builds on selection)
4. **Parallel Track**: Tasks 4-6 can be done independently
5. **Final**: Integration testing and polish

Ready to start with Task 1: Bulk Selection System? 🚀

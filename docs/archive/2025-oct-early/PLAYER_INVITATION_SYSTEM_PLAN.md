# Player Invitation System - Implementation Plan

## Overview

Allow coaches to invite players to join the team by email. When a player's email is entered in the roster modal, show an "Invite to Team" button that:

1. Creates a pending team_member record
2. Sends an invitation email
3. Creates player account on acceptance
4. Links player profile to roster entry

## Current State Analysis

### Existing Infrastructure ✅

- ✅ `team_members` table with `status` field ('active', 'inactive', 'pending')
- ✅ `team_players` table for roster management
- ✅ `profiles` table for user profiles
- ✅ Email field in roster (can store player email)
- ✅ Supabase Auth for authentication
- ✅ RLS policies for team access control

### Missing Infrastructure ❌

- ❌ Invitation token system
- ❌ Email service integration
- ❌ Invitation acceptance flow
- ❌ Link between team_players and auth.users
- ❌ UI for invitation management

## Database Schema Changes

### Option 1: Add invitation fields to team_players (Simpler)

```sql
ALTER TABLE team_players
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN invitation_token UUID DEFAULT uuid_generate_v4(),
ADD COLUMN invitation_status TEXT CHECK (invitation_status IN ('not_invited', 'pending', 'accepted', 'declined')),
ADD COLUMN invitation_sent_at TIMESTAMPTZ,
ADD COLUMN invitation_accepted_at TIMESTAMPTZ;

CREATE INDEX idx_team_players_invitation_token ON team_players(invitation_token);
CREATE INDEX idx_team_players_user_id ON team_players(user_id);
```

### Option 2: Create separate invitations table (More flexible)

```sql
CREATE TABLE player_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID DEFAULT uuid_generate_v4() UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_player_invitations_token ON player_invitations(token);
CREATE INDEX idx_player_invitations_email ON player_invitations(email);
```

**Recommendation**: Use Option 1 for simplicity. Can refactor to Option 2 later if needed.

## Implementation Phases

### Phase 1: Database & Backend (Core Infrastructure)

**Files to modify:**

- `supabase/migrations/20251016000001_add_player_invitation_system.sql`
- `database/schema.sql`
- `src/services/rosterService.ts`
- `src/services/invitationService.ts` (new)

**Tasks:**

1. Create migration to add invitation fields to team_players
2. Add user_id link field
3. Create invitation service methods:
   - `sendPlayerInvitation(playerId, email)`
   - `acceptInvitation(token)`
   - `getInvitationByToken(token)`
   - `resendInvitation(playerId)`

### Phase 2: Email Integration

**Files to create/modify:**

- `src/services/emailService.ts` (new or use existing)
- Email templates

**Options:**

- **Supabase Edge Functions**: Recommended for security
- **Resend API**: Modern email service
- **SendGrid**: Enterprise option
- **Native Supabase**: Email templates

**Decision needed**: Which email service to use?

### Phase 3: UI Components

**Files to modify:**

- `src/pages/RosterPage.tsx`
- `src/components/roster/InvitePlayerButton.tsx` (new)
- `src/pages/AcceptInvitationPage.tsx` (new)

**UI Changes:**

1. Add "Invite to Team" button in Add/Edit modal when email is present
2. Show invitation status badge on player cards
3. Add invitation management section
4. Create invitation acceptance page

### Phase 4: Auth Flow

**Files to modify:**

- `src/routes/index.tsx`
- `src/pages/auth/AcceptInvitationPage.tsx` (new)
- Supabase auth configuration

**Flow:**

1. User clicks invitation link with token
2. If not logged in: Show signup form with email pre-filled
3. If logged in: Confirm acceptance
4. Link auth.user to team_player record
5. Add to team_members with 'player' role
6. Redirect to team dashboard

## Simplified MVP Implementation

### Quick Win: Email-Only Invitations (No Account Creation Yet)

**Scope**: Just send invitation emails, manual account setup

**Phase 1A: Add invite button to modal**

```tsx
{
  playerForm.email_address && (
    <Button
      variant="outline"
      onClick={() => handleSendInvite()}
      className="w-full mt-4"
    >
      <Icon name="mail" className="w-4 h-4 mr-2" />
      Invite {playerForm.first_name} to Team
    </Button>
  );
}
```

**Phase 1B: Email sending (basic)**
Use Supabase Edge Function or simple service:

```typescript
async function sendPlayerInvite(
  email: string,
  teamName: string,
  playerName: string
) {
  // For now: Just log or use mailto: link
  // Later: Integrate with email service
  const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
  console.log(`Send invite to ${email}: ${inviteUrl}`);
}
```

## Questions to Answer

1. **Email Service**: Which provider? (Supabase, Resend, SendGrid, other?)
2. **Account Creation**: Automatic or require signup?
3. **Invitation Expiry**: How long should invitations be valid? (7 days?)
4. **Resend Logic**: Allow resending invitations?
5. **Multi-Team**: Can one player be on multiple teams?
6. **Parent/Guardian**: Support parent email for minor players?
7. **Permissions**: What can invited players do? (View playbook, check-in, etc.)

## Security Considerations

✅ **Token Security**:

- Use UUID tokens (cryptographically secure)
- Store hashed tokens in database
- Expire after 7 days
- One-time use only

✅ **Email Verification**:

- Verify email ownership before account creation
- Use Supabase's built-in email verification

✅ **RLS Policies**:

- Only coaches can send invitations
- Only invitation recipient can accept (verify email match)
- Prevent invitation spam

## UI/UX Flow

### Coach Perspective

1. Add player to roster with email
2. See "Invite to Team" button
3. Click → Sends invitation email
4. See "Invitation Sent" badge on player card
5. Can resend invitation if needed
6. See when invitation is accepted

### Player Perspective

1. Receive email with invitation link
2. Click link → Goes to boxcall.com/invite/accept?token=xxx
3. If no account: Sign up with email pre-filled
4. If has account: Confirm acceptance
5. Redirected to team dashboard
6. Can view plays, check practice schedule, etc.

## Success Metrics

- ✅ Invitation sent successfully
- ✅ Email delivered
- ✅ Player accepts invitation
- ✅ Player account created
- ✅ Player linked to roster entry
- ✅ Player can access team features

## Rollout Strategy

### Stage 1: Foundation (This PR)

- Database schema for invitations
- Basic UI button
- Service methods structure
- Type definitions

### Stage 2: Email Integration (Next PR)

- Choose email provider
- Implement sending logic
- Email templates
- Error handling

### Stage 3: Acceptance Flow (Next PR)

- Acceptance page
- Auth integration
- Account creation
- Success states

### Stage 4: Polish (Future PR)

- Invitation management dashboard
- Resend logic
- Analytics
- Parent/guardian support

## Immediate Next Steps

For this session, let's implement **Stage 1 MVP**:

1. ✅ Add database fields for invitation tracking
2. ✅ Add "Invite to Team" button in modal (conditional on email)
3. ✅ Create basic invitation service structure
4. ✅ Show invitation status on player cards
5. ⏸️ Email sending (placeholder/console.log for now)
6. ⏸️ Acceptance flow (future PR)

## Technical Debt to Address Later

- Invitation expiry cleanup job
- Rate limiting on invitation sending
- Invitation analytics
- Bulk invitation sending
- CSV import with auto-invitations
- Parent/guardian invitation flow
- Multi-role invitations (player + family)

---

## Decision Required: Implementation Approach

**Option A: Full Implementation Now** (2-4 hours)

- Complete database, email, auth flow
- Requires email service setup
- Full feature ready

**Option B: MVP + Placeholder** (30-60 minutes) ⭐ **RECOMMENDED**

- Database fields + UI button
- Placeholder email (console.log/mailto)
- Can test UI/UX flow
- Complete email later

**Option C: Delay Feature**

- Add to backlog
- Implement when email infrastructure ready

**Which approach would you like to take?**

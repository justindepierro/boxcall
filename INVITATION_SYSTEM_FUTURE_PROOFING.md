# Player Invitation System - Future-Proofing & Critical Updates

**Date:** October 16, 2025  
**Status:** MVP Complete - Identifying gaps and security issues

---

## 🚨 Critical Issues to Address

### 1. **Missing team_members Record Creation** ⚠️ HIGH PRIORITY

**Problem:**  
The `acceptInvitation()` function only updates `team_players.user_id` but **does NOT create a `team_members` record**. This means:

- ❌ Player can't actually access the team (RLS blocks them)
- ❌ Player won't appear in team member lists
- ❌ Player won't have role-based permissions
- ❌ Navigation won't work (no team association)

**Current Code** (`invitationService.ts` line 148):

```typescript
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {
      invitation_status: "accepted",
      invitation_accepted_at: new Date().toISOString(),
      user_id: userId, // ← Only links user to roster entry
    };

    const { error } = await (supabase.from("team_players") as any)
      .update(updateData)
      .eq("invitation_token", token)
      .eq("invitation_status", "pending");

    if (error) {
      logError("[invitationService] Failed to accept invitation:", error);
      return false;
    }

    return true; // ← Missing team_members creation!
  } catch (err) {
    logError("[invitationService] Error accepting invitation:", err);
    return false;
  }
}
```

**Fix Required:**

```typescript
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    // Step 1: Get player info with team_id
    const { data: playerData, error: fetchError } = await supabase
      .from("team_players")
      .select("id, team_id, first_name, last_name, email_address")
      .eq("invitation_token", token)
      .eq("invitation_status", "pending")
      .single();

    if (fetchError || !playerData) {
      logError("[invitationService] Invalid or expired invitation token");
      return false;
    }

    // Step 2: Update team_players with user_id
    const updateData: Record<string, any> = {
      invitation_status: "accepted",
      invitation_accepted_at: new Date().toISOString(),
      user_id: userId,
    };

    const { error: updateError } = await (supabase.from("team_players") as any)
      .update(updateData)
      .eq("invitation_token", token)
      .eq("invitation_status", "pending");

    if (updateError) {
      logError(
        "[invitationService] Failed to update invitation status:",
        updateError
      );
      return false;
    }

    // Step 3: Create team_members record (CRITICAL!)
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: playerData.team_id,
      user_id: userId,
      team_role: "player", // Default to player role
      status: "active",
      capabilities: {
        can_manage_team: false,
        can_manage_games: false,
        can_manage_social: false,
        can_manage_players: false,
        can_view_analytics: false,
        can_manage_playbook: false,
        can_manage_practice: false,
        can_manage_equipment: false,
      },
      invited_by: null, // TODO: Track who invited them
      joined_at: new Date().toISOString(),
    });

    if (memberError) {
      logError(
        "[invitationService] Failed to create team_members record:",
        memberError
      );
      // IMPORTANT: Consider rolling back the team_players update here
      return false;
    }

    info(
      `[invitationService] Player ${userId} successfully joined team ${playerData.team_id}`
    );
    return true;
  } catch (err) {
    logError("[invitationService] Error accepting invitation:", err);
    return false;
  }
}
```

---

### 2. **Token Expiration Not Enforced** ⚠️ MEDIUM PRIORITY

**Problem:**  
Invitation tokens never expire. A leaked invitation link could be used months/years later.

**Current State:**

- `invitation_sent_at` is stored but never checked
- No `expires_at` field
- No cleanup of old invitations

**Fix Required:**

**Migration:**

```sql
-- Add expiration field
ALTER TABLE team_players
ADD COLUMN invitation_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- Add comment
COMMENT ON COLUMN team_players.invitation_expires_at IS 'Invitation link expires after 7 days';

-- Create index for cleanup queries
CREATE INDEX idx_team_players_invitation_expired
ON team_players(invitation_expires_at)
WHERE invitation_status = 'pending';
```

**Update `sendPlayerInvitation()`:**

```typescript
const updateData: Record<string, any> = {
  invitation_status: "pending",
  invitation_sent_at: new Date().toISOString(),
  invitation_expires_at: new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString(), // 7 days
};
```

**Update `getInvitationByToken()`:**

```typescript
export async function getInvitationByToken(token: string) {
  const { data, error } = await supabase
    .from("team_players")
    .select("*")
    .eq("invitation_token", token)
    .eq("invitation_status", "pending")
    .gt("invitation_expires_at", new Date().toISOString()) // ← Check expiration
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
```

**Cleanup Job (Supabase Edge Function):**

```typescript
// Clean up expired invitations daily
export async function cleanupExpiredInvitations() {
  const { error } = await supabase
    .from("team_players")
    .update({ invitation_status: "expired" })
    .eq("invitation_status", "pending")
    .lt("invitation_expires_at", new Date().toISOString());

  if (error) {
    console.error("Failed to cleanup expired invitations:", error);
  }
}
```

---

### 3. **Token Regeneration on Resend** ⚠️ MEDIUM PRIORITY

**Problem:**  
`resendPlayerInvitation()` doesn't regenerate the token. If the original link was leaked, resending doesn't help.

**Current Code:**

```typescript
export async function resendPlayerInvitation(...) {
  // Just calls sendPlayerInvitation again
  return sendPlayerInvitation({...});  // ← Uses same token!
}
```

**Fix Required:**

```typescript
export async function resendPlayerInvitation(
  playerId: string,
  email: string,
  playerName: string,
  teamName: string,
  invitedBy: string
): Promise<InvitationResult> {
  if (!email) {
    return {
      success: false,
      message: "Player has no email address",
    };
  }

  try {
    // Regenerate token on resend for security
    const newToken = crypto.randomUUID();

    const updateData: Record<string, any> = {
      invitation_token: newToken, // ← New token
      invitation_status: "pending",
      invitation_sent_at: new Date().toISOString(),
      invitation_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    const { error } = await (supabase.from("team_players") as any)
      .update(updateData)
      .eq("id", playerId);

    if (error) {
      throw error;
    }

    // Then send with new token
    return sendPlayerInvitation({
      playerId,
      email,
      playerName,
      teamName,
      invitedBy,
    });
  } catch (err) {
    logError("[invitationService] Failed to resend invitation:", err);
    return {
      success: false,
      message: "Failed to resend invitation",
    };
  }
}
```

---

### 4. **Email Validation Missing** ⚠️ MEDIUM PRIORITY

**Problem:**  
No validation that email is actually valid before sending invitation.

**Fix Required:**

```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function sendPlayerInvitation(
  params: SendInvitationParams
): Promise<InvitationResult> {
  const { playerId, email, playerName, teamName, invitedBy } = params;

  // Validate email format
  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Invalid email address format",
    };
  }

  // Check for duplicate email in same team
  const { data: existingPlayer } = await supabase
    .from("team_players")
    .select("id, invitation_status")
    .eq("team_id", teamId)
    .eq("email_address", email)
    .neq("id", playerId)
    .single();

  if (existingPlayer) {
    return {
      success: false,
      message: "A player with this email already exists on this team",
    };
  }

  // ... rest of function
}
```

---

### 5. **Rate Limiting Missing** ⚠️ LOW PRIORITY (but important)

**Problem:**  
Coach could spam invitations, causing abuse or email service costs.

**Fix Required:**

**Add to migration:**

```sql
-- Track invitation attempts
CREATE TABLE invitation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  attempted_by UUID REFERENCES auth.users(id),
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_attempts_email_time
ON invitation_attempts(email, attempted_at);
```

**Rate limiting logic:**

```typescript
async function checkRateLimit(
  teamId: string,
  email: string
): Promise<{ allowed: boolean; message?: string }> {
  // Check last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("invitation_attempts")
    .select("id")
    .eq("team_id", teamId)
    .eq("email", email)
    .gt("attempted_at", oneDayAgo);

  if (error) {
    return { allowed: true }; // Fail open
  }

  const attemptCount = data?.length || 0;

  if (attemptCount >= 3) {
    return {
      allowed: false,
      message: "Too many invitation attempts. Please wait 24 hours.",
    };
  }

  return { allowed: true };
}

// In sendPlayerInvitation:
const rateLimit = await checkRateLimit(teamId, email);
if (!rateLimit.allowed) {
  return {
    success: false,
    message: rateLimit.message || "Rate limit exceeded",
  };
}

// Log attempt
await supabase.from("invitation_attempts").insert({
  team_id: teamId,
  email,
  attempted_by: auth.uid(),
});
```

---

### 6. **No Duplicate Prevention** ⚠️ MEDIUM PRIORITY

**Problem:**  
A player could already be a user with an account, causing duplicate records.

**Fix Required:**

**Check before sending:**

```typescript
export async function sendPlayerInvitation(
  params: SendInvitationParams
): Promise<InvitationResult> {
  const { playerId, email, playerName, teamName, invitedBy } = params;

  // Check if user already exists with this email
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    // User already has account - auto-link instead of inviting?
    return {
      success: false,
      message:
        "A user with this email already exists. Please link them directly.",
    };

    // OR: Auto-link them
    // return await linkExistingUser(playerId, existingUser.id, teamId);
  }

  // ... rest of function
}
```

---

### 7. **Missing Profile Creation** ⚠️ HIGH PRIORITY

**Problem:**  
When player accepts invitation, we need to ensure their profile is created/updated.

**Fix Required:**

**In `acceptInvitation()`:**

```typescript
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    // ... existing code ...

    // Step 4: Ensure profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingProfile) {
      // Create profile from player data
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: `${playerData.first_name} ${playerData.last_name}`,
        email: playerData.email_address,
        role: "player",
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        logError("[invitationService] Failed to create profile:", profileError);
        // Don't fail the whole operation, profile might exist
      }
    }

    return true;
  } catch (err) {
    logError("[invitationService] Error accepting invitation:", err);
    return false;
  }
}
```

---

### 8. **Transaction Safety Missing** ⚠️ HIGH PRIORITY

**Problem:**  
`acceptInvitation()` does multiple database writes without transaction. If one fails, data is inconsistent.

**Fix Required:**

**Use Supabase RPC for atomic operations:**

**Migration:**

```sql
-- Create function for atomic invitation acceptance
CREATE OR REPLACE FUNCTION accept_player_invitation(
  p_token UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_player_record RECORD;
  v_result JSONB;
BEGIN
  -- Get player info
  SELECT * INTO v_player_record
  FROM team_players
  WHERE invitation_token = p_token
    AND invitation_status = 'pending'
    AND invitation_expires_at > NOW();

  IF v_player_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;

  -- Update team_players
  UPDATE team_players
  SET user_id = p_user_id,
      invitation_status = 'accepted',
      invitation_accepted_at = NOW()
  WHERE invitation_token = p_token;

  -- Create team_members record
  INSERT INTO team_members (
    team_id,
    user_id,
    team_role,
    status,
    capabilities,
    joined_at
  ) VALUES (
    v_player_record.team_id,
    p_user_id,
    'player',
    'active',
    '{
      "can_manage_team": false,
      "can_manage_games": false,
      "can_manage_social": false,
      "can_manage_players": false,
      "can_view_analytics": false,
      "can_manage_playbook": false,
      "can_manage_practice": false,
      "can_manage_equipment": false
    }'::JSONB,
    NOW()
  )
  ON CONFLICT (team_id, user_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_player_record.team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**TypeScript:**

```typescript
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; teamId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("accept_player_invitation", {
      p_token: token,
      p_user_id: userId,
    });

    if (error) {
      logError("[invitationService] Failed to accept invitation:", error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error };
    }

    return { success: true, teamId: data.team_id };
  } catch (err) {
    logError("[invitationService] Error accepting invitation:", err);
    return { success: false, error: "Unexpected error" };
  }
}
```

---

### 9. **Missing `invited_by` Tracking** ⚠️ LOW PRIORITY

**Problem:**  
We don't track who sent the invitation. Useful for auditing and analytics.

**Fix Required:**

**Migration:**

```sql
ALTER TABLE team_players
ADD COLUMN invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN team_players.invited_by IS 'User who sent the invitation';
```

**Update `sendPlayerInvitation()`:**

```typescript
export async function sendPlayerInvitation(
  params: SendInvitationParams
): Promise<InvitationResult> {
  const { playerId, email, playerName, teamName, invitedBy } = params;

  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();

    const updateData: Record<string, any> = {
      invitation_status: "pending",
      invitation_sent_at: new Date().toISOString(),
      invitation_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      invited_by: user?.id,  // ← Track inviter
    };

    // ... rest
  }
}
```

---

### 10. **No Email Bounce Handling** ⚠️ LOW PRIORITY (Phase 2)

**Problem:**  
When we integrate real email service, we need to handle bounces and delivery failures.

**Fix Required (Phase 2):**

```typescript
export interface EmailDeliveryStatus {
  playerId: string;
  email: string;
  status: "sent" | "delivered" | "bounced" | "failed";
  error?: string;
  timestamp: string;
}

// Webhook handler for email service
export async function handleEmailWebhook(event: any) {
  if (event.type === "email.bounced") {
    await supabase
      .from("team_players")
      .update({
        invitation_status: "failed",
        email_bounce_reason: event.reason,
      })
      .eq("email_address", event.email);
  }
}
```

---

## 📋 Implementation Priority

### Phase 1: Critical Security & Data Integrity (Do Now)

1. ✅ **Fix `acceptInvitation()` to create team_members record**
2. ✅ **Add token expiration enforcement**
3. ✅ **Add transaction safety (RPC function)**
4. ✅ **Add email validation**

### Phase 2: Enhanced Security (Before Production)

5. ⏳ **Token regeneration on resend**
6. ⏳ **Rate limiting**
7. ⏳ **Duplicate prevention**
8. ⏳ **Profile creation handling**

### Phase 3: Tracking & Analytics (Nice to Have)

9. ⏳ **Track `invited_by`**
10. ⏳ **Invitation attempts logging**
11. ⏳ **Analytics dashboard**

### Phase 4: Email Integration (Next Major Release)

12. ⏳ **Real email service (Resend/SendGrid)**
13. ⏳ **Email bounce handling**
14. ⏳ **Delivery status tracking**
15. ⏳ **HTML email templates**

---

## 🔒 Security Checklist

- [ ] Token expiration enforced
- [ ] Token regenerated on resend
- [ ] Email validation before sending
- [ ] Rate limiting to prevent spam
- [ ] Duplicate user detection
- [ ] Transaction-safe acceptance
- [ ] RLS policies protect invitation data
- [ ] XSS protection in email templates
- [ ] CSRF protection on acceptance endpoint
- [ ] Audit trail (invited_by tracking)

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] `sendPlayerInvitation()` validates email
- [ ] `sendPlayerInvitation()` checks rate limits
- [ ] `acceptInvitation()` creates team_members record
- [ ] `acceptInvitation()` handles expired tokens
- [ ] `acceptInvitation()` is atomic (rollback on failure)
- [ ] `getInvitationByToken()` rejects expired tokens
- [ ] `resendPlayerInvitation()` regenerates token

### Integration Tests

- [ ] Full flow: Send → Accept → User can access team
- [ ] Expired invitation rejected
- [ ] Duplicate email rejected
- [ ] Rate limit prevents spam
- [ ] Profile created/updated on acceptance
- [ ] RLS allows player to view playbook after acceptance

### E2E Tests

- [ ] Coach sends invitation
- [ ] Player receives email (when integrated)
- [ ] Player clicks link → Signup page
- [ ] Player creates account → Linked to team
- [ ] Player can access team dashboard
- [ ] Player sees player navigation

---

## 📝 Migration Script

```sql
-- File: supabase/migrations/20251016000003_invitation_system_improvements.sql

-- Add expiration and tracking
ALTER TABLE team_players
ADD COLUMN invitation_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
ADD COLUMN invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN email_bounce_reason TEXT;

-- Update existing records
UPDATE team_players
SET invitation_expires_at = invitation_sent_at + INTERVAL '7 days'
WHERE invitation_status = 'pending' AND invitation_sent_at IS NOT NULL;

-- Add new status
ALTER TABLE team_players
DROP CONSTRAINT IF EXISTS team_players_invitation_status_check;

ALTER TABLE team_players
ADD CONSTRAINT team_players_invitation_status_check
CHECK (invitation_status IN ('not_invited', 'pending', 'accepted', 'declined', 'expired', 'failed'));

-- Create invitation attempts table for rate limiting
CREATE TABLE invitation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  attempted_by UUID REFERENCES auth.users(id),
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_attempts_email_time
ON invitation_attempts(email, attempted_at);

CREATE INDEX idx_invitation_attempts_team
ON invitation_attempts(team_id, attempted_at);

-- Atomic acceptance function
CREATE OR REPLACE FUNCTION accept_player_invitation(
  p_token UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_player_record RECORD;
  v_result JSONB;
BEGIN
  -- Get player info (with expiration check)
  SELECT * INTO v_player_record
  FROM team_players
  WHERE invitation_token = p_token
    AND invitation_status = 'pending'
    AND (invitation_expires_at IS NULL OR invitation_expires_at > NOW());

  IF v_player_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;

  -- Update team_players
  UPDATE team_players
  SET user_id = p_user_id,
      invitation_status = 'accepted',
      invitation_accepted_at = NOW()
  WHERE invitation_token = p_token;

  -- Create team_members record (idempotent)
  INSERT INTO team_members (
    team_id,
    user_id,
    team_role,
    status,
    capabilities,
    joined_at,
    invited_by
  ) VALUES (
    v_player_record.team_id,
    p_user_id,
    'player',
    'active',
    '{
      "can_manage_team": false,
      "can_manage_games": false,
      "can_manage_social": false,
      "can_manage_players": false,
      "can_view_analytics": false,
      "can_manage_playbook": false,
      "can_manage_practice": false,
      "can_manage_equipment": false
    }'::JSONB,
    NOW(),
    v_player_record.invited_by
  )
  ON CONFLICT (team_id, user_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_player_record.team_id,
    'player_name', v_player_record.first_name || ' ' || v_player_record.last_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION accept_player_invitation TO authenticated;

-- Comments
COMMENT ON COLUMN team_players.invitation_expires_at IS 'Invitation link expires after 7 days';
COMMENT ON COLUMN team_players.invited_by IS 'User who sent the invitation';
COMMENT ON COLUMN team_players.email_bounce_reason IS 'Reason if email bounced (for debugging)';
COMMENT ON FUNCTION accept_player_invitation IS 'Atomically accepts player invitation and creates team membership';
```

---

## 🎯 Next Actions

1. **Immediate** - Apply migration script for expiration + transaction safety
2. **This Week** - Update `acceptInvitation()` to use RPC function
3. **This Week** - Add email validation and rate limiting
4. **Next Week** - Implement email service (Resend)
5. **Next Week** - Build `/invite/accept` page
6. **Future** - Add invitation management dashboard for coaches

---

**Status:** ⚠️ Critical updates identified  
**Impact:** High - Affects data integrity and user experience  
**Recommendation:** Apply Phase 1 fixes before moving to email integration

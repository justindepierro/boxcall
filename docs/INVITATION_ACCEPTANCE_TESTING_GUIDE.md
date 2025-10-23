# Invitation Acceptance Flow - Testing Guide

**Date:** October 23, 2025  
**Feature:** Player Invitation Acceptance  
**Priority:** 🔴 CRITICAL  

---

## 📋 Overview

This guide walks through testing the complete invitation acceptance flow, from receiving an invitation email to successfully joining a team.

**What We're Testing:**
- ✅ Token validation
- ✅ Sign up flow (new users)
- ✅ Sign in flow (existing users)
- ✅ Team joining logic
- ✅ Redirect to team dashboard
- ✅ Error handling

---

## 🧪 Test Scenarios

### **Scenario 1: New User - Sign Up Flow**

**Goal:** Test that a new user can create an account and join a team via invitation.

#### Steps:
1. **Send Invitation**
   - Go to your team's roster page
   - Click "Invite Player" or "Invite Staff"
   - Fill in: Email (use an email you haven't registered with), First Name, Last Name, Position
   - Click "Send Invitation"
   - ✅ Verify: Success message appears

2. **Check Email**
   - Open your email inbox (check spam folder)
   - Find the invitation email
   - ✅ Verify: Email has team name, your name, and "Accept Invitation" button
   - ✅ Verify: Email is properly formatted

3. **Click Invitation Link**
   - Click the "Accept Invitation" button in the email
   - ✅ Verify: Opens `/invite/accept?token=...` page
   - ✅ Verify: Shows team name (e.g., "Join Varsity Football")
   - ✅ Verify: Shows school name if applicable
   - ✅ Verify: Shows "You've been invited as: John Smith"
   - ✅ Verify: Shows invitation expiration date

4. **Sign Up**
   - Should default to "Create Account" tab
   - ✅ Verify: Email is pre-filled and disabled
   - ✅ Verify: First name and last name are pre-filled
   - Create a password (min 6 characters)
   - Confirm password
   - Click "Create Account"

5. **Verify Acceptance**
   - ✅ Verify: Shows "Accepting invitation..." loading state
   - ✅ Verify: Shows success screen with checkmark:
     - "Welcome to the Team!"
     - "You've successfully joined [Team Name] as [Your Name]"
     - "Redirecting to your team dashboard..."
   - ✅ Verify: Automatically redirects after 2 seconds

6. **Verify Team Access**
   - ✅ Verify: Lands on team dashboard `/teams/{teamId}`
   - ✅ Verify: Can see team name in header
   - ✅ Verify: Navigation sidebar shows team options
   - ✅ Verify: Can access appropriate sections based on role

7. **Check Database**
   - Open Supabase dashboard → Table Editor
   - Check `team_invitations` table:
     - ✅ Verify: `invitation_status = 'accepted'`
     - ✅ Verify: `invitation_accepted_at` is set
     - ✅ Verify: `user_id` matches your new user ID
   - Check `team_members` table:
     - ✅ Verify: New row with your `user_id` and `team_id`
     - ✅ Verify: `team_role` matches invitation role (player, staff, etc.)
     - ✅ Verify: `status = 'active'`

---

### **Scenario 2: Existing User - Sign In Flow**

**Goal:** Test that an existing user can sign in and join a team via invitation.

#### Steps:
1. **Send Invitation**
   - Send invitation to an email that's already registered in BoxCall
   - Use a different player name than the actual account
   - Click "Send Invitation"

2. **Click Invitation Link**
   - Open invitation email
   - Click "Accept Invitation" button
   - ✅ Verify: Opens invitation acceptance page

3. **Sign In**
   - Click "Sign In" tab at the top
   - Enter existing account email
   - Enter password
   - Click "Sign In"

4. **Verify Acceptance**
   - ✅ Verify: Shows accepting state
   - ✅ Verify: Shows success screen
   - ✅ Verify: Redirects to team dashboard

5. **Verify Team Access**
   - ✅ Verify: Can access team dashboard
   - ✅ Verify: Added to team roster
   - ✅ Verify: Has correct role permissions

---

### **Scenario 3: Already Logged In**

**Goal:** Test auto-acceptance for users who are already logged in.

#### Steps:
1. **Log in to BoxCall**
   - Sign in to your account normally

2. **Click Invitation Link**
   - Open invitation email
   - Click "Accept Invitation" button while still logged in

3. **Verify Auto-Acceptance**
   - ✅ Verify: Skips auth forms entirely
   - ✅ Verify: Shows "Accepting invitation..." immediately
   - ✅ Verify: Shows success screen
   - ✅ Verify: Redirects to team dashboard

---

### **Scenario 4: Invalid Token**

**Goal:** Test error handling for invalid tokens.

#### Steps:
1. **Manually Navigate**
   - Go to: `http://localhost:8888/invite/accept?token=invalid-token-123`

2. **Verify Error**
   - ✅ Verify: Shows red error alert
   - ✅ Verify: Message: "Invalid Invitation"
   - ✅ Verify: Text: "This invitation link is not valid."
   - ✅ Verify: "Go to Home" button appears

---

### **Scenario 5: Expired Token**

**Goal:** Test error handling for expired invitations.

#### Steps:
1. **Create Expired Invitation** (Manual DB Edit)
   - Open Supabase → Table Editor → `team_invitations`
   - Find an invitation
   - Set `invitation_expires_at` to yesterday's date
   - Copy the `invitation_token` value

2. **Use Expired Token**
   - Go to: `http://localhost:8888/invite/accept?token={expired-token}`

3. **Verify Error**
   - ✅ Verify: Shows warning alert
   - ✅ Verify: Message: "Invitation Expired"
   - ✅ Verify: Text: "This invitation has expired. Please contact your coach to request a new invitation."
   - ✅ Verify: "Go to Home" button appears

---

### **Scenario 6: Already Accepted**

**Goal:** Test error handling when trying to accept an invitation twice.

#### Steps:
1. **Accept Invitation**
   - Accept an invitation normally (Scenario 1 or 2)

2. **Try Again**
   - Click the same invitation link again
   - Or go to the same URL: `/invite/accept?token={same-token}`

3. **Verify Error**
   - ✅ Verify: Shows blue info alert
   - ✅ Verify: Message: "Already a Member"
   - ✅ Verify: Text: "You are already a member of this team."
   - ✅ Verify: "Go to {Team Name}" button appears
   - ✅ Verify: Clicking button goes to team dashboard

---

### **Scenario 7: Already Team Member (Different Invitation)**

**Goal:** Test that users can't join the same team twice via different invitations.

#### Steps:
1. **Accept First Invitation**
   - Accept invitation to join Team A

2. **Send Second Invitation**
   - Have coach send another invitation to same email for Team A
   - (Simulates coach accidentally sending duplicate)

3. **Try Second Invitation**
   - Click second invitation link

4. **Verify Error**
   - ✅ Verify: Shows "Already a Member" error
   - ✅ Verify: Can navigate to team dashboard

---

### **Scenario 8: Password Validation**

**Goal:** Test that password validation works during sign-up.

#### Steps:
1. **Start Sign Up**
   - Open invitation link
   - Stay on "Create Account" tab

2. **Test Short Password**
   - Enter password: `abc`
   - Try to submit
   - ✅ Verify: Error: "Password must be at least 6 characters"

3. **Test Mismatched Passwords**
   - Enter password: `password123`
   - Confirm password: `different456`
   - Try to submit
   - ✅ Verify: Error: "Passwords do not match"

4. **Test Empty Fields**
   - Leave password blank
   - Try to submit
   - ✅ Verify: Shows validation errors for required fields

---

### **Scenario 9: Multiple Teams**

**Goal:** Test that a user can join multiple teams via invitations.

#### Steps:
1. **Join First Team**
   - Accept invitation to Team A
   - Verify successful join

2. **Join Second Team**
   - Receive invitation to Team B (different team, same email)
   - Click invitation link
   - Should auto-accept (already logged in)
   - ✅ Verify: Successfully joins Team B
   - ✅ Verify: Still has access to Team A

3. **Verify Multi-Team Access**
   - ✅ Verify: Team switcher shows both teams
   - ✅ Verify: Can navigate between Team A and Team B
   - ✅ Verify: Each team has correct role/permissions

---

## 🔍 Things to Watch For

### **Console Logs**
While testing, open browser console (F12) and watch for:
- ❌ Any errors (should be minimal/none)
- ℹ️ Auth state changes
- ℹ️ Invitation acceptance logs
- ⚠️ RLS policy violations (shouldn't happen)

### **Database State**
After each acceptance, verify in Supabase:
- `team_invitations.invitation_status = 'accepted'`
- `team_members` row created
- `profiles` row exists with correct metadata
- No duplicate team members

### **Navigation**
- URLs should update correctly
- Back button should work (but shouldn't break flow)
- Redirects should happen automatically

### **UI/UX**
- Loading states should be clear
- Error messages should be helpful
- Forms should be intuitive
- Pre-filled fields should be obvious
- Success confirmation should be satisfying

---

## 🐛 Common Issues & Fixes

### **Issue: "Failed to load invitation details"**
**Cause:** Token doesn't exist in database  
**Fix:** Verify token in `team_invitations` table, ensure `invitation_token` matches URL parameter

### **Issue: Stuck on "Accepting invitation..."**
**Cause:** `acceptInvitation()` service call failing  
**Fix:** Check console for errors, verify RLS policies allow INSERT into `team_members`

### **Issue: Redirect doesn't happen**
**Cause:** JavaScript error or `teamId` is null  
**Fix:** Check console, verify `result.teamId` is returned from acceptance

### **Issue: User joined but can't see team**
**Cause:** RLS policies blocking team access  
**Fix:** Verify `team_members.status = 'active'` and check SELECT policies

### **Issue: Email not pre-filling**
**Cause:** `user_id` not linked to invitation or profile missing  
**Fix:** Check `team_invitations.user_id` and `profiles` table

---

## ✅ Success Criteria

The invitation acceptance flow is **COMPLETE** when:

- ✅ New users can create accounts via invitation
- ✅ Existing users can sign in and accept
- ✅ Logged-in users are auto-accepted
- ✅ Invalid/expired tokens show proper errors
- ✅ Users can't accept same invitation twice
- ✅ Users redirect to team dashboard after acceptance
- ✅ Database reflects accepted status correctly
- ✅ Team members can access their new team immediately
- ✅ Multi-team invitations work correctly

---

## 📝 Test Results Template

Copy this for each test run:

```
Date: ___________
Tester: ___________
Environment: Local / Staging / Production

Scenario 1 (New User Sign Up):       ☐ Pass  ☐ Fail  Notes: ___________
Scenario 2 (Existing User Sign In):  ☐ Pass  ☐ Fail  Notes: ___________
Scenario 3 (Already Logged In):      ☐ Pass  ☐ Fail  Notes: ___________
Scenario 4 (Invalid Token):          ☐ Pass  ☐ Fail  Notes: ___________
Scenario 5 (Expired Token):          ☐ Pass  ☐ Fail  Notes: ___________
Scenario 6 (Already Accepted):       ☐ Pass  ☐ Fail  Notes: ___________
Scenario 7 (Already Team Member):    ☐ Pass  ☐ Fail  Notes: ___________
Scenario 8 (Password Validation):    ☐ Pass  ☐ Fail  Notes: ___________
Scenario 9 (Multiple Teams):         ☐ Pass  ☐ Fail  Notes: ___________

Issues Found: ___________
Overall Status: ☐ Ready for Production  ☐ Needs Fixes
```

---

## 🚀 Next Steps After Testing

Once this testing is complete:
1. Mark "Test invitation acceptance flow" as ✅ complete
2. Move to "Test complete end-to-end invitation flow"
3. Test family permissions functionality
4. Consider adding email notifications for announcements

---

**Ready to test?** Start with Scenario 1 (New User - Sign Up Flow)! 🎯

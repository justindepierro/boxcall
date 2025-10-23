# BoxCall Player Invitation Launch Roadmap

**Created:** October 23, 2025  
**Target:** Full player invitation capability + enhanced social features  
**Current State:** Roster 95% ready, Invitations 60% ready (MVP complete, email pending)  
**Estimated Time to Launch:** 15-20 hours (1-2 weeks part-time)

---

## 🎯 Mission Critical Path (Player Invitations)

### Phase 1: Email Service Setup (30 mins - 1 hour)
**Status:** Not Started  
**Blocker Level:** CRITICAL - Must complete before any invitations can be sent

#### Tasks:
- [ ] Sign up for Resend account (resend.com)
- [ ] Verify domain or use Resend sandbox for testing
- [ ] Generate API key from Resend dashboard
- [ ] Add environment variables:
  ```env
  VITE_RESEND_API_KEY=re_xxxxx
  RESEND_FROM_EMAIL=noreply@boxcall.com  # or sandbox
  ```
- [ ] Install Resend SDK: `npm install resend`
- [ ] Test API connection with simple email

**Validation:**
- ✅ Can send test email via Resend dashboard
- ✅ Environment variables loaded correctly
- ✅ SDK installed and importable

---

### Phase 2: Email Integration (4-6 hours)
**Status:** Not Started  
**Blocker Level:** CRITICAL - Core invitation flow depends on this

#### Tasks:

**2.1 Create Email Templates (1-2 hours)**
- [ ] Create `src/services/email/templates/` directory
- [ ] Build `PlayerInvitationTemplate.tsx` component:
  - Team logo and name
  - Personalized greeting with player name
  - Clear call-to-action button
  - Invitation link with token
  - Expiration notice (7 days)
  - Footer with contact info
- [ ] Build `InvitationReminderTemplate.tsx` for resends
- [ ] Create plain text fallbacks for each template

**2.2 Implement Email Service (2-3 hours)**
- [ ] Create `src/services/emailService.ts`:
  ```typescript
  export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text: string;
  }
  
  export async function sendEmail(params: SendEmailParams): Promise<void>
  export async function sendPlayerInvitationEmail(...)
  export async function sendInvitationReminderEmail(...)
  ```
- [ ] Integrate Resend API with error handling
- [ ] Add email delivery logging to audit trail
- [ ] Implement retry logic for failed sends
- [ ] Add rate limiting (prevent abuse)

**2.3 Update invitationService.ts (1 hour)**
- [ ] Replace `console.log` with actual email calls
- [ ] Update `sendPlayerInvitation()`:
  ```typescript
  await sendPlayerInvitationEmail({
    to: email,
    playerName,
    teamName,
    invitationLink,
    expiresAt,
    invitedBy
  });
  ```
- [ ] Update `resendPlayerInvitation()` with reminder template
- [ ] Add email failure handling (mark invitation as failed)

**Validation:**
- ✅ Email arrives in inbox (not spam)
- ✅ Links work correctly
- ✅ Templates render properly on mobile and desktop
- ✅ Plain text fallback works
- ✅ Failed sends are logged and handled

---

### Phase 3: Invitation Acceptance Page (8-10 hours)
**Status:** Not Started  
**Blocker Level:** CRITICAL - Players can't join without this

#### Tasks:

**3.1 Create Acceptance Page Route (30 mins)**
- [ ] Add route to `src/App.tsx`:
  ```typescript
  <Route path="/invite/accept" element={<InvitationAcceptPage />} />
  ```
- [ ] Create page file: `src/pages/InvitationAcceptPage.tsx`
- [ ] Set up routing with token query parameter

**3.2 Build Token Validation (2-3 hours)**
- [ ] Create `useInvitationToken` hook:
  ```typescript
  export function useInvitationToken(token: string) {
    // Validate token format (UUID)
    // Check token exists in database
    // Verify not expired
    // Verify not already accepted
    // Return invitation details and team info
  }
  ```
- [ ] Add loading states (checking token...)
- [ ] Add error states:
  - Token invalid
  - Token expired (offer resend)
  - Already accepted
  - Team no longer exists
- [ ] Fetch team and invitation details

**3.3 Handle Authentication Flow (3-4 hours)**
- [ ] **If user logged in:**
  - Check if already a team member (show error)
  - Show confirmation: "Join [Team Name] as [Player Name]?"
  - Call `acceptInvitation(token, currentUser.id)`
  - Redirect to team dashboard
  
- [ ] **If user not logged in:**
  - Show two-tab interface:
    - "Sign Up" tab (new users)
    - "Sign In" tab (existing users)
  - Sign Up flow:
    - Email (pre-filled from invitation)
    - Password + confirm
    - First name, last name (from invitation)
    - Terms acceptance
    - Create account → auto-accept invitation → redirect
  - Sign In flow:
    - Email/password form
    - "Forgot password?" link
    - Sign in → auto-accept invitation → redirect

**3.4 Build Acceptance Confirmation (1-2 hours)**
- [ ] Create success state component
- [ ] Show team details:
  - Team name and logo
  - Welcome message
  - Your role: Player
  - Next steps (explore roster, check schedule, etc.)
- [ ] Add "Go to Dashboard" button
- [ ] Send welcome notification

**3.5 Error Handling & Edge Cases (1-2 hours)**
- [ ] Handle network errors gracefully
- [ ] Handle concurrent acceptance attempts
- [ ] Handle token tampering
- [ ] Add "Request new invitation" flow for expired tokens
- [ ] Add support contact info for issues

**Validation:**
- ✅ Token validation works for all edge cases
- ✅ Sign up flow creates user and accepts invitation atomically
- ✅ Sign in flow links existing user to invitation
- ✅ Already-logged-in users can accept smoothly
- ✅ Error messages are clear and actionable
- ✅ Mobile responsive design works
- ✅ Redirects to correct team dashboard after acceptance

---

### Phase 4: End-to-End Testing (2-3 hours)
**Status:** Not Started  
**Blocker Level:** HIGH - Must validate before real users

#### Test Scenarios:

**4.1 Happy Path Tests**
- [ ] Coach sends invitation from roster page
- [ ] Email arrives with correct details and formatting
- [ ] New user clicks link, signs up, joins team successfully
- [ ] Existing user clicks link, signs in, joins team successfully
- [ ] Logged-in user clicks link, accepts, joins team directly
- [ ] Player appears in roster with correct role
- [ ] Player can access team dashboard and features

**4.2 Error Path Tests**
- [ ] Invalid token shows error
- [ ] Expired token shows resend option
- [ ] Already accepted token shows appropriate message
- [ ] Deleted team shows error
- [ ] Network failure shows retry option
- [ ] Email bounce/failure is logged

**4.3 Security Tests**
- [ ] Token tampering is detected
- [ ] Rate limiting prevents spam
- [ ] RLS policies prevent unauthorized access
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized

**4.4 Performance Tests**
- [ ] Invitation creation < 500ms
- [ ] Email delivery < 5 seconds
- [ ] Page load time < 2 seconds
- [ ] Acceptance flow < 1 second

**Validation:**
- ✅ All happy paths work smoothly
- ✅ All error paths handled gracefully
- ✅ Security tests pass
- ✅ Performance meets targets
- ✅ Mobile experience is smooth

---

## 🚀 Launch Checklist

### Pre-Launch (Before inviting real players)
- [ ] All Phase 1-4 tasks complete
- [ ] Email templates reviewed by team
- [ ] Domain email verified (not sandbox)
- [ ] Production API keys configured
- [ ] Backup/rollback plan documented
- [ ] Support process defined (how to handle issues)
- [ ] Privacy policy updated (player data handling)
- [ ] Terms of service updated

### Soft Launch (Invite 5-10 test players)
- [ ] Select friendly test group
- [ ] Send invitations manually
- [ ] Monitor email delivery rates
- [ ] Watch for errors in logs
- [ ] Gather user feedback
- [ ] Fix any issues found
- [ ] Document common questions

### Full Launch (Open to all coaches)
- [ ] Announce feature to all coaches
- [ ] Create help documentation
- [ ] Add in-app tutorial/tooltip
- [ ] Monitor success/failure rates
- [ ] Set up analytics tracking
- [ ] Plan regular follow-ups

---

## 📈 Post-Launch Enhancements (Priority Ordered)

### High Priority (Within 2 weeks of launch)

**Family Permissions UI (4-5 hours)**
*Current State: Backend exists, UI missing*
- [ ] Add family permissions section to TeamSettings.tsx
- [ ] Create permission toggles:
  - View roster
  - View schedule
  - View stats
  - RSVP to events
  - Access fundraising
- [ ] Add description for each permission
- [ ] Implement save/update flow
- [ ] Show current permissions on roster page
- [ ] Update RosterPage to respect family permissions

**Email Notification Preferences (2-3 hours)**
- [ ] Add notification settings page
- [ ] Allow players/parents to opt out of:
  - Invitation reminders
  - Roster updates
  - Schedule changes
  - Announcements
- [ ] Respect preferences in emailService
- [ ] Add "Unsubscribe" link to all emails

**Bulk Invitation Import (3-4 hours)**
- [ ] Enhance CSV import to include invitations
- [ ] Add "Send invitations after import" checkbox
- [ ] Batch email sending with progress indicator
- [ ] Generate import summary report
- [ ] Handle duplicate emails gracefully

---

### Medium Priority (Within 1 month)

**Team Announcements System (8-10 hours)**
*Current State: Not implemented, mentioned in audit*
- [ ] Create `announcements` table in database
- [ ] Build announcement creation form (coaches only)
- [ ] Add rich text editor (e.g., TipTap, Quill)
- [ ] Support file attachments (images, PDFs)
- [ ] Implement pinning important announcements
- [ ] Add read receipts (optional)
- [ ] Send email notifications for new announcements
- [ ] Create announcements feed on team dashboard
- [ ] Filter by date, author, tags

**Enhanced Player Profiles (6-8 hours)**
- [ ] Add profile photo upload
- [ ] Add bio/about section
- [ ] Add parent/guardian contact info
- [ ] Add emergency contacts
- [ ] Add medical information (allergies, conditions)
- [ ] Add custom fields per team
- [ ] Privacy controls (what's visible to team)
- [ ] Export profile as PDF

**Invitation Analytics Dashboard (4-5 hours)**
- [ ] Track invitation metrics:
  - Sent count
  - Opened rate (email tracking)
  - Accepted rate
  - Time to acceptance
  - Expired/declined count
- [ ] Create visual dashboard
- [ ] Add filters (by team, date range, status)
- [ ] Export reports as CSV

---

### Low Priority (Nice to have)

**Social Features Expansion (20+ hours)**
- [ ] Team chat/messaging
- [ ] Photo galleries
- [ ] Event comments/discussions
- [ ] Player-to-player messaging (with parent approval)
- [ ] Team wall/feed
- [ ] Polls and surveys

**Advanced Invitation Features (10-12 hours)**
- [ ] Custom invitation messages per player
- [ ] Schedule automatic reminder emails
- [ ] Multi-language support
- [ ] SMS invitations (via Twilio)
- [ ] QR code invitations for in-person signups
- [ ] Invitation templates per team

**Integration Enhancements (Variable time)**
- [ ] Google Calendar sync for schedules
- [ ] Slack/Discord notifications
- [ ] Export roster to Google Contacts
- [ ] Import from other roster systems
- [ ] API for third-party integrations

---

## 📊 Success Metrics

### Week 1 Post-Launch
- **Target:** 50+ invitations sent
- **Target:** 70%+ acceptance rate
- **Target:** <5% email bounce rate
- **Target:** <1% error rate in acceptance flow
- **Target:** <10 support tickets

### Month 1 Post-Launch
- **Target:** 500+ players invited
- **Target:** 75%+ acceptance rate
- **Target:** Average 2 days time-to-acceptance
- **Target:** 80%+ email open rate
- **Target:** 4.5+ star user satisfaction

### Month 3 Post-Launch
- **Target:** 2,000+ active players
- **Target:** 50+ active teams using invitations
- **Target:** <2% churn rate
- **Target:** 90%+ feature adoption among coaches
- **Target:** Launch family permissions feature

---

## 🛠️ Technical Debt & Improvements

### Code Quality
- [ ] Add unit tests for invitationService (80%+ coverage)
- [ ] Add E2E tests for invitation flow (Playwright)
- [ ] Refactor email templates into reusable components
- [ ] Add JSDoc comments to email service functions
- [ ] Create type definitions for all email templates

### Performance
- [ ] Implement email queue for bulk invitations
- [ ] Add Redis caching for invitation lookups
- [ ] Optimize database queries (add indexes)
- [ ] Lazy load email templates
- [ ] Add CDN for email images

### Monitoring
- [ ] Add Sentry error tracking for email failures
- [ ] Set up email delivery monitoring dashboard
- [ ] Add logs for invitation lifecycle events
- [ ] Create alerts for high failure rates
- [ ] Track email open/click rates

---

## 🎨 UI/UX Polish

### Invitation Flow Improvements
- [ ] Add confetti animation on successful acceptance
- [ ] Show team preview before accepting
- [ ] Add "Meet the team" section with roster photos
- [ ] Progressive loading states
- [ ] Better mobile keyboard handling
- [ ] Accessibility audit (WCAG 2.1 AA)

### Email Design
- [ ] Professional email template design
- [ ] Consistent branding across all emails
- [ ] Dark mode support
- [ ] Inline CSS optimization
- [ ] A/B test subject lines

### Roster Page Enhancements
- [ ] Show invitation status badges
- [ ] Filter by invitation status
- [ ] Bulk resend invitations
- [ ] Copy invitation link to clipboard
- [ ] Show invitation history timeline

---

## 📝 Documentation Needs

### User Documentation
- [ ] How to invite players (coach guide)
- [ ] How to accept invitations (player guide)
- [ ] Troubleshooting common issues
- [ ] Video walkthrough (3-5 minutes)
- [ ] FAQ section

### Developer Documentation
- [ ] Email service API documentation
- [ ] Invitation flow architecture diagram
- [ ] Database schema documentation
- [ ] Testing strategy guide
- [ ] Deployment checklist

### Policy Documentation
- [ ] Data retention policy for expired invitations
- [ ] Email privacy policy
- [ ] GDPR compliance checklist
- [ ] COPPA compliance (for youth players)
- [ ] Terms of service update

---

## 🔥 Risk Assessment & Mitigation

### High Risk Items
1. **Email Deliverability**
   - Risk: Emails going to spam
   - Mitigation: Domain verification, SPF/DKIM setup, monitor spam scores
   
2. **Token Security**
   - Risk: Token theft or brute force
   - Mitigation: UUID tokens, expiration, rate limiting, audit logs
   
3. **Database Load**
   - Risk: Bulk invitations overload database
   - Mitigation: Queue system, rate limiting, connection pooling
   
4. **User Confusion**
   - Risk: Players don't understand acceptance flow
   - Mitigation: Clear UI, help text, video tutorial, support contact

### Medium Risk Items
1. **Email Bounce Rate**
   - Risk: Invalid emails entered by coaches
   - Mitigation: Email validation, suggestion UI, bounce handling
   
2. **Duplicate Accounts**
   - Risk: Users create multiple accounts with same email
   - Mitigation: Email uniqueness constraint, account merging flow
   
3. **Performance Degradation**
   - Risk: Slow page loads during peak usage
   - Mitigation: Caching, CDN, database optimization, monitoring

---

## 🗓️ Timeline Estimate

### Week 1: Foundation
- Day 1-2: Email service setup + integration (Phase 1-2)
- Day 3-5: Acceptance page build (Phase 3)
- Day 6-7: End-to-end testing (Phase 4)

### Week 2: Launch Prep
- Day 8-9: Bug fixes and polish
- Day 10-11: Documentation and help content
- Day 12: Soft launch with test group
- Day 13-14: Monitor and iterate

### Week 3: Full Launch
- Day 15: Full launch announcement
- Day 16-21: Monitor, support, iterate based on feedback

### Week 4+: Enhancements
- Family permissions UI
- Bulk invitation import
- Email preferences
- Begin announcements system

---

## 💡 Quick Wins (Can do anytime)

These are small improvements that provide value without blocking the critical path:

- [ ] Add invitation count to team dashboard
- [ ] Show "last invited" timestamp on roster
- [ ] Add success toast notifications
- [ ] Improve loading skeleton states
- [ ] Add keyboard shortcuts (e.g., Cmd+I to invite)
- [ ] Show invitation link preview in modal
- [ ] Add "Copy email template" for manual sending
- [ ] Create invitation status legend/help
- [ ] Add team stats (total players, pending invitations)
- [ ] Improve error messages with solutions

---

## 🎯 Next Immediate Action

**START HERE:** Phase 1 - Email Service Setup (30-60 minutes)

1. Go to [resend.com](https://resend.com) and create account
2. Verify email and choose plan (Free tier: 100 emails/day OK for testing)
3. Add domain or use sandbox: onboarding@resend.dev
4. Generate API key from dashboard
5. Add to `.env.local`:
   ```env
   VITE_RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```
6. Install SDK: `npm install resend`
7. Test with simple script:
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.VITE_RESEND_API_KEY);
   await resend.emails.send({
     from: 'onboarding@resend.dev',
     to: 'your-email@example.com',
     subject: 'Test from BoxCall',
     html: '<p>Email service working!</p>'
   });
   ```

Once email service is configured, you're ready to tackle Phase 2! 🚀

---

## 📞 Support & Resources

- **Resend Docs:** https://resend.com/docs
- **React Email Templates:** https://react.email
- **Supabase RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Email Best Practices:** https://www.emailonacid.com/blog/article/email-development/
- **WCAG Accessibility:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Document Version:** 1.0  
**Last Updated:** October 23, 2025  
**Next Review:** After Phase 4 completion

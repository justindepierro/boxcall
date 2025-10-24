# Announcements & Posts Feature Roadmap

## Overview

Comprehensive enhancement plan for the team announcements and posts system, transforming it into a full-featured social engagement platform.

---

## Phase 1: Social & Engagement Features ✅ IN PROGRESS

### 1.1 Enhanced Reactions System

**Status:** Planning
**Priority:** High
**Effort:** Medium (2-3 hours)

- [ ] Expand reaction types (👍 👏 🎯 🔥 ❤️ 💯 ⚡ 🙌)
- [ ] Reaction picker with emoji selector
- [ ] Show who reacted with each emoji
- [ ] Aggregate reaction counts per type
- [ ] Real-time reaction updates

**Technical:**

- Update `announcement_reactions` table with emoji type
- Create `ReactionPicker` component
- Add reaction tooltips showing user names

---

### 1.2 @Mention Notifications

**Status:** Planning
**Priority:** High
**Effort:** Medium (3-4 hours)

- [ ] Detect mentions when announcement is published
- [ ] Create notification system/table
- [ ] Send in-app notifications to mentioned users
- [ ] Optional: Email notifications for mentions
- [ ] Notification center UI

**Technical:**

- Create `notifications` table (user_id, type, content, read, announcement_id)
- Extract mentions from content_json on save
- Create `NotificationsService`
- Add notification bell icon in header

---

### 1.3 Clickable Hashtags in Content

**Status:** Planning
**Priority:** Medium
**Effort:** Small (1-2 hours)

- [ ] Make hashtags in post content clickable
- [ ] Auto-apply filter when hashtag clicked
- [ ] Add hover effect to hashtags
- [ ] Smooth scroll to top when filtering

**Technical:**

- Add click handler to `.hashtag` CSS class
- Pass `onHashtagClick` prop to `RichTextDisplay`
- Update `AnnouncementsList` to handle hashtag clicks from content

---

### 1.4 Share & Forward

**Status:** Planning
**Priority:** Low
**Effort:** Medium (2-3 hours)

- [ ] Copy link to announcement
- [ ] Share via email (with preview)
- [ ] Cross-team sharing (if user is on multiple teams)
- [ ] Generate shareable public links (optional)

**Technical:**

- Add share button to announcement actions
- Create share modal with options
- Generate unique URLs for announcements

---

## Phase 2: Content Management Features

### 2.1 Draft Mode

**Status:** Planning
**Priority:** High
**Effort:** Medium (2-3 hours)

- [ ] Save drafts before publishing
- [ ] Auto-save drafts every 30 seconds
- [ ] Draft indicator in UI
- [ ] Drafts list/management page
- [ ] Convert draft to published

**Technical:**

- Add `status` field to announcements table ('draft', 'published', 'scheduled')
- Create `DraftsService`
- Add auto-save logic to `AnnouncementEditor`
- Filter drafts from main list (show separately)

---

### 2.2 Scheduled Posts

**Status:** Planning
**Priority:** Medium
**Effort:** High (4-5 hours)

- [ ] Schedule announcements for future dates
- [ ] Date/time picker in editor
- [ ] Scheduled posts list
- [ ] Backend cron job to publish scheduled posts
- [ ] Edit/cancel scheduled posts

**Technical:**

- Add `scheduled_for` timestamp to announcements
- Create Supabase Edge Function for scheduled publishing
- Add scheduling UI to `AnnouncementEditor`
- Create scheduled posts view

---

### 2.3 Rich Media Support

**Status:** Planning
**Priority:** Medium
**Effort:** Medium (3-4 hours)

- [ ] Video uploads (MP4, MOV)
- [ ] PDF attachments
- [ ] Multiple file attachments
- [ ] File preview/download
- [ ] File size limits and validation

**Technical:**

- Extend `imageUploadService` to handle multiple file types
- Add video player component
- PDF preview with react-pdf
- Update storage bucket policies

---

### 2.4 Polls & Surveys

**Status:** Planning
**Priority:** Medium
**Effort:** High (5-6 hours)

- [ ] Add poll option to announcement editor
- [ ] Poll creation UI (question + options)
- [ ] Vote on polls
- [ ] Real-time poll results
- [ ] Poll expiration dates
- [ ] Single/multiple choice polls

**Technical:**

- Create `polls` table (announcement_id, question, options[], expires_at)
- Create `poll_votes` table (poll_id, user_id, option_index)
- Build `PollEditor` and `PollDisplay` components
- Add poll results visualization

---

### 2.5 Announcement Templates

**Status:** Planning
**Priority:** Low
**Effort:** Medium (2-3 hours)

- [ ] Pre-built templates (Practice, Game Day, Event, General)
- [ ] Template selector in editor
- [ ] Custom templates (save as template)
- [ ] Template variables (date, time, location)

**Technical:**

- Create `announcement_templates` table
- Add template picker to editor
- Variable substitution system

---

## Phase 3: Organization & Discovery Features

### 3.1 Categories & Tags

**Status:** Planning
**Priority:** Medium
**Effort:** Medium (2-3 hours)

- [ ] Formal category system (Practice, Game, Event, News, General)
- [ ] Category picker in editor
- [ ] Category badges in UI
- [ ] Filter by category
- [ ] Category-based permissions

**Technical:**

- Add `category` field to announcements
- Create category enum/constants
- Update filters UI

---

### 3.2 Full-Text Search

**Status:** Planning
**Priority:** High
**Effort:** Medium (3-4 hours)

- [ ] Search bar in announcements list
- [ ] Search by title, content, hashtags, mentions
- [ ] Search highlighting
- [ ] Recent searches
- [ ] Search suggestions

**Technical:**

- Add search input to `AnnouncementsList`
- Use PostgreSQL full-text search or Supabase `.textSearch()`
- Debounce search input
- Highlight matching terms

---

### 3.3 Archive System

**Status:** Planning
**Priority:** Low
**Effort:** Small (1-2 hours)

- [ ] Auto-archive announcements older than X days
- [ ] Manual archive/unarchive
- [ ] Archived announcements view
- [ ] Archive indicator

**Technical:**

- Add `archived` boolean to announcements
- Create archive button
- Filter archived by default
- Add "View Archived" toggle

---

### 3.4 Sort Options

**Status:** Planning
**Priority:** Low
**Effort:** Small (1 hour)

- [ ] Sort by date (newest/oldest)
- [ ] Sort by reactions count
- [ ] Sort by comments count
- [ ] Sort by views count

**Technical:**

- Add sort dropdown to filters
- Update Supabase query with `.order()` clauses

---

## Phase 4: Advanced Features

### 4.1 Read Receipts Detail

**Status:** Planning
**Priority:** Medium
**Effort:** Medium (2-3 hours)

- [ ] Show WHO read the announcement
- [ ] List of readers with timestamps
- [ ] "Seen by" component
- [ ] Export read report
- [ ] Unread badge for users

**Technical:**

- Query `announcement_views` with user details
- Create `ReadReceiptsList` component
- Add export functionality

---

### 4.2 Comment Threading

**Status:** Planning
**Priority:** Medium
**Effort:** High (5-6 hours)

- [ ] Nested replies to comments
- [ ] Reply indicator/UI
- [ ] Collapse/expand threads
- [ ] Thread depth limit (3 levels)
- [ ] Notification for reply

**Technical:**

- Add `parent_comment_id` to comments table
- Recursive query for comment threads
- Update `AnnouncementComments` to handle threading
- Build nested comment UI

---

### 4.3 Edit History

**Status:** Planning
**Priority:** Low
**Effort:** Medium (3-4 hours)

- [ ] Track all edits to announcements
- [ ] "Edited" indicator
- [ ] View edit history
- [ ] Diff between versions
- [ ] Restore previous version

**Technical:**

- Create `announcement_history` table
- Save snapshot on each edit
- Build history viewer component
- Text diff library (diff-match-patch)

---

### 4.4 Multiple Pinned Announcements

**Status:** Planning
**Priority:** Low
**Effort:** Small (1 hour)

- [ ] Pin up to 3-5 announcements
- [ ] Pin order/priority
- [ ] Pin expiration dates
- [ ] Pinned section at top

**Technical:**

- Add `pin_order` field
- Update pin logic to support multiple
- Sort pinned by order

---

## Phase 5: Analytics & Insights

### 5.1 Announcement Analytics

**Status:** Planning
**Priority:** Medium
**Effort:** Medium (3-4 hours)

- [ ] View count over time graph
- [ ] Engagement rate (reactions + comments / views)
- [ ] Peak viewing times
- [ ] Demographics (who viewed/engaged)
- [ ] Export analytics data

**Technical:**

- Create `AnnouncementAnalytics` component
- Build chart visualizations (recharts)
- Aggregate queries for stats

---

### 5.2 Team Engagement Dashboard

**Status:** Planning
**Priority:** Low
**Effort:** High (4-5 hours)

- [ ] Overall team engagement metrics
- [ ] Most engaged members
- [ ] Most popular hashtags
- [ ] Announcement performance leaderboard
- [ ] Engagement trends

**Technical:**

- Create `/team/:id/analytics/announcements` route
- Build dashboard with multiple charts
- Cache analytics data for performance

---

## Implementation Priority

### Sprint 1 (High Priority - Core Features)

1. Enhanced Reactions System (1.1)
2. @Mention Notifications (1.2)
3. Draft Mode (2.1)
4. Full-Text Search (3.2)

**Estimated Time:** 10-14 hours

### Sprint 2 (Medium Priority - Engagement)

5. Clickable Hashtags (1.3)
6. Scheduled Posts (2.2)
7. Categories & Tags (3.1)
8. Read Receipts Detail (4.1)

**Estimated Time:** 10-13 hours

### Sprint 3 (Polish & Advanced)

9. Rich Media Support (2.3)
10. Polls & Surveys (2.4)
11. Comment Threading (4.2)
12. Announcement Analytics (5.1)

**Estimated Time:** 17-21 hours

### Sprint 4 (Nice-to-Have)

13. Share & Forward (1.4)
14. Templates (2.5)
15. Archive System (3.3)
16. Sort Options (3.4)
17. Edit History (4.3)
18. Multiple Pins (4.4)
19. Team Dashboard (5.2)

**Estimated Time:** 13-18 hours

---

## Success Metrics

- [ ] Average time to read announcements < 30 seconds
- [ ] Engagement rate (reactions/comments) > 40%
- [ ] Read rate > 80% within 24 hours
- [ ] User satisfaction score > 4.5/5
- [ ] Daily active announcement users > 60% of team

---

## Notes

- All features should maintain mobile responsiveness
- Accessibility (WCAG 2.1 AA) must be maintained
- Type safety (TypeScript) required for all new code
- Unit tests for critical business logic
- Performance: Page load < 2s, interactions < 100ms

---

**Created:** October 24, 2025  
**Status:** Ready for Implementation  
**Next:** Execute Sprint 1 features

# 🏀 Phase 5: Team Management System - Development Roadmap

## **🎯 Overview**

Complete team management system with roster management, CSV import, coach invitations, and team configuration.

## **📋 Feature Breakdown**

### **5.1 Player Management System**

**Priority**: High | **Estimated Time**: 3-4 hours

#### **5.1.1 Player Data Model**

- [ ] Update database schema for comprehensive player data
- [ ] Player profile fields:
  - Basic Info: First Name, Last Name, Email
  - Contact: Phone Number (optional), Parent Email (optional)
  - Physical: Position(s), Jersey Number, Height, Weight
  - Academic: Graduating Year
  - Team Level: Varsity, JV, Middle School tags
- [ ] TypeScript types for player data

#### **5.1.2 Manual Player Entry**

- [ ] Add Player form component with validation
- [ ] Position selection with hashtag-style multi-select
- [ ] Team level selection (Varsity/JV/MS)
- [ ] Form validation and error handling
- [ ] Success feedback and roster refresh

#### **5.1.3 Player List & Management**

- [ ] Roster display component with search/filter
- [ ] Edit player functionality
- [ ] Remove player with confirmation
- [ ] Player detail view/modal
- [ ] Export roster functionality

### **5.2 CSV Import System**

**Priority**: High | **Estimated Time**: 2-3 hours

#### **5.2.1 CSV Parser Setup**

- [ ] Install PapaParse dependency
- [ ] Create CSV parsing utilities
- [ ] MaxPreps CSV format compatibility
- [ ] Error handling for malformed CSV

#### **5.2.2 File Upload Interface**

- [ ] Drag-and-drop file upload component
- [ ] File validation (CSV only, size limits)
- [ ] Progress indicators
- [ ] Upload error handling

#### **5.2.3 Import Confirmation Flow**

- [ ] Preview parsed data in table format
- [ ] Edit/correct parsed data before import
- [ ] Column mapping interface (CSV headers to our fields)
- [ ] Duplicate detection and handling
- [ ] Batch import with progress tracking

#### **5.2.4 Template & Documentation**

- [ ] MaxPreps-compatible CSV template download
- [ ] Import instructions and field mapping guide
- [ ] Sample CSV with example data

### **5.3 Coach Management System**

**Priority**: Medium | **Estimated Time**: 2-3 hours

#### **5.3.1 Coach Invitation System**

- [ ] Add Coach form with role selection
- [ ] Email invitation system via Supabase
- [ ] Push notification invites (future)
- [ ] QR Code generation for quick invites

#### **5.3.2 Coach Management Interface**

- [ ] List current coaches with roles
- [ ] Manage coach permissions
- [ ] Remove coaches from team
- [ ] Role hierarchy (Head Coach > Assistant > etc.)

### **5.4 Team Configuration**

**Priority**: Medium | **Estimated Time**: 2-3 hours

#### **5.4.1 Team Profile Management**

- [ ] Team logo upload and management
- [ ] Team information editing:
  - Team Name
  - Location/City
  - State Association
  - League/Conference
  - School/Organization
- [ ] Team settings and preferences

#### **5.4.2 Integration Foundations**

- [ ] School/Organization lookup system foundations
- [ ] State association data structure
- [ ] League/conference management
- [ ] Future: Integration with school finder databases

### **5.5 Advanced Features**

**Priority**: Low | **Estimated Time**: 3-4 hours

#### **5.5.1 Sub-Team Management**

- [ ] Varsity/JV/MS team separation
- [ ] Player movement between teams
- [ ] Team-specific rosters and stats

#### **5.5.2 Communication Features**

- [ ] Parent invitation system
- [ ] Team communication tools
- [ ] Notification preferences

## **🏗️ Implementation Order**

### **Phase 5A: Foundation (Day 1)**

1. **Database Schema Updates** - Player and team tables
2. **Basic Player Management** - Add/edit/remove players manually
3. **Team Configuration** - Basic team info editing

### **Phase 5B: CSV Import (Day 1-2)**

1. **CSV Parser Integration** - PapaParse setup and utilities
2. **File Upload Component** - Drag-and-drop interface
3. **Import Confirmation** - Preview and edit parsed data
4. **Template Download** - MaxPreps-compatible template

### **Phase 5C: Coach Management (Day 2)**

1. **Coach Invitation System** - Email invites and role management
2. **QR Code Invites** - Quick invite system for in-person
3. **Coach Management UI** - List, edit, remove coaches

### **Phase 5D: Advanced Features (Day 3)**

1. **Team Logo Upload** - File upload and image management
2. **Sub-Team Support** - Varsity/JV/MS separation
3. **Enhanced Search/Filter** - Advanced roster management

## **📊 Database Schema Changes Required**

### **New Tables**

```sql
-- Enhanced player profiles
team_players (
  id, team_id, user_id,
  first_name, last_name, email,
  phone, parent_email,
  positions, jersey_number,
  height, weight, graduation_year,
  team_level, created_at, updated_at
)

-- Coach invitations
coach_invitations (
  id, team_id, email, role,
  invite_token, status, expires_at,
  invited_by, created_at
)

-- Team configuration
teams (
  -- Add columns:
  logo_url, location, state_association,
  league, school_name, settings
)
```

## **🎨 UI Components Needed**

### **Major Components**

- [ ] `TeamDashboard` - Main team management interface
- [ ] `PlayerForm` - Add/edit player modal
- [ ] `PlayerList` - Roster display with search/filter
- [ ] `CSVImport` - Complete CSV import flow
- [ ] `CoachInvite` - Coach invitation system
- [ ] `TeamSettings` - Team configuration panel

### **Utility Components**

- [ ] `FileUpload` - Drag-and-drop file upload
- [ ] `PositionSelector` - Multi-select position tags
- [ ] `QRCodeDisplay` - QR code generation
- [ ] `ImportPreview` - CSV data preview table

## **🔧 Technical Considerations**

### **Dependencies to Add**

- [ ] `papaparse` - CSV parsing
- [ ] `@types/papaparse` - TypeScript types
- [ ] `qrcode` - QR code generation (optional)
- [ ] File upload handling utilities

### **Performance Considerations**

- [ ] Lazy loading for large rosters
- [ ] CSV parsing in chunks for large files
- [ ] Image optimization for team logos
- [ ] Efficient search/filter implementation

### **Security Considerations**

- [ ] File upload validation and sanitization
- [ ] CSV injection prevention
- [ ] Role-based access for team management
- [ ] Invitation token security

## **📱 User Experience Flow**

### **Coach Onboarding Flow**

1. Create team → Upload logo → Basic team info
2. Add players manually OR import CSV
3. Invite other coaches
4. Configure team settings

### **Player Import Flow**

1. Download template → Fill in Excel/Sheets → Upload CSV
2. Preview parsed data → Make corrections → Confirm import
3. Review roster → Send parent invitations

### **Daily Management Flow**

1. View roster → Search/filter players → Edit as needed
2. Manage coaches → Send invites → Adjust permissions
3. Export data → Generate reports

## **🎯 Success Metrics**

### **Functionality Goals**

- [ ] Import 50+ player roster in under 2 minutes
- [ ] Zero data loss during CSV import
- [ ] Mobile-responsive team management
- [ ] Sub-5 second team dashboard load times

### **User Experience Goals**

- [ ] Intuitive CSV import with clear error messages
- [ ] One-click coach invitations
- [ ] Professional team management interface
- [ ] Seamless mobile experience

---

## **🚀 Ready to Start Implementation?**

This roadmap gives us a clear path forward. We can start with **Phase 5A (Foundation)** to get the basic player management working, then move through the phases systematically.

**Recommended Starting Point**:

1. Database schema updates
2. Basic player management interface
3. Team configuration basics

Then we can tackle the exciting CSV import system and coach invitations!

What do you think? Ready to dive into Phase 5A? 🏈

# 🏈 BoxCall Hierarchical Permission System

## 📋 **Overview**

This document outlines the comprehensive permission hierarchy implemented in BoxCall, handling both **app-level subscriptions** and **team-level roles** as specified by the product requirements.

## 🎯 **Access Hierarchy**

### **1. Super Admin (Developer Level)**
- **Access**: Everything in the system
- **Cost**: Free (developer access)
- **Permissions**: Full system administration, all features unlocked
- **Use Case**: System maintenance, debugging, feature testing

### **2. Admin (GM Level)**  
- **Access**: Additional developers, smart friends testing for free
- **Cost**: Free (invited access)
- **Permissions**: User management, team oversight, testing access
- **Use Case**: Beta testing, customer support, system administration

### **3. Head Coach (Team Owner)**
- **Access**: Full team management capabilities
- **Cost**: $199 subscription + ability to purchase 5 staff keys for $40 (normally $50)
- **Permissions**: 
  - Create and manage teams
  - Full roster management
  - Upload playbooks
  - Invite coaching staff
  - Configure family permissions
  - Team settings and subscription management
- **Includes**: 1 free coaching staff key (6 total possible)

### **4. Coach (Staff & Independent)**

#### **4a. Team Staff Coach**
- **Access**: Coaching tools within a specific team
- **Cost**: $8 each (via Head Coach's staff addon package)
- **Permissions**:
  - Playbook creation and editing
  - Team dashboard access
  - Live game stats
  - Practice scripts and modes
  - Team roster viewing

#### **4b. Independent Coach**
- **Access**: Playbook tools only (no team affiliation)
- **Cost**: $9.99 one-time
- **Permissions**:
  - Create and edit playbooks
  - Export PDF scripts
  - Practice playcalling mode
  - Save personal playbook library

### **5. Manager (Team Helper)**
- **Access**: Limited team administration
- **Cost**: Free (invited by Head Coach)
- **Permissions**:
  - Live game statistics
  - Practice scripts and practice mode
  - Scheduling management
  - Limited dashboard access

### **6. Player (Team Member)**
- **Access**: Team dashboard and assigned content
- **Cost**: Free
- **Permissions**:
  - View team dashboard
  - Access team roster
  - View schedule and calendar
  - Access assigned playbooks

### **7. Family (Parent/Guardian)**
- **Access**: Limited parent view (configurable by Head Coach)
- **Cost**: Free
- **Permissions** (configurable):
  - View team calendar
  - RSVP to team events
  - Limited dashboard access
  - Fundraising options
  - View roster (if enabled)

## 🔧 **Technical Implementation**

### **Permission Matrix System**
```typescript
// Example permission check
hasPermission(userType, teamRole, subscription, 'team.roster_management')
canAccessTeamFeature(userType, teamRole, subscription, 'management')
```

### **Route Protection**
- `PermissionRoute` - Advanced permission-based route protection
- `TeamManagementRoute` - Head Coach and staff access
- `TeamDashboardRoute` - Team member access
- `PlaybookRoute` - Coach and above access
- `FamilyRoute` - Family member access

### **Database Structure**
- **App-level**: `profiles.role` - User's subscription type
- **Team-level**: `team_members.role` - Role within specific team
- **Permissions**: Dynamic permission calculation based on hierarchy

## 📱 **User Experience by Role**

### **Navigation Adapts by Role**
- **Super Admin/Admin**: Full navigation including team management, playbooks, admin panels
- **Head Coach**: Team management, playbooks, dashboard, settings
- **Coach**: My team, playbooks (staff) OR just playbooks (independent)
- **Manager**: Limited team tools, practice management
- **Player**: Team dashboard, schedule, assigned content
- **Family**: Calendar, limited dashboard (based on head coach settings)

### **Feature Gating**
- **Subscription Verification**: Features unlock based on payment status
- **Team Role Verification**: Additional permissions within teams
- **Super Admin Override**: Developers can access everything for testing

## 🎯 **Business Model Integration**

### **Revenue Streams**
1. **Team Premium**: $199/month (Head Coach subscription)
2. **Staff Add-ons**: 5 for $40 (normally $8 each)
3. **Independent Coach**: $9.99 one-time (playbook tools)

### **Scalability**
- Head Coaches can purchase additional staff keys
- Family permissions are configurable per team
- Independent coaches can upgrade to team subscriptions

## 🚀 **Implementation Status**

### **✅ Completed**
- Permission type definitions
- Hierarchical access matrix
- Route protection system
- Navigation adaptation
- Super admin bypass functionality

### **🔄 In Progress**
- Database schema updates for subscription tracking
- Payment integration for subscription management
- Team invitation system for coaches and family

### **📋 Next Steps**
1. Update database schema for new permission structure
2. Implement subscription management system
3. Create coach invitation workflow
4. Build family permission configuration UI
5. Add playbook management system

---

**🎉 The permission system now properly reflects your business model and provides the hierarchical access control needed for BoxCall's multi-tier subscription system!**

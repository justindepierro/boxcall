# 🏈 BoxCall - The Ultimate Football Team Ecosystem

> **Complete team management platform with AI-powered play calling, social hub, and performance analytics**

**BoxCall** is the comprehensive football platform that connects teams like Hudl but focuses on playbook intelligence and team connectivity rather than video. Our AI-driven confidence system analyzes your playbook data to help coordinators call the perfect play in every situation, while our social team dashboard keeps everyone connected and motivated.

## 🎯 **Project Vision & Development Philosophy**

BoxCall transforms how football teams operate across youth, high school, and college levels by providing:

### **🧠 AI-Powered Play Intelligence**
- **Confidence System** - Machine learning analyzes play success vs. situations (down, distance, field position, coverage)
- **Smart Recommendations** - AI suggests optimal plays based on current game state and historical data
- **Practice Script Generation** - Automatically create practice plans from playbook analysis
- **Game Plan Optimization** - Data-driven game planning with situational play calling

### **📚 Advanced Playbook Management**
- **CSV Import System** - Upload existing playbooks with formations, plays, personnel, and situational data
- **Dynamic Filtering** - Filter plays by formation, personnel, down/distance, coverage, field position
- **Play Categorization** - Organize by run/pass, RPO, special situations, red zone, etc.
- **Formation Analysis** - Track formation effectiveness and usage patterns

### **🏆 Social Team Hub & Gamification**
- **Team Dashboard** - Social media-like hub for team connectivity and communication
- **Achievement System** - Team trophies, individual helmet stickers, and performance medals
- **Goal Tracking** - Set and monitor team objectives throughout the season
- **Family Engagement** - Connect parents and supporters with appropriate access levels

### **👥 Role-Based Team Management**
- **Multi-Level Access** - Coaches, players, managers, and families with permission-based features
- **Team Hierarchy** - Head coaches control team settings, coordinators manage playbooks, players view assignments
- **Communication Tools** - Announcements, messaging, and updates based on user roles
- **Roster Management** - Complete player profiles, positions, stats, and contact information

### **🏗️ Development Philosophy: Foundation First**
BoxCall is being built with a **foundation-first approach** - establishing rock-solid infrastructure before implementing core features:

1. **Component System** - Complete UI component library with consistent design
2. **Database Architecture** - Comprehensive schema supporting all features
3. **Role-Based Access** - Granular permissions system for multi-user teams
4. **File Management** - Robust upload/download system for CSV, images, documents
5. **Real-Time Communication** - Live messaging and notification infrastructure
6. **State Management** - Scalable state system with offline sync capabilities

*Timeline: No pressure development - targeting 2026-2027 football season, with playbook system testing in 2025*

---

## 🏗️ **Architecture Overview**

### **Tech Stack**
- **Frontend**: Vanilla JavaScript (ES6+) with modular architecture
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized builds
- **Database**: Supabase (PostgreSQL) with real-time features
- **Icons**: Lucide icon system
- **Authentication**: Supabase Auth with role-based access

### **Project Structure**
```
boxcall-app/
├── src/
│   ├── app/                    # App initialization and core setup
│   ├── auth/                   # Authentication system
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (buttons, forms, etc.)
│   │   ├── layout/             # Layout components
│   │   └── sidebar/            # Navigation system
│   ├── config/                 # Configuration files
│   ├── core/                   # Core business logic
│   ├── lib/                    # External integrations and utilities
│   ├── logic/                  # Business logic modules
│   ├── pages/                  # Application pages/views
│   ├── render/                 # Rendering system
│   ├── routes/                 # Routing and navigation
│   ├── state/                  # State management
│   ├── styles/                 # CSS and design system
│   └── utils/                  # Utility functions
├── public/                     # Static assets
└── docs/                       # Documentation and examples
```

---

## � **Business Model & Pricing**

BoxCall operates on a tiered subscription model designed to serve teams of all sizes:

### **Free Account** 
- Basic team profiles and connectivity
- Limited playbook viewing (read-only)
- Basic dashboard access
- Individual player/parent accounts

### **Coach Account - $9.99 (One-time)**
- Full playbook management and creation
- Practice script generation
- Play analysis and filtering
- Personal coaching tools
- CSV import/export

### **Team Premium - $199.99/year**
- Complete team ecosystem (Head Coach only)
- AI-powered confidence system
- Advanced analytics and reporting
- Full social team hub with gamification
- Multi-role team management
- Real-time collaboration tools
- Priority support

*Perfect for youth through college programs - scales with your team's needs*

---

## 🚀 **Key Features & Differentiators**

### **🎯 What Makes BoxCall Unique**

**vs. Hudl**: We focus on playbook intelligence and team connectivity instead of video analysis  
**vs. Other Platforms**: Our AI confidence system learns your specific playbook to recommend plays  
**vs. Manual Systems**: Complete digital transformation with role-based access for entire team family

### **🧠 The Confidence System**
Our core innovation analyzes your playbook data against situational factors:
- **Down & Distance** - What works on 3rd and short vs. 2nd and long
- **Field Position** - Red zone vs. midfield tendencies  
- **Coverage Recognition** - Play success against man vs. zone
- **Personnel Matching** - Optimal formations for your personnel groups
- **Historical Performance** - Learn from past success/failure patterns

### **📊 CSV Playbook Integration**
Upload your existing playbooks with columns like:
```csv
Formation,FDir,Play,pType,prefDown,prefDis,prefHash,prefCov,checkInto,Personnel
River,R,Squid,Pass,1,Long,R,Zone,QB OZ Rt,Reg
Purple,R,IZ,Run,2,Short,M,Man,,Reg
Trio,L,Trail,Pass,3,Short,L,Man,Truck Rt,Reg
```

---

## �🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd boxcall-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Setup**
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📱 **Core Features**

### **🏠 Dashboard**
- Overview of team status and recent activity
- Quick access to key features
- Performance metrics and insights

### **👥 Team Management**
- Create and join teams
- Manage player rosters
- Role-based permissions (coach, player, admin)
- Team settings and preferences

### **📖 Playbook**
- Digital play creation and management
- Categorize plays by formation, situation, etc.
- Visual play diagrams and notes
- Practice script generation

### **🎮 Live Game Mode**
- Real-time play calling interface
- Down and distance tracking
- Quick substitutions and adjustments
- Game flow management

### **📅 Calendar & Scheduling**
- Practice and game scheduling
- Event management
- Team calendar integration

### **⚙️ Settings & Preferences**
- Theme customization (7 built-in themes)
- User preferences
- Team configuration
- System settings

---

## 🧩 **Component System**

BoxCall uses a modern, reusable component architecture:

### **UI Components**
```javascript
// Form components
import { FormInput, FormSelect } from '@components/ui/formInput.js';
import { BaseButton, BaseToggle } from '@components/ui/index.js';

// Layout components
import { Card, Modal, Tabs } from '@components/index.js';
import { PageContainer } from '@components/layout/pageContainer.js';
```

### **Design System**
- **CSS Custom Properties** for theming
- **Tailwind CSS** for utility-first styling
- **Responsive Design** with mobile-first approach
- **Accessibility** built-in with ARIA support

---

## 🎨 **Theming System**

BoxCall includes 7 pre-built themes:
- **Default** - Clean and modern
- **Athletic** - Sports-focused design
- **Classic** - Traditional styling
- **Modern** - Contemporary look
- **Professional** - Business-oriented
- **Tech** - Technology-focused
- **Casual** - Relaxed and friendly

### **Theme Structure**
```css
/* CSS Custom Properties */
:root {
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-accent: #3b82f6;
  --color-sidebar: #1e293b;
  /* ... more variables */
}
```

---

## 🔐 **Authentication & Security**

### **User Roles**
- **Coach** - Full team management access
- **Player** - Limited access to assigned content
- **Admin** - System administration capabilities

### **Security Features**
- Supabase authentication with JWT tokens
- Role-based access control (RBAC)
- Secure API endpoints
- Data validation and sanitization

---

## 📊 **State Management**

BoxCall uses a lightweight state management system:

```javascript
// User state
import { userState } from '@state/userState.js';

// Sidebar state
import { sidebarState } from '@state/sidebarState.js';

// Development tools
import { devToolState } from '@state/devToolState.js';
```

---

## 🔧 **Development Tools**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check        # Run type checking and linting
```

### **Code Quality**
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **TypeScript** checking (without compilation)

---

## 🚀 **Deployment**

### **Build Process**
```bash
npm run build
```

### **Hosting Options**
- **Netlify** (recommended) - Includes build configuration
- **Vercel** - Easy deployment with Git integration
- **Traditional hosting** - Build and upload `dist/` folder

---

## 🤝 **Contributing**

### **Development Workflow**
1. Create feature branch from `main`
2. Make changes following coding standards
3. Run tests and linting
4. Submit pull request

### **Coding Standards**
- Use ES6+ JavaScript features
- Follow component-based architecture
- Use CSS custom properties for theming
- Write self-documenting code with JSDoc
- Maintain accessibility standards

---

## � **Roadmap**

See [TODO.md](./TODO.md) for detailed development roadmap and current priorities.

### **Upcoming Features**
- [ ] Enhanced play editor with visual diagrams
- [ ] Real-time collaboration tools
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with video analysis tools

---

## 🐛 **Known Issues**

Track current issues and bugs in [TODO.md](./TODO.md#bugs-and-issues).

---

## 📚 **Documentation**

- [Design System](./src/styles/designSystem.js) - Component patterns and standards
- [Example Modern Page](./docs/exampleModernPage.js) - Implementation reference
- [Component API](./src/components/README.md) - Component documentation (coming soon)

---

## 📄 **License**

This project is currently private. Contact the maintainer for licensing information.

---

## 👥 **Team**

**Project Maintainer**: [Your Name]  
**Contact**: [Your Email]

---

## 🆘 **Support**

For questions, bug reports, or feature requests:
1. Check existing issues in TODO.md
2. Create a new issue with detailed description
3. Contact project maintainer

---

*Last updated: July 26, 2025*

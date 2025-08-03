# BoxCall - Youth Sports Team Calendar Platform

**The all-in-one platform for managing youth sports team calendars, schedules, and communication.**

## 🎯 Overview

BoxCall is a comprehensive platform designed specifically for youth sports teams, coaches, and families. It provides intelligent scheduling, conflict detection, cross-platform calendar management, and seamless communication tools.

## 🏗️ Architecture

### **Multi-Platform Design**

```
boxcall/
├── 🌐 web/           # React + Vite web application
├── 📱 mobile/        # React Native mobile apps
├── 🔗 shared/        # Shared TypeScript services & types
├── 🛢️ database/      # Supabase schema & migrations
└── 📚 docs/          # Documentation & guides
```

### **Core Features**

- **📅 Intelligent Calendar Management** - Smart scheduling with conflict detection
- **🤖 AI-Powered Insights** - Attendance prediction and optimization recommendations
- **🔄 Cross-Platform Sync** - Seamless experience across web and mobile
- **👨‍👩‍👧‍👦 Family Coordination** - Multi-child scheduling and transportation planning
- **🏟️ Venue Management** - Facility booking and availability tracking
- **📊 Analytics Dashboard** - Team performance and attendance insights

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+ and npm
- Supabase account for backend services
- React Native CLI (for mobile development)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/justindepierro/boxcall.git
cd boxcall

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development servers
npm run dev          # Web application
npm run mobile       # Mobile application (requires setup)
npm run storybook    # Component library
```

### **Environment Setup**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

## 📋 Development Status

### **✅ Phase 1-3: COMPLETE**

- [x] Core calendar functionality
- [x] Authentication system
- [x] Intelligent scheduling features
- [x] Cross-platform services architecture
- [x] **ESLint cleanup (68/68 errors resolved)** ⭐

### **🚧 Phase 4: IN PROGRESS**

- [ ] Mobile optimization
- [ ] Advanced AI features
- [ ] Performance improvements
- [ ] Enhanced testing coverage

### **📊 Current Metrics**

- **ESLint:** ✅ 0 errors, 0 warnings
- **TypeScript:** ✅ Type-safe architecture
- **Test Coverage:** 🚧 In progress
- **Performance:** 🚧 Optimizing

## 🛠️ Development

### **Project Scripts**

```bash
npm run dev          # Start web development server
npm run build        # Build production web app
npm run preview      # Preview production build
npm run lint         # Run ESLint (now passes cleanly!)
npm run type-check   # TypeScript validation
npm run test         # Run test suite
npm run storybook    # Start component library
```

### **Code Quality**

- **ESLint** with TypeScript support (68/68 errors resolved)
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **TypeScript** for type safety
- **Vite** for fast development

### **Architecture Principles**

- **Service-oriented design** with shared business logic
- **Cross-platform compatibility** between web and mobile
- **Type-safe API integration** with Supabase
- **Component-driven development** with Storybook
- **Progressive enhancement** for mobile-first design

## 📱 Platforms

### **Web Application** (`/src/`)

- React 18 + TypeScript
- Vite for bundling and dev server
- Tailwind CSS for styling
- Zustand for state management

### **Mobile Application** (`/mobile/`)

- React Native with TypeScript
- Cross-platform iOS/Android support
- Native performance optimizations
- Shared business logic with web

### **Shared Services** (`/shared/`)

- TypeScript service layer
- Cross-platform API integration
- Shared types and interfaces
- Business logic abstractions

## 🔧 Technology Stack

### **Frontend**

- **React 18** - Component framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **React Hook Form** - Form handling

### **Mobile**

- **React Native** - Cross-platform mobile
- **React Navigation** - Mobile navigation
- **Async Storage** - Local data persistence
- **Push Notifications** - Real-time alerts

### **Backend**

- **Supabase** - Backend as a Service
- **PostgreSQL** - Primary database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

### **Development Tools**

- **Vite** - Fast development server
- **ESLint** - Code linting (completely clean!)
- **Prettier** - Code formatting
- **Storybook** - Component development
- **Jest** - Testing framework

## 📚 Documentation

- [**Development Guide**](./docs/development/) - Setup and contribution guidelines
- [**API Documentation**](./docs/api/) - Service layer and integrations
- [**Architecture Guide**](./docs/architecture/) - System design and patterns
- [**User Guide**](./docs/user/) - End-user documentation
- [**Deployment Guide**](./docs/deployment/) - Production setup

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Run tests** (`npm run test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### **Code Standards**

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Ensure ESLint passes (0 errors, 0 warnings)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for providing excellent backend services
- **React Community** for the amazing ecosystem
- **Youth Sports Community** for inspiration and feedback

---

**Built with ❤️ for youth sports teams everywhere**

[Documentation](./docs/) | [GitHub](https://github.com/justindepierro/boxcall) | [Issues](https://github.com/justindepierro/boxcall/issues)

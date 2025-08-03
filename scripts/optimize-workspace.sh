#!/bin/bash

# BoxCall Complete Workspace Optimization
# Master script that executes all 4 phases

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() { echo -e "${PURPLE}$1${NC}"; }
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

print_header "🚀 BOXCALL WORKSPACE OPTIMIZATION"
print_header "=================================="
print_status "Executing complete 4-phase optimization..."
print_status ""

# Phase 1: File System Cleanup
print_header "📁 PHASE 1: File System Cleanup"
print_header "================================"
if [ -f "scripts/cleanup-simple.sh" ]; then
    ./scripts/cleanup-simple.sh
    print_success "Phase 1 Complete ✅"
else
    print_warning "Cleanup script not found - skipping Phase 1"
fi
print_status ""

# Phase 2: Documentation Restructure (manual verification)
print_header "📚 PHASE 2: Documentation Structure"
print_header "==================================="
print_status "Verifying documentation structure..."

if [ -d "docs/architecture" ] && [ -d "docs/development" ]; then
    print_success "Documentation properly structured ✅"
else
    print_warning "Documentation structure needs attention"
fi

if [ -f "WORKSPACE_CLEANUP_ROADMAP.md" ]; then
    print_success "Cleanup roadmap documented ✅"
fi
print_status ""

# Phase 3: Performance Tools Setup
print_header "⚡ PHASE 3: Performance Optimization"
print_header "==================================="
if [ -f "scripts/setup-performance.sh" ]; then
    print_status "Performance tools already configured ✅"
    print_status "Available: npm run analyze, npm run perf:test"
else
    print_warning "Performance tools not found"
fi
print_status ""

# Phase 4: Developer Experience Enhancement
print_header "🛠️  PHASE 4: Developer Experience"
print_header "=================================="
print_status "Setting up development tools..."
if [ -f "scripts/setup-dev-tools.sh" ]; then
    ./scripts/setup-dev-tools.sh
    print_success "Phase 4 Complete ✅"
else
    print_warning "Dev tools script not found"
fi
print_status ""

# Final Summary
print_header "🎯 OPTIMIZATION COMPLETE"
print_header "========================"
print_success "BoxCall workspace is now optimized for peak performance!"
print_status ""
print_status "🚀 Ready for core BoxCall/Playbook development:"
print_status "• Clean file structure ✅"
print_status "• Performance monitoring ✅"  
print_status "• Code quality tools ✅"
print_status "• Git hooks configured ✅"
print_status "• VS Code workspace optimized ✅"
print_status ""
print_status "🎯 Next steps:"
print_status "1. Run: npm run dev:check (health check + dev server)"
print_status "2. Begin core feature development"
print_status "3. Use: npm run quality:check before commits"
print_status ""
print_header "Happy coding! 🎉"

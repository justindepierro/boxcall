#!/bin/bash

# Simple cleanup script for BoxCall workspace
# Phase 1: File System Cleanup

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status "🧹 Starting BoxCall Workspace Cleanup..."
print_status "========================================"

# Create archive directory
mkdir -p docs/archives

# 1. Archive duplicate README
if [ -f "README_NEW.md" ]; then
    mv README_NEW.md docs/archives/
    print_success "Archived README_NEW.md"
else
    print_warning "README_NEW.md not found"
fi

# 2. Remove duplicate database files at root
if [ -f "database-schema.sql" ]; then
    rm database-schema.sql
    print_success "Removed duplicate database-schema.sql"
fi

if [ -f "verify-migration.sql" ]; then
    rm verify-migration.sql
    print_success "Removed duplicate verify-migration.sql"
fi

# 3. Clean temporary files
find . -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null
find . -name "*.tmp" -not -path "./node_modules/*" -delete 2>/dev/null
find . -name "*.bak" -not -path "./node_modules/*" -delete 2>/dev/null

print_success "Cleaned temporary files"

# 4. Ensure directory structure
mkdir -p src/{components,services,hooks,utils,types} 2>/dev/null
mkdir -p tests/{unit,integration,e2e} 2>/dev/null
mkdir -p docs/{api,guides} 2>/dev/null

print_success "Ensured proper directory structure"

print_status "========================================"
print_success "✅ Phase 1 Cleanup Complete!"
print_status "- Archived duplicate files"
print_status "- Removed temporary files" 
print_status "- Cleaned duplicate database files"
print_status "- Ensured proper structure"
print_status ""
print_status "Next: Run performance optimization tools"

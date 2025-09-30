#!/usr/bin/env tsx
/**
 * Clear Role Cache Script
 * 
 * This script clears the role service cache to force fresh data retrieval
 */

import { RoleService } from '../src/services/roleService.js';

console.log('🔄 Clearing role service cache...');
RoleService.clearRoleCache();
console.log('✅ Role cache cleared');
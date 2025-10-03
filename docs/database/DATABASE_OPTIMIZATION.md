# Database Query Optimization

This document describes the comprehensive database optimization system implemented for improved performance, caching, and monitoring.

## Overview

The database optimization system provides:

- **Query Caching**: Intelligent caching of database queries with configurable TTL
- **Performance Monitoring**: Real-time tracking of query performance and metrics
- **Connection Management**: Optimized connection handling and pooling
- **Batch Operations**: Efficient batch processing for bulk operations
- **React Integration**: Hooks for seamless React integration
- **Development Tools**: Performance monitoring components and debugging tools

## Architecture

### Core Components

1. **DatabaseOptimizationService** - Main optimization engine
2. **OptimizedBaseService** - Enhanced base service with optimization features
3. **React Hooks** - useOptimizedQuery, useOptimizedMutation, etc.
4. **Performance Monitor** - Real-time dashboard component
5. **Configuration System** - Environment-based configuration

### File Structure

```
src/
├── services/
│   ├── database/
│   │   └── DatabaseOptimizationService.ts    # Core optimization service
│   └── base/
│       └── OptimizedBaseService.ts           # Enhanced base service
├── hooks/
│   └── useOptimizedDatabase.ts               # React hooks
├── components/
│   └── dev/
│       └── DatabasePerformanceMonitor.tsx   # Performance dashboard
└── config/
    └── database.ts                          # Configuration
```

## Usage

### Basic Service Usage

```typescript
import { createOptimizedService } from "../services/base/OptimizedBaseService";
import { supabase } from "../lib/supabase";

// Create an optimized service
const userService = createOptimizedService(supabase, "users", {
  enableQueryOptimization: true,
  defaultCacheTTL: 300000, // 5 minutes
  enableMetrics: true,
});

// Use optimized operations
const result = await userService.optimizedFindMany(
  { status: "active" },
  {
    columns: ["id", "name", "email"],
    orderBy: { column: "created_at", ascending: false },
    limit: 50,
    cacheTTL: 600000, // 10 minutes for this query
  }
);

console.log("Data:", result.data);
console.log("Performance:", result.metrics);
```

### React Hooks Usage

```typescript
import { useOptimizedQuery, useOptimizedMutation } from '../hooks/useOptimizedDatabase';

function UserList() {
  // Optimized data fetching with caching
  const { data: users, loading, error, refetch } = useOptimizedQuery(
    userService,
    { status: 'active' },
    {
      columns: ['id', 'name', 'email'],
      cacheTTL: 300000,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  // Optimized mutations
  const { mutate: createUser, loading: creating } = useOptimizedMutation(
    userService,
    'create'
  );

  const handleCreateUser = async (userData) => {
    await createUser(userData);
    refetch(); // Refresh the list
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Performance Monitoring

```typescript
import DatabasePerformanceMonitor from '../components/dev/DatabasePerformanceMonitor';

function DeveloperDashboard() {
  return (
    <div>
      <h1>Database Performance</h1>
      <DatabasePerformanceMonitor
        showDetails={true}
        refreshInterval={5000}
      />
    </div>
  );
}
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Cache Configuration
VITE_DB_CACHE_TTL=300000                    # Default cache TTL (5 minutes)
VITE_DB_MAX_CACHE_SIZE=1000                 # Maximum cache entries
VITE_DB_ENABLE_QUERY_CACHE=true             # Enable query caching
VITE_DB_ENABLE_SERVICE_CACHE=true           # Enable service-level caching
VITE_DB_CACHE_CLEANUP_INTERVAL=60000        # Cache cleanup interval (1 minute)

# Performance Configuration
VITE_SLOW_QUERY_THRESHOLD=1000              # Slow query threshold (1 second)
VITE_DB_ENABLE_METRICS=true                 # Enable performance metrics
VITE_DB_ENABLE_QUERY_LOGGING=false          # Enable query logging
VITE_DB_METRICS_RETENTION=1000              # Keep last 1000 metrics
VITE_DB_PERF_MONITOR_INTERVAL=5000          # Performance monitoring interval

# Connection Configuration
VITE_DB_CONNECTION_POOL_SIZE=5              # Connection pool size
VITE_DB_MAX_RETRIES=3                       # Maximum retry attempts
VITE_DB_RETRY_DELAY=1000                    # Retry delay (1 second)
VITE_DB_TIMEOUT=30000                       # Connection timeout (30 seconds)

# Optimization Configuration
VITE_DB_ENABLE_BATCHING=true                # Enable batch operations
VITE_DB_DEFAULT_BATCH_SIZE=100              # Default batch size
VITE_DB_ENABLE_OPTIMIZATION=true            # Enable query optimization
VITE_DB_ENABLE_CONNECTION_POOLING=true      # Enable connection pooling

# Development Configuration
VITE_DB_DEBUG_MODE=false                    # Enable debug mode
VITE_DB_LOG_LEVEL=info                      # Log level (debug, info, warn, error)
VITE_DB_ENABLE_QUERY_EXPLAIN=false          # Enable query explanation
VITE_DB_ENABLE_PERF_TRACING=false           # Enable performance tracing
```

### Configuration Validation

The system validates configuration on startup:

```typescript
import { initializeDatabaseConfig } from "../config/database";

// Initialize and validate configuration
initializeDatabaseConfig();
```

## Features

### 1. Query Caching

Automatic caching of database queries with intelligent cache management:

- **Configurable TTL**: Set custom cache durations per query
- **Smart Invalidation**: Automatic cache invalidation on mutations
- **Memory Management**: Automatic cleanup of expired entries
- **Cache Statistics**: Real-time cache hit rates and statistics

```typescript
// Custom cache TTL
const result = await service.optimizedFindMany(
  { category: "featured" },
  { cacheTTL: 600000 } // 10 minutes
);

// Skip cache for real-time data
const result = await service.optimizedFindMany(
  { status: "live" },
  { skipCache: true }
);
```

### 2. Performance Monitoring

Comprehensive performance tracking:

- **Query Metrics**: Duration, success rate, cache hit rate
- **Slow Query Detection**: Automatic detection of slow queries
- **Performance Trends**: Historical performance data
- **Real-time Dashboard**: Live performance monitoring

```typescript
// Get performance metrics
const metrics = service.getServiceMetrics();
console.log("Average response time:", metrics.averageResponseTime);
console.log("Cache hit rate:", metrics.cacheHitRate);
console.log("Success rate:", metrics.successRate);
```

### 3. Batch Operations

Efficient batch processing for bulk operations:

```typescript
// Batch insert with automatic batching
const users = [
  /* array of user objects */
];
const result = await service.optimizedBatchCreate(users, 50); // Batch size of 50

console.log("Inserted:", result.data.length);
console.log("Performance:", result.metrics);
```

### 4. Advanced Search

Optimized search functionality:

```typescript
// Full-text search with optimization
const results = await service.optimizedSearch(
  "john doe",
  ["name", "email", "bio"], // Search columns
  {
    fuzzy: true,
    limit: 20,
    cacheTTL: 180000, // 3 minutes
  }
);
```

### 5. Aggregation Queries

Optimized aggregation with caching:

```typescript
// Get aggregated data
const stats = await service.optimizedAggregate(
  {
    count: true,
    sum: ["amount"],
    avg: ["rating"],
    max: ["score"],
  },
  { status: "active" },
  { cacheTTL: 600000 }
);

console.log("Total records:", stats.data.count);
console.log("Total amount:", stats.data.sum);
```

## React Hooks

### useOptimizedQuery

For data fetching with automatic caching and state management:

```typescript
const {
  data, // Query results
  loading, // Loading state
  error, // Error state
  metrics, // Performance metrics
  refetch, // Manual refetch function
} = useOptimizedQuery(service, filters, options);
```

### useOptimizedMutation

For data mutations with optimistic updates:

```typescript
const {
  data, // Mutation result
  loading, // Mutation loading state
  error, // Mutation error
  metrics, // Performance metrics
  mutate, // Mutation function
  reset, // Reset state function
} = useOptimizedMutation(service, "create");
```

### useOptimizedCache

For cache management:

```typescript
const {
  hitRate, // Cache hit rate percentage
  size, // Current cache size
  maxSize, // Maximum cache size
  entries, // Number of cache entries
  clearCache, // Function to clear cache
} = useOptimizedCache();
```

### useOptimizedMetrics

For performance monitoring:

```typescript
const {
  databaseMetrics, // Database-wide metrics
  serviceMetrics, // Service-specific metrics
  cacheStats, // Cache statistics
  refresh, // Manual refresh function
} = useOptimizedMetrics(service);
```

## Performance Best Practices

### 1. Query Optimization

- **Select specific columns**: Only fetch needed data
- **Use appropriate indexes**: Ensure database indexes are optimized
- **Limit result sets**: Use pagination for large datasets
- **Cache frequently accessed data**: Set appropriate TTL values

```typescript
// Good: Select specific columns
const users = await service.optimizedFindMany(
  { status: "active" },
  {
    columns: ["id", "name", "email"], // Only needed columns
    limit: 50, // Reasonable limit
    cacheTTL: 300000, // 5-minute cache
  }
);

// Avoid: Select all columns for large datasets
const users = await service.optimizedFindMany({ status: "active" });
```

### 2. Cache Strategy

- **Set appropriate TTL**: Balance freshness vs performance
- **Use cache for read-heavy operations**: Cache frequently accessed data
- **Skip cache for real-time data**: Use skipCache for live data
- **Monitor cache hit rates**: Aim for >70% hit rate

```typescript
// Cache strategy examples
const staticData = await service.optimizedFindMany(
  { type: "reference" },
  { cacheTTL: 3600000 } // 1 hour for static data
);

const userStats = await service.optimizedFindMany(
  { type: "stats" },
  { cacheTTL: 300000 } // 5 minutes for changing data
);

const liveData = await service.optimizedFindMany(
  { status: "live" },
  { skipCache: true } // No cache for real-time data
);
```

### 3. Batch Operations

- **Use batch operations for bulk inserts**: More efficient than individual inserts
- **Choose appropriate batch sizes**: Balance memory usage vs efficiency
- **Monitor batch performance**: Track metrics for optimization

```typescript
// Efficient batch processing
const batchSize = 100;
const result = await service.optimizedBatchCreate(records, batchSize);

// Monitor performance
console.log("Batch performance:", result.metrics.duration);
console.log(
  "Records per second:",
  records.length / (result.metrics.duration / 1000)
);
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Reduce cache size: Lower `VITE_DB_MAX_CACHE_SIZE`
   - Decrease TTL: Lower `VITE_DB_CACHE_TTL`
   - Monitor cache usage in the performance dashboard

2. **Slow Query Performance**
   - Check database indexes
   - Optimize query filters
   - Monitor slow query alerts in the dashboard
   - Consider query restructuring

3. **Low Cache Hit Rate**
   - Increase cache TTL for stable data
   - Review cache invalidation patterns
   - Ensure consistent query patterns

4. **Memory Leaks**
   - Enable cache cleanup: Set appropriate `VITE_DB_CACHE_CLEANUP_INTERVAL`
   - Monitor metrics retention: Limit `VITE_DB_METRICS_RETENTION`
   - Use React hooks properly (avoid infinite loops)

### Debug Mode

Enable debug mode for detailed logging:

```bash
VITE_DB_DEBUG_MODE=true
VITE_DB_LOG_LEVEL=debug
VITE_DB_ENABLE_QUERY_LOGGING=true
VITE_DB_ENABLE_PERF_TRACING=true
```

### Performance Dashboard

Use the DatabasePerformanceMonitor component to:

- Monitor real-time performance metrics
- Track cache hit rates and utilization
- Identify slow queries
- View configuration settings
- Clear cache when needed

## Migration Guide

### From BaseService to OptimizedBaseService

1. **Update service imports**:

```typescript
// Before
import { BaseService } from "../services/base/BaseService";

// After
import { createOptimizedService } from "../services/base/OptimizedBaseService";
```

2. **Update service creation**:

```typescript
// Before
class UserService extends BaseService<"users"> {
  constructor() {
    super(supabase, "users");
  }
}

// After
const userService = createOptimizedService(supabase, "users", {
  enableQueryOptimization: true,
  defaultCacheTTL: 300000,
});
```

3. **Update method calls**:

```typescript
// Before
const users = await userService.findMany({ status: "active" });

// After
const result = await userService.optimizedFindMany(
  { status: "active" },
  { columns: ["id", "name", "email"] }
);
const users = result.data;
```

### Update React Components

1. **Replace data fetching with hooks**:

```typescript
// Before
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  userService
    .findMany({ status: "active" })
    .then(setUsers)
    .finally(() => setLoading(false));
}, []);

// After
const { data: users, loading } = useOptimizedQuery(
  userService,
  { status: "active" },
  { columns: ["id", "name", "email"] }
);
```

2. **Add performance monitoring**:

```typescript
// Add to development builds
{import.meta.env.DEV && (
  <DatabasePerformanceMonitor showDetails={true} />
)}
```

## Advanced Usage

### Custom Optimization Service

Create a custom optimization service with specific configuration:

```typescript
import { DatabaseOptimizationService } from "../services/database/DatabaseOptimizationService";

const customOptimization = new DatabaseOptimizationService({
  defaultCacheTTL: 600000, // 10 minutes
  maxCacheSize: 2000, // Larger cache
  slowQueryThreshold: 500, // 500ms threshold
  enableMetrics: true,
  enableQueryLogging: true,
});

// Use in services
const result = await customOptimization.optimizedSelect("users", {
  filters: { status: "active" },
});
```

### Custom Performance Monitoring

Create custom performance monitoring:

```typescript
import { useOptimizedPerformanceMonitor } from '../hooks/useOptimizedDatabase';

function CustomPerformanceWidget() {
  const performance = useOptimizedPerformanceMonitor();

  return (
    <div className="performance-widget">
      <div>Avg Response: {performance.averageResponseTime}ms</div>
      <div>Cache Hit: {performance.cacheHitRate}%</div>
      <div>Error Rate: {performance.errorRate}%</div>
    </div>
  );
}
```

This comprehensive database optimization system provides significant performance improvements while maintaining ease of use and comprehensive monitoring capabilities.

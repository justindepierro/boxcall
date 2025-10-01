import { useState, memo } from 'react';
import { Icon } from '../ui/Icon/Icon';
import { FORMATION_OPTIONS, PLAY_TYPE_OPTIONS } from '../../types/play';

interface ActiveFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'in';
  value: string | string[];
  label: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: ActiveFilter[]) => void;
  activeFilters: ActiveFilter[];
}

const QUICK_FILTERS = [
  { id: 'run', label: 'Run Plays', icon: 'zap' as const, gradient: 'from-jade-500 to-emerald-500' },
  { id: 'pass', label: 'Pass Plays', icon: 'target' as const, gradient: 'from-electric-500 to-purple-500' },
  { id: 'rpo', label: 'RPO', icon: 'activity' as const, gradient: 'from-navy-600 to-blue-600' },
  { id: 'redzone', label: 'Red Zone', icon: 'flag' as const, gradient: 'from-red-500 to-orange-500' },
] as const;

const FILTER_CATEGORIES = [
  {
    id: 'playType',
    label: 'Play Type',
    icon: 'book' as const,
    options: PLAY_TYPE_OPTIONS.map(p => ({ value: p.value, label: p.label })),
  },
  {
    id: 'formation',
    label: 'Formation',
    icon: 'users' as const,
    options: FORMATION_OPTIONS.map(f => ({ value: f.name, label: f.name })),
  },
  {
    id: 'down',
    label: 'Down',
    icon: 'trending-up' as const,
    options: [
      { value: '1', label: '1st Down' },
      { value: '2', label: '2nd Down' },
      { value: '3', label: '3rd Down' },
      { value: '4', label: '4th Down' },
    ],
  },
  {
    id: 'distance',
    label: 'Distance',
    icon: 'bar-chart' as const,
    options: [
      { value: 'short', label: 'Short (1-3)' },
      { value: 'medium', label: 'Medium (4-7)' },
      { value: 'long', label: 'Long (8+)' },
    ],
  },
] as const;

export const AdvancedFilters = memo<AdvancedFiltersProps>(({ onFiltersChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleQuickFilter = (filterId: string) => {
    const existingFilter = activeFilters.find(f => f.field === 'playType' && f.value === filterId);
    
    if (existingFilter) {
      // Remove filter
      onFiltersChange(activeFilters.filter(f => f.id !== existingFilter.id));
    } else {
      // Add filter
      const newFilter: ActiveFilter = {
        id: `${filterId}-${Date.now()}`,
        field: 'playType',
        operator: 'equals',
        value: filterId,
        label: QUICK_FILTERS.find(qf => qf.id === filterId)?.label || filterId,
      };
      onFiltersChange([...activeFilters, newFilter]);
    }
  };

  const handleCategorySelect = (categoryId: string, optionValue: string) => {
    const category = FILTER_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const option = category.options.find(o => o.value === optionValue);
    if (!option) return;

    const existingFilter = activeFilters.find(
      f => f.field === categoryId && f.value === optionValue
    );

    if (existingFilter) {
      // Remove filter
      onFiltersChange(activeFilters.filter(f => f.id !== existingFilter.id));
    } else {
      // Add filter
      const newFilter: ActiveFilter = {
        id: `${categoryId}-${optionValue}-${Date.now()}`,
        field: categoryId,
        operator: 'equals',
        value: optionValue,
        label: `${category.label}: ${option.label}`,
      };
      onFiltersChange([...activeFilters, newFilter]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const isQuickFilterActive = (filterId: string) =>
    activeFilters.some(f => f.field === 'playType' && f.value === filterId);

  const isCategoryOptionActive = (categoryId: string, optionValue: string) =>
    activeFilters.some(f => f.field === categoryId && f.value === optionValue);

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-[28px] border-2 border-white/20 dark:border-slate-700/20 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="filter" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Filters</h3>
          {activeFilters.length > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-electric-500 text-white text-xs font-bold">
              {activeFilters.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all hover:scale-110"
          aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            className="w-4 h-4 text-slate-600 dark:text-slate-400"
          />
        </button>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {QUICK_FILTERS.map(filter => {
          const isActive = isQuickFilterActive(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => handleQuickFilter(filter.id)}
              className={`group relative overflow-hidden rounded-2xl p-3 transition-all duration-200 ${
                isActive
                  ? 'ring-2 ring-electric-500 shadow-lg scale-105'
                  : 'hover:scale-105 hover:shadow-md'
              }`}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${filter.gradient} ${
                  isActive ? 'opacity-100' : 'opacity-20 group-hover:opacity-30'
                } transition-opacity`}
              />
              
              {/* Content */}
              <div className="relative flex items-center gap-2">
                <Icon
                  name={filter.icon}
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {filter.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Filters Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onFiltersChange(activeFilters.filter(f => f.id !== filter.id))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors group"
            >
              <span>{filter.label}</span>
              <Icon
                name="close"
                className="w-3 h-3 group-hover:text-red-600 dark:group-hover:text-red-400"
              />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <Icon name="close" className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}

      {/* Expanded Filter Categories */}
      {isExpanded && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          {FILTER_CATEGORIES.map(category => (
            <div key={category.id} className="space-y-2">
              <button
                onClick={() =>
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    name={category.icon}
                    className="w-4 h-4 text-slate-500 dark:text-slate-400"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {category.label}
                  </span>
                </div>
                <Icon
                  name={selectedCategory === category.id ? 'chevron-up' : 'chevron-down'}
                  className="w-4 h-4 text-slate-400"
                />
              </button>

              {selectedCategory === category.id && (
                <div className="grid grid-cols-2 gap-2 pl-3">
                  {category.options.map(option => {
                    const isActive = isCategoryOptionActive(category.id, option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleCategorySelect(category.id, option.value)}
                        className={`px-3 py-2 rounded-lg text-left text-sm transition-all ${
                          isActive
                            ? 'bg-electric-100 dark:bg-electric-900/30 text-electric-700 dark:text-electric-400 font-semibold ring-2 ring-electric-500/50'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AdvancedFilters.displayName = 'AdvancedFilters';

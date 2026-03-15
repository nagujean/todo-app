# FilterSortBar Component API Documentation

## Overview

The FilterSortBar component provides unified filter and sort controls for todo lists. It was introduced in version 0.2.0 as part of the code quality improvements to eliminate code duplication in the TodoList component.

**Component Location**: `src/components/todo/TodoList.tsx` (inline implementation)

**Version**: 0.2.0

## Props Interface

```typescript
interface FilterSortBarProps {
  filter: FilterMode;           // Current filter mode
  sort: SortType;               // Current sort type
  sortOrder: 'asc' | 'desc';    // Current sort order
  onFilterChange: (mode: FilterMode) => void;  // Filter change handler
  onSortChange: (type: SortType) => void;      // Sort change handler
}
```

## Type Definitions

### FilterMode

```typescript
type FilterMode = 'all' | 'incomplete' | 'completed';
```

- **`all`**: Display all todos
- **`incomplete`**: Display only incomplete todos
- **`completed`**: Display only completed todos

### SortType

```typescript
type SortType = 'created' | 'priority' | 'startDate' | 'endDate';
```

- **`created`**: Sort by creation date
- **`priority`**: Sort by priority level (high/medium/low)
- **`startDate`**: Sort by start date
- **`endDate`**: Sort by end date

## Behavior

### Filter Behavior

- Clicking a filter button updates the displayed todos based on the selected filter mode
- Active filter is highlighted with primary background color
- Filter state is persisted in the todo store

### Sort Behavior

- Clicking a sort button changes the sort type
- Clicking the same sort button again toggles between ascending and descending order
- Active sort displays an up or down arrow indicator
- Sort state is persisted in the todo store

### Responsive Design

- **Mobile (< 640px)**: Filter and sort buttons wrap to multiple lines if needed
- **Desktop (>= 640px)**: Filter and sort buttons display in a single row
- **Touch targets**: Minimum 44px height for accessibility

## Styling

### Active State

```css
bg-primary/10 text-primary font-medium
```

### Inactive State

```css
text-muted-foreground hover:bg-muted
```

### Layout Classes

- Container: `flex items-center justify-between gap-2 flex-wrap`
- Filter buttons: `flex items-center gap-1 text-xs`
- Sort buttons: `flex items-center gap-1 text-xs`

## Accessibility

- **ARIA States**: `data-state` attribute indicates button state (active/inactive/selected)
- **Touch Targets**: Minimum 44px height for mobile interactions
- **Keyboard Navigation**: Full keyboard support for all buttons
- **Screen Reader**: Button labels clearly indicate purpose

## Usage Example

```typescript
import { useTodoStore } from '@/store/todoStore';

function TodoList() {
  const {
    filterMode,
    setFilterMode,
    sortType,
    sortOrder,
    setSortType,
    setSortOrder
  } = useTodoStore();

  const handleFilterClick = (mode: FilterMode) => {
    setFilterMode(mode);
  };

  const handleSortClick = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {/* Filter buttons */}
      <div className="flex items-center gap-1 text-xs">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterClick(option.value)}
            data-state={filterMode === option.value ? 'active' : 'inactive'}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
              filterMode === option.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Sort buttons */}
      <div className="flex items-center gap-1 text-xs">
        <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1" />
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortClick(option.value)}
            data-state={sortType === option.value ? (sortOrder === 'asc' ? 'active' : 'selected') : 'inactive'}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
              sortType === option.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {option.label}
            {sortType === option.value && (
              sortOrder === 'asc'
                ? <ArrowUp className="h-3 w-3" />
                : <ArrowDown className="h-3 w-3" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Related Components

- **TodoList**: Main component that uses FilterSortBar
- **TodoStore**: State management for filter and sort settings
- **Button**: Base button component from UI library

## Changelog

### Version 0.2.0 (2026-02-04)
- **Added**: Inline filter and sort controls in TodoList component
- **Fixed**: Code duplication (110 lines repeated 3 times)
- **Improved**: Mobile responsive design with flex-wrap support

### Version 0.1.0
- **Initial**: Filter and sort controls embedded in TodoList component

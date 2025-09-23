'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ThemeToggleSkeleton variant={variant} className={className} />;
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ];

  if (variant === 'compact') {
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.name === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].name);
        }}
        className={cn(
          'inline-flex items-center justify-center rounded-md w-9 h-9 transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        title={`Current theme: ${theme} (${resolvedTheme})`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className={cn(
            'appearance-none bg-background border border-border rounded-md px-3 py-2 pr-8',
            'text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'cursor-pointer'
          )}
        >
          {themes.map((themeOption) => (
            <option key={themeOption.name} value={themeOption.name}>
              {themeOption.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Default variant - button group
  return (
    <div className={cn('flex items-center space-x-1 p-1 bg-muted rounded-lg', className)}>
      {themes.map((themeOption) => {
        const isActive = theme === themeOption.name;
        const Icon = themeOption.icon;

        return (
          <button
            key={themeOption.name}
            onClick={() => setTheme(themeOption.name)}
            className={cn(
              'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
            title={themeOption.label}
          >
            <Icon className="h-4 w-4 mr-2" />
            {themeOption.label}
          </button>
        );
      })}
    </div>
  );
}

function ThemeToggleSkeleton({ variant, className }: { variant?: string; className?: string }) {
  if (variant === 'compact') {
    return (
      <div className={cn('w-9 h-9 bg-muted rounded-md animate-pulse', className)} />
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('w-24 h-10 bg-muted rounded-md animate-pulse', className)} />
    );
  }

  return (
    <div className={cn('flex items-center space-x-1 p-1 bg-muted rounded-lg', className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-16 h-8 bg-muted-foreground/20 rounded animate-pulse" />
      ))}
    </div>
  );
}

// Advanced theme toggle with additional options
export function AdvancedThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-20 bg-muted rounded-lg animate-pulse" />;
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme with bright colors' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme with muted colors' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground">Theme Preference</div>
      <div className="grid gap-2">
        {themeOptions.map((option) => {
          const isSelected = theme === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex items-center space-x-3 w-full p-3 rounded-lg border transition-colors text-left',
                isSelected
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Theme indicator component
export function ThemeIndicator() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
      <div className={cn(
        'h-2 w-2 rounded-full',
        resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-yellow-400'
      )} />
      <span>
        {resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode
      </span>
    </div>
  );
}

// Hook for theme-aware styling
export function useThemeAwareColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return {
    isDark,
    isLight: mounted && resolvedTheme === 'light',
    mounted,
    // Helper colors that work well in both themes
    primary: isDark ? 'hsl(210 40% 60%)' : 'hsl(210 40% 40%)',
    secondary: isDark ? 'hsl(210 20% 20%)' : 'hsl(210 20% 90%)',
    accent: isDark ? 'hsl(260 40% 60%)' : 'hsl(260 40% 40%)',
  };
}
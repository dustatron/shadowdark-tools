'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, List, Dice6, Search, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { AuthButton } from '@/components/auth-button';
import { ThemeToggle } from './theme-toggle';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    description: 'Browse magic items',
  },
  {
    name: 'My Lists',
    href: '/lists',
    icon: List,
    description: 'Manage your item lists',
  },
  {
    name: 'Roll Tables',
    href: '/tables',
    icon: Dice6,
    description: 'Create and manage roll tables',
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search,
    description: 'Advanced item search',
  },
];

const userNavigationItems: NavigationItem[] = [
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Manage your profile',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences',
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-0 top-0 z-40 h-full w-64 bg-background border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center px-6 h-16 border-b border-border">
            <Link href="/" className="flex items-center space-x-2">
              <Dice6 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Shadowdark Tools
              </span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 px-3 py-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Navigation */}
          <div className="border-t border-border px-3 py-4">
            <nav className="space-y-2 mb-4">
              {userNavigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle and Auth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="px-3">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <Link href="/" className="flex items-center space-x-2">
              <Dice6 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                Shadowdark
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                type="button"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeMobileMenu}
            />

            {/* Menu Panel */}
            <div className="fixed top-16 left-0 right-0 bottom-0 bg-background border-r border-border overflow-y-auto">
              <div className="px-4 py-6">
                {/* Main Navigation */}
                <nav className="space-y-1 mb-6">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Main Menu
                  </div>
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-4 h-6 w-6 flex-shrink-0',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}
                        />
                        <div>
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* User Navigation */}
                <nav className="space-y-1 mb-6">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Account
                  </div>
                  {userNavigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-4 h-6 w-6 flex-shrink-0',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}
                        />
                        <div>
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Auth Button */}
                <div className="border-t border-border pt-6">
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Spacer for Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Content Spacer for Mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="hidden lg:block fixed left-0 top-0 z-40 h-full w-64 bg-background border-r border-border">
      <div className="flex flex-col h-full">
        {/* Logo skeleton */}
        <div className="flex items-center px-6 h-16 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-muted rounded" />
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
        </div>

        {/* Navigation skeleton */}
        <div className="flex-1 px-3 py-6">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center px-3 py-2">
                <div className="h-5 w-5 bg-muted rounded mr-3" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* User section skeleton */}
        <div className="border-t border-border px-3 py-4">
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center px-3 py-2">
                <div className="h-5 w-5 bg-muted rounded mr-3" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
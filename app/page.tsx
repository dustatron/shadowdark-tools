import { Suspense } from 'react';
import { AuthButton } from '@/components/auth-button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { MagicItemBrowser } from '@/components/magic-items/magic-item-browser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, List, Dice6 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex gap-6 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <Dice6 className="h-6 w-6" />
              Shadowdark Tools
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link
                href="/lists"
                className="hover:text-primary transition-colors"
              >
                My Lists
              </Link>
              <Link
                href="/tables/create"
                className="hover:text-primary transition-colors"
              >
                Create Table
              </Link>
            </div>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-12 lg:py-20">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Shadowdark Magic Items
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Browse, organize, and create custom roll tables for magic items in
            the Shadowdark RPG. Manage your favorite items and share tables with
            your group.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="#browse">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Items
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/lists">
                <List className="mr-2 h-4 w-4" />
                My Lists
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Magic Item Browser */}
      <section id="browse" className="flex-1 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Browse Magic Items</h2>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <MagicItemBrowser />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            Built for the Shadowdark RPG community
          </p>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </footer>
    </main>
  );
}

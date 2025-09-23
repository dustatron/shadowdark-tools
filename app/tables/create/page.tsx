import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Dice6, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CreateTableForm } from "@/components/tables/create-table-form";

export const metadata = {
  title: "Create Roll Table - Shadowdark Tools",
  description: "Create a custom roll table for magic items in the Shadowdark RPG",
};

export default function CreateTablePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex gap-6 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Dice6 className="h-6 w-6" />
              Shadowdark Tools
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/lists" className="hover:text-primary transition-colors">
                My Lists
              </Link>
              <Link href="/tables/create" className="text-primary font-medium">
                Create Table
              </Link>
            </div>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-border bg-muted/50">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create Roll Table</h1>
            <p className="text-muted-foreground">
              Generate custom roll tables for magic items. Perfect for quick random generation during gameplay.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Suspense fallback={<CreateTableFormSkeleton />}>
            <CreateTableForm />
          </Suspense>
        </div>
      </main>

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
    </div>
  );
}

function CreateTableFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Form Header */}
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-32"></div>
        <div className="h-10 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>

      {/* Die Size Selection */}
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-24"></div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </div>

      {/* Source Selection */}
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-40"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="h-10 bg-muted rounded w-32"></div>
    </div>
  );
}
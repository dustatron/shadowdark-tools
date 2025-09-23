import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share, Edit2, Dice6 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { RollTableContent } from "@/components/tables/roll-table-content";

interface PageProps {
  params: { id: string };
}

async function getTable(id: string) {
  try {
    // In a real app, this would fetch from your API with server-side auth
    // For now, we'll handle this client-side in the RollTableContent component
    return { id, exists: true };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const table = await getTable(params.id);

  if (!table) {
    return {
      title: "Table Not Found",
    };
  }

  return {
    title: "Roll Table - Shadowdark Tools",
    description: "View and use your custom magic item roll table",
  };
}

export default async function RollTablePage({ params }: PageProps) {
  const table = await getTable(params.id);

  if (!table) {
    notFound();
  }

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
              <Link href="/tables/create" className="hover:text-primary transition-colors">
                Create Table
              </Link>
            </div>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/tables/create"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Create Table
            </Link>
          </div>

          <Suspense fallback={<RollTableLoadingSkeleton />}>
            <RollTableContent tableId={params.id} />
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

function RollTableLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-28 animate-pulse"></div>
        </div>
      </div>

      {/* Roll Button Skeleton */}
      <div className="text-center">
        <div className="h-12 bg-muted rounded w-32 mx-auto animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg">
        <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/50">
          <div className="h-5 bg-muted rounded animate-pulse"></div>
          <div className="h-5 bg-muted rounded animate-pulse"></div>
          <div className="h-5 bg-muted rounded animate-pulse"></div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 p-4 border-b last:border-b-0">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
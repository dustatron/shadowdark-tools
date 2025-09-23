import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Home, Dice6, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SharedRollTableContent } from "@/components/tables/shared-roll-table-content";

interface PageProps {
  params: { token: string };
}

async function getSharedTable(token: string) {
  try {
    // In a real app, this would fetch from your API
    // For now, we'll handle this client-side in the SharedRollTableContent component
    return { token, exists: true };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const table = await getSharedTable(params.token);

  if (!table) {
    return {
      title: "Shared Table Not Found",
    };
  }

  return {
    title: "Shared Roll Table - Shadowdark Tools",
    description: "View and roll on a shared magic item table for the Shadowdark RPG",
  };
}

export default async function SharedTablePage({ params }: PageProps) {
  const table = await getSharedTable(params.token);

  if (!table) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex gap-6 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Dice6 className="h-6 w-6" />
              Shadowdark Tools
            </Link>
            <Badge variant="outline" className="hidden sm:flex">
              Shared Table
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Browse Items
              </Link>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Suspense fallback={<SharedTableLoadingSkeleton />}>
            <SharedRollTableContent token={params.token} />
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
            <Button variant="outline" asChild>
              <Link href="/">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Shadowdark Tools
              </Link>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}

function SharedTableLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        <div className="h-5 bg-muted rounded w-48 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Notice Skeleton */}
      <div className="h-20 bg-muted/50 rounded-lg animate-pulse"></div>

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
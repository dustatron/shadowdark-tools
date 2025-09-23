import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Dice6 } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ListContent } from "@/components/lists/list-content";

interface PageProps {
  params: { id: string };
  searchParams: { add?: string };
}

async function getList(id: string) {
  try {
    // In a real app, this would fetch from your API with server-side auth
    // For now, we'll handle this client-side in the ListContent component
    return { id, exists: true };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const list = await getList(params.id);

  if (!list) {
    return {
      title: "List Not Found",
    };
  }

  return {
    title: "Magic Item List - Shadowdark Tools",
    description: "View and manage your magic item list",
  };
}

export default async function ListPage({ params, searchParams }: PageProps) {
  const list = await getList(params.id);

  if (!list) {
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
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/lists"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lists
            </Link>
          </div>

          <Suspense fallback={<ListLoadingSkeleton />}>
            <ListContent
              listId={params.id}
              addItemSlug={searchParams.add}
            />
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

function ListLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-5 bg-muted rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-muted rounded w-24"></div>
          <div className="h-10 bg-muted rounded w-28"></div>
        </div>
      </div>

      {/* Items Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-12"></div>
            </div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
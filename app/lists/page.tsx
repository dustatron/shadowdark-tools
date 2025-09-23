import { Suspense } from "react";
import Link from "next/link";
import { Plus, Dice6 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserListsContent } from "@/components/lists/user-lists-content";
import { CreateListDialog } from "@/components/lists/create-list-dialog";

export default function ListsPage() {
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
              <Link href="/lists" className="text-primary font-medium">
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

      {/* Header */}
      <div className="border-b border-border bg-muted/50">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">My Lists</h1>
              <p className="text-muted-foreground">
                Organize your favorite magic items into custom lists for easy reference during gameplay.
              </p>
            </div>
            <CreateListDialog>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create List
              </Button>
            </CreateListDialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Suspense fallback={<ListsLoadingSkeleton />}>
            <UserListsContent />
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

function ListsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-5 bg-muted rounded w-16"></div>
              <div className="h-5 bg-muted rounded w-20"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
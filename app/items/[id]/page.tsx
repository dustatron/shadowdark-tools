import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, List, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AddToListButton } from "@/components/magic-items/add-to-list-button";
import { FavoriteButton } from "@/components/magic-items/favorite-button";
import { getMagicItemBySlug } from "@/lib/services/magic-items";
import { MagicItemType, MagicItemRarity } from "@/types/magic-items";

interface PageProps {
  params: Promise<{ id: string }>;
}

const typeLabels: Record<MagicItemType, string> = {
  weapon: "Weapon",
  armor: "Armor",
  accessory: "Accessory",
  consumable: "Consumable",
  artifact: "Artifact",
  unknown: "Unknown",
};

const rarityLabels: Record<MagicItemRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  "very-rare": "Very Rare",
  legendary: "Legendary",
  artifact: "Artifact",
  unknown: "Unknown",
};

const rarityColors: Record<MagicItemRarity, string> = {
  common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  uncommon: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  "very-rare": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
  legendary: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
  artifact: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const item = await getMagicItemBySlug(id);

  if (!item) {
    return {
      title: "Item Not Found",
    };
  }

  return {
    title: `${item.name} - Shadowdark Magic Items`,
    description: item.description.substring(0, 160),
  };
}

export default async function MagicItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getMagicItemBySlug(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex gap-6 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-6 w-6" />
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
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </div>

          {/* Item Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{item.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.rarity !== "unknown" && (
                    <Badge className={rarityColors[item.rarity]}>
                      {rarityLabels[item.rarity]}
                    </Badge>
                  )}
                  {item.type !== "unknown" && (
                    <Badge variant="outline">
                      {typeLabels[item.type]}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <FavoriteButton itemSlug={item.slug} />
                <AddToListButton itemSlug={item.slug} />
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Traits */}
          {item.traits && item.traits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Special Traits</h2>
              <div className="space-y-4">
                {item.traits.map((trait, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{trait.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground leading-relaxed">
                        {trait.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild className="h-auto p-4 justify-start">
                  <Link href="/lists">
                    <div className="flex items-center gap-3">
                      <List className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Add to List</div>
                        <div className="text-sm opacity-80">Organize in your personal lists</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/tables/create">
                    <div className="flex items-center gap-3">
                      <Plus className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Create Roll Table</div>
                        <div className="text-sm opacity-80">Add to custom roll table</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
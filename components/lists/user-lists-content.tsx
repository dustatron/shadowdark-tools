"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Eye, Edit2, Trash2, Calendar, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { CreateListDialog } from "./create-list-dialog";

interface UserList {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export function UserListsContent() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItemSlug = searchParams.get("add");

  useEffect(() => {
    if (user) {
      fetchLists();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/lists");
      if (!response.ok) throw new Error("Failed to fetch lists");

      const data = await response.json();
      setLists(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return;

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLists(prev => prev.filter(list => list.id !== listId));
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleListCreated = (newList: UserList) => {
    setLists(prev => [newList, ...prev]);

    // If we're adding an item, navigate to the new list
    if (addItemSlug) {
      router.push(`/lists/${newList.id}?add=${addItemSlug}`);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ListIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sign in to manage lists</h3>
        <p className="text-muted-foreground mb-6">
          Create an account to organize your favorite magic items into custom lists.
        </p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading lists: {error}</p>
        <Button onClick={fetchLists}>Try Again</Button>
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ListIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No lists yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first list to start organizing magic items.
        </p>
        <CreateListDialog onListCreated={handleListCreated}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First List
          </Button>
        </CreateListDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {addItemSlug && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            Choose a list to add the magic item to, or create a new list.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <Card key={list.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg leading-tight">{list.name}</CardTitle>
                {list.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {list.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    •••
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href={`/lists/${list.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View List
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/lists/${list.id}/edit`}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit List
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteList(list.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">
                  {list.itemCount} item{list.itemCount !== 1 ? "s" : ""}
                </Badge>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(list.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={addItemSlug ? `/lists/${list.id}?add=${addItemSlug}` : `/lists/${list.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    {addItemSlug ? "Add Item" : "View"}
                  </Link>
                </Button>
                {!addItemSlug && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/lists/${list.id}/edit`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
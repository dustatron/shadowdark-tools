"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { User, LogOut, Settings, Heart, List as ListIcon, Dice6, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthButtonProps {
  variant?: "default" | "mobile" | "minimal";
  showUserMenu?: boolean;
  onSignOut?: () => void;
  className?: string;
}

export function AuthButton({
  variant = "default",
  showUserMenu = true,
  onSignOut,
  className,
}: AuthButtonProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error getting user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      onSignOut?.();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserDisplayName = (user: SupabaseUser) => {
    return user.user_metadata?.full_name ||
           user.user_metadata?.name ||
           user.email?.split('@')[0] ||
           'User';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  // Authenticated user
  if (user) {
    if (variant === "minimal") {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={cn("h-8 w-8", className)}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      );
    }

    if (variant === "mobile") {
      return (
        <div className={cn("space-y-2", className)}>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getUserDisplayName(user).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {getUserDisplayName(user)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11">
              <Link href="/lists">
                <ListIcon className="h-4 w-4" />
                My Lists
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11">
              <Link href="/favorites">
                <Heart className="h-4 w-4" />
                Favorites
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11">
              <Link href="/tables">
                <Dice6 className="h-4 w-4" />
                Roll Tables
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11">
              <Link href="/profile">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full justify-start gap-3 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      );
    }

    // Default variant with dropdown menu
    if (showUserMenu) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("gap-2 h-9", className)}
              disabled={isSigningOut}
            >
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {getUserDisplayName(user).charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline truncate max-w-32">
                {getUserDisplayName(user)}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/lists" className="gap-2">
                <ListIcon className="h-4 w-4" />
                My Lists
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/tables" className="gap-2">
                <Dice6 className="h-4 w-4" />
                Roll Tables
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Simple signed-in state without menu
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {getUserDisplayName(user).charAt(0).toUpperCase()}
          </div>
          <span>Hey, {getUserDisplayName(user)}!</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    );
  }

  // Not authenticated - show sign in/up buttons
  return (
    <div className={cn("flex gap-2", className)}>
      {variant === "mobile" ? (
        <div className="space-y-2 w-full">
          <Button asChild variant="outline" size="lg" className="w-full h-11">
            <Link href="/auth/login">
              <User className="h-4 w-4 mr-2" />
              Sign in
            </Link>
          </Button>
          <Button asChild size="lg" className="w-full h-11">
            <Link href="/auth/sign-up">
              Get Started
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/login">
              Sign in
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">
              Sign up
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
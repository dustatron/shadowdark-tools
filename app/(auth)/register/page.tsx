import Link from "next/link";
import { Dice6, ArrowLeft } from "lucide-react";
import { SignUpForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata = {
  title: "Sign Up - Shadowdark Tools",
  description: "Create your Shadowdark Tools account to organize magic items and create roll tables",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex gap-6 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Dice6 className="h-6 w-6" />
              Shadowdark Tools
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Browse
              </Link>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground">
              Join Shadowdark Tools to organize magic items and create custom roll tables
            </p>
          </div>

          {/* Sign Up Form */}
          <SignUpForm />

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>

            <div className="text-xs text-muted-foreground max-w-sm mx-auto">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-6">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built for the Shadowdark RPG community
          </p>
        </div>
      </footer>
    </div>
  );
}
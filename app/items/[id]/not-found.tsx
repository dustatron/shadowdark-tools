import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowLeft } from "lucide-react";

export default function ItemNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Magic Item Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            The magic item you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Items
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/lists">
                View Lists
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
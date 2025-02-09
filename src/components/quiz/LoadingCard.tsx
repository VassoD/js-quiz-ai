import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

export function LoadingCard() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading question...</span>
      </CardContent>
    </Card>
  );
}

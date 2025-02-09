import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ErrorCardProps {
  error: string;
  onRetry: () => void;
}

export function ErrorCard({ error, onRetry }: ErrorCardProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-4">
          <XCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-500 font-semibold">Error: {error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function QuizCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-3 bg-muted rounded w-full"></div>
      </CardContent>
    </Card>
  );
}

export function ResultCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-3 bg-muted rounded w-full"></div>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur border-border/50">
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-6xl font-bold text-purple-500">404</h1>

          <h2 className="text-xl font-semibold">
            Page not found
          </h2>

          <p className="text-sm text-muted-foreground">
            Looks like this route skipped leg day 💀  
            The page you’re looking for doesn’t exist.
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>

            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

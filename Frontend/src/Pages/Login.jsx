import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome, ArrowRight, User } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            navigate("/dashboard");
        }, 1500);
    };

    const handleGuest = () => {
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <span className="text-2xl">ðŸŒµ</span>
                    </div>
                    <CardTitle className="text-2xl font-heading font-bold">Pulse Fit</CardTitle>
                    <CardDescription>Enter your rhythm.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input type="email" placeholder="Email" disabled={isLoading} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Input type="password" placeholder="Password" disabled={isLoading} className="bg-background/50" />
                        </div>
                        <Button className="w-full font-semibold" type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                            <Chrome className="mr-2 h-4 w-4" /> Google
                        </Button>
                        <Button variant="ghost" type="button" onClick={handleGuest} disabled={isLoading} className="w-full">
                            <User className="mr-2 h-4 w-4" /> Continue as Guest
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-xs text-muted-foreground">By clicking continue, you agree to our Terms.</p>
                </CardFooter>
            </Card>
        </div>
    );
}

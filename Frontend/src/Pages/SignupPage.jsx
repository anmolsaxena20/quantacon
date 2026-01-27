import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, UserPlus, Chrome } from "lucide-react";
import { toast, Toaster } from "sonner";
import useAuth from "@/Context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isOtp, setIsOtp] = useState(false);
  const { isLogin, setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [otp, setOtp] = useState("");
  const[userId,setUserId] = useState(null);
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);


    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          height,
          weight,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Signup failed");

      toast.success("OTP sent to your email");
      setIsOtp(true);
      setUserId(data.userId)
    } catch (error) {
      console.error(error);
      toast.error("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      if (!res.ok) throw new Error("OTP verification failed");

      toast.success("Account verified successfully");

      setIsLogin(true);
        navigate("/dashboard");
    
    } catch (error) {
      console.error(error);
      toast.error("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <Toaster />

      <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading font-bold">
            Create Account
          </CardTitle>
          <CardDescription>
            Start your fitness journey today
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isOtp && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email/Phone No"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}

              />
              <Input
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}

              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Sign Up"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {isOtp && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to your email
              </p>

              <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                <InputOTPGroup>
                  {[0, 1, 2].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  {[3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button className="w-full" onClick={handleOtpVerify} disabled={isLoading}>
                Verify OTP
              </Button>
            </div>
          )}
          {!isOtp && (
            <>
              <div className="relative my-6">
                <Separator />
              </div>

              <Button 
              onClick = {()=>window.location.href = "http://localhost:5000/api/auth/google"}
              variant="outline" type="button" disabled={isLoading} className="w-full">
                <Chrome className="mr-2 h-4 w-4" /> Google
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Already have an account? Sign in
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            By signing up, you agree to our Terms & Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

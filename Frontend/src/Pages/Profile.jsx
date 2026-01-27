import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera } from "lucide-react";
import {Toaster, toast } from "sonner";
import useAuth from "../Context/AuthContext";
export default function Profile() {
    
    const {user} = useAuth();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-card/80 backdrop-blur border-border">
                <CardHeader className="flex flex-col items-center gap-3">
                    <img
                        src={user.picture}
                        className="w-24 h-24 rounded-full object-cover"
                        alt="profile"
                    />
                    <CardTitle>{user.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Height</span>
                        <span>{user.height?user.height:""}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weight</span>
                        <span>{user.weight?user.weight : ""}</span>
                    </div>


                    <Button className="w-full mt-4">Edit Profile</Button>
                </CardContent>
            </Card>
        </div>
    );
}
import { useState } from "react";
import { Zap, Moon, Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function EnergySelector() {
    const [level, setLevel] = useState(null);

    const options = [
        { value: "low", label: "Low", icon: Moon, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400" },
        { value: "medium", label: "Medium", icon: Battery, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400" },
        { value: "high", label: "High", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400" },
    ];

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">How is your energy today?</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setLevel(opt.value)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all hover:scale-105",
                            level === opt.value
                                ? `${opt.border} ${opt.bg}`
                                : "border-transparent bg-secondary/50 hover:bg-secondary"
                        )}
                    >
                        <opt.icon className={cn("h-6 w-6 mb-2", opt.color)} />
                        <span className="font-medium text-sm">{opt.label}</span>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}

import { useState } from "react";
import { Check, Shield, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import useAuth from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const PricingSync = () => {
    const { user,setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const tiers = [
        {
            name: "Free",
            price: 0,
            description: "Essential features for your fitness journey",
            features: ["Basic workout tracking", "Community access", "Limited AI suggestions"],
            color: "bg-muted",
            btnText: "Current Plan",
            disabled: true
        },
        {
            name: "Silver",
            price: 499,
            description: "Level up with advanced analytics",
            features: ["Everything in Free", "Advanced progress tracking", "Unlimited AI workouts", "Priority support"],
            color: "bg-slate-300 dark:bg-slate-700",
            border: "border-slate-400",
            btnText: "Upgrade to Silver",
            planId: "silver"
        },
        {
            name: "Gold",
            price: 999,
            description: "Ultimate experience for serious achievers",
            features: ["Everything in Silver", "1-on-1 Coach chat access", "Custom nutrition plans", "Exclusive extensive analytics"],
            color: "bg-yellow-100 dark:bg-yellow-900/30",
            border: "border-yellow-500",
            icon: <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />,
            btnText: "Upgrade to Gold",
            planId: "gold"
        }
    ];

    const handlePayment = async (amount, planId) => {
        if (!user) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("token");
        if(!token){
            toast.error("invalid session");
            return;
        }
        setLoading(true);
        try {
            const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json",
                    "Authorization":`Bearer ${token}`
                 },
                body: JSON.stringify({amount})
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.message || "Order creation failed");

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Pulse Fit",
                description: `Upgrade to ${planId} Tier`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json" ,
                                "Authorization":`Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                userId: user.id || user._id,
                                plan: planId
                            })
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            toast.success("Payment Successful! Welcome to " + planId + " tier.");
                            localStorage.setItem("token",verifyData.accessToken);
                            navigate("/dashboard");
                        } else {
                            console.log("error hai",verifyData.message )
                            toast.error(verifyData.message || "Payment verification failed");
                        }
                    } catch (error) {
                        console.error("Verification Error:", error);
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast.error(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Choose the plan that fits your fitness journey. Upgrade anytime as you progress.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {tiers.map((tier) => (
                    <Card
                        key={tier.name}
                        className={`relative flex flex-col ${tier.border ? `border-2 ${tier.border}` : ''} ${tier.name === 'Gold' ? 'shadow-xl scale-105 z-10' : ''}`}
                    >
                        {tier.name === 'Gold' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                {tier.name}
                                {tier.icon}
                            </CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="text-3xl font-bold">
                                ₹{tier.price} <span className="text-sm font-normal text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-3">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className={`w-full ${tier.color ? tier.color : ''} ${tier.name === 'Silver' ? 'text-black hover:bg-slate-400' : ''} ${tier.name === 'Gold' ? 'text-yellow-900 hover:bg-yellow-200' : ''}`}
                                onClick={() => !tier.disabled && handlePayment(tier.price, tier.planId)}
                                disabled={tier.disabled || loading}
                                variant={tier.disabled ? "outline" : "default"}
                            >
                                {loading ? "Processing..." : tier.btnText}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PricingSync;

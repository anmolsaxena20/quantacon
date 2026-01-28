import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";


export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);
  const followUser = async(userId)=>{
    console.log("userId",userId)
    try {
      const token = localStorage.getItem("token");
      if(!token){
        toast.error("invalid session");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/social/follow/${userId}`,
        {
          method:"POST",
          headers:{
            "Authorization":`Bearer ${token}`
          }
        }
      )
      const ifo = await res.json();
      console.log("message",ifo)
      if(!res.ok){
        toast.error("error in response")
      }
      toast.success("user followed successfully");
    } catch (error) {
      console.log("Error while following the user")
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);

     const res = await fetch(`http://localhost:5000/api/social/user`,
      {
        method:"POST",
        headers:{
          "Authorization":`Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body:JSON.stringify({query})
      }
    );

      if (!res.ok) {
         toast.error("User search failed");
      }

      const data = await res.json();
      console.log("dataaa",data.users)
      setUsers(data.users);
    } catch (err) {
      toast.error("User search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Search Users</h1>
          <p className="text-sm text-muted-foreground">
            Find people and start connecting
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && users.length === 0 && query && (
          <p className="text-center text-sm text-muted-foreground">
            No users found
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card
              key={user._id}
              className="bg-card/80 backdrop-blur border-border/50 hover:shadow-lg transition"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {user.name}
                    {user.isVerifiedUser && (
                      <Badge variant="secondary">Verified</Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <button 
                onClick={()=>followUser(user._id)}
                className="text-sm text-primary hover:underline">
                  follow 
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

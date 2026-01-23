import { useSelector, useDispatch } from 'react-redux';
import { addPost, toggleLike, addComment } from '@/lib/slices/communitySlice';
import CreatePost from '@/components/features/CreatePost';
import PostCard from '@/components/features/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

export default function Community() {
    const dispatch = useDispatch();
    const { posts, activeUsers } = useSelector((state) => state.community);
    const currentUser = { id: 'currentUser' };

    const handlePost = (content) => {
        dispatch(addPost(content));
    };

    const handleLike = (postId) => {
        dispatch(toggleLike({ postId, userId: currentUser.id }));
    };

    const handleComment = (postId, content) => {
        dispatch(addComment({ postId, content }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">

            <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Community Feed</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Connect, share, and get inspired by others.</p>
                    </div>
                </div>

                <CreatePost onPost={handlePost} />

                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUser.id}
                            onLike={handleLike}
                            onComment={handleComment}
                        />
                    ))}
                </div>
            </div>


            <div className="hidden lg:block space-y-6">
                <div className="sticky top-6 space-y-6">
                    <Card className="border-0 bg-card/40 backdrop-blur-sm">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
                                Active Members
                            </h3>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {activeUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 border border-primary/20">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-background ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{user.name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 max-w-[80px] truncate">
                                                {user.status === 'online' ? 'Online now' : 'Last seen recently'}
                                            </p>
                                        </div>
                                    </div>
                                    {user.workoutStreak > 0 && (
                                        <Badge variant="secondary" className="text-[10px] h-5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
                                            ðŸ”¥ {user.workoutStreak}d
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-0">
                        <CardContent className="p-6 text-center space-y-3">
                            <p className="font-heading font-bold text-lg">Invite Friends</p>
                            <p className="text-xs text-muted-foreground">Workouts are better with friends. Invite them to join your journey!</p>
                            <Button className="w-full text-xs h-8 mt-2" variant="outline">Copy Invite Link</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

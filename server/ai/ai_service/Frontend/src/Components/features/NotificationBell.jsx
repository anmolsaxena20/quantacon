import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


function getRelativeTime(timestamp) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (timestamp - Date.now()) / 1000;

    if (diff > -60) return 'Just now';
    if (diff > -3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (diff > -86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
}

export default function NotificationBell() {
    const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotificationStore();
    const count = unreadCount();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold leading-none">Notifications</h4>
                        {count > 0 && <Badge variant="secondary" className="px-1.5 py-0.5 h-auto text-xs">{count} new</Badge>}
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-green-600"
                                title="Mark all read"
                                onClick={markAllAsRead}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-600"
                                title="Clear all"
                                onClick={clearAll}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                                        !notification.read && "bg-primary/5"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", notification.read && "text-muted-foreground")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground pt-1">
                                                {getRelativeTime(notification.timestamp)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

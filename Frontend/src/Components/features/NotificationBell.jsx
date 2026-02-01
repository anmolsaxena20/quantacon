import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

import { socket } from "@/socket/socket";

dayjs.extend(relativeTime);

export default function NotificationDropUp() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
useEffect(() => {
  const handleNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    toast.success("New Notification received");
  };

  socket.off("notification"); 
  socket.on("notification", handleNotification);

  return () => {
    socket.off("notification", handleNotification);
  };
}, []);


  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/notification/previous-notifications?limit=20",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setNotifications(data.data || []);
      } catch (err) {
        toast.error("Failed to load notifications");
      }
    };

    fetchNotifications();
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed bottom-6 left-21 overflow-visible"
    >
      {/* 🔔 Bell */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
      >
        <Bell className="h-5 w-5" />
      </button>

      {/* ⬆️ DROP-UP PANEL */}
      {open && (
        <div
          className="
            absolute
            bottom-full
            left-0
            mb-3
            w-80
            max-w-[90vw]
            bg-background
            border
            border-border
            rounded-xl
            shadow-2xl
            overflow-hidden
            animate-in
            slide-in-from-bottom-4
            fade-in
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border text-sm font-semibold">
            Notifications
          </div>

          {/* Content */}
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex gap-3 px-4 py-3 hover:bg-muted transition border-b border-border last:border-none"
                >
                  {/* Avatar */}
                  <img
                    src={n.sender?.picture || "/avatar.png"}
                    alt="sender"
                    className="w-9 h-9 rounded-full object-cover"
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">
                        {n.sender?.name}
                      </span>{" "}
                      {n.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {dayjs(n.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import NotificationCenter from "../components/NotificationCenter";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Check for notifications in localStorage
  useEffect(() => {
    const checkNotifications = () => {
      const stored = JSON.parse(localStorage.getItem("notifications")) || [];
      setHasNotifications(stored.length > 0);
    };

    // Check immediately
    checkNotifications();

    // And whenever window gains focus (if notifications arrive in background)
    window.addEventListener("focus", checkNotifications);

    // And clean up listener
    return () => window.removeEventListener("focus", checkNotifications);
  }, [isNotificationOpen]);

  const handleOpenNotifications = () => {
    setIsNotificationOpen(true);
    // Clear dot when opened
    setHasNotifications(false);
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          {/* 📌 Top header bar */}
          <div className="flex items-center justify-end gap-3 border-b border-base-300 p-2">
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="btn btn-sm"
                title="Notifications"
              >
                <Bell className="size-5" />
              </button>

              {hasNotifications && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full ring-2 ring-white" />
              )}
            </div>
          </div>

          {/* 📌 Main chat body */}
          <div className="flex h-[calc(100%-3rem)] rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>

      {/* 📌 Notification Center */}
      {isNotificationOpen && (
        <NotificationCenter onClose={() => setIsNotificationOpen(false)} />
      )}
    </div>
  );
};

export default HomePage;

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

// LocalStorage helpers
const getStoredNotifications = () => {
  const stored = localStorage.getItem("notifications");
  return stored ? JSON.parse(stored) : [];
};

const saveNotifications = (notifications) => {
  localStorage.setItem("notifications", JSON.stringify(notifications));
};

const NotificationCenter = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useAuthStore();

  useEffect(() => {
    // Load stored on mount
    const stored = getStoredNotifications();
    setNotifications(stored);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      const newNoti = {
        message: data.text,
        time: new Date(data.timestamp).toLocaleString(),
      };

      const updated = [newNoti, ...notifications];
      setNotifications(updated);
      saveNotifications(updated);
      toast.success("🔔 New notification!");
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, notifications]);

  const handleClearAll = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
    toast.success("Cleared all notifications!");
  };

  const handleRemoveOne = (index) => {
    const updated = [...notifications];
    updated.splice(index, 1);
    setNotifications(updated);
    saveNotifications(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">🔔 Notifications</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((note, idx) => (
              <div
                key={idx}
                className="bg-base-200 p-3 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{note.message}</p>
                  <p className="text-xs text-zinc-500">{note.time}</p>
                </div>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleRemoveOne(idx)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No notifications yet.</p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={handleClearAll} className="btn btn-error btn-sm">
            Clear All
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

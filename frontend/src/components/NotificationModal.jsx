import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

const NotificationModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthStore();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/notifications`,
        { headers: { Authorization: `Bearer ${authUser.token}` } }
      );
      setNotifications(res.data);
    } catch (err) {
      toast.error("Failed to load notifications");
    }
  };

  const clearNotification = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/${id}`,
        { headers: { Authorization: `Bearer ${authUser.token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error("Failed to clear notification");
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${authUser.token}` },
      });
      setNotifications([]);
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">🔔 Notifications</h2>

        <div className="max-h-64 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-zinc-400">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className="flex justify-between items-center bg-zinc-100 p-2 rounded"
              >
                <p className="text-sm">{n.message}</p>
                <button
                  onClick={() => clearNotification(n._id)}
                  className="btn btn-sm btn-error"
                >
                  ✖
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={clearAll} className="btn btn-sm btn-warning flex-1">
            Clear All
          </button>
          <button onClick={onClose} className="btn btn-sm btn-ghost flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

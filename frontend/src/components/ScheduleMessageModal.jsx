import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

const ScheduleMessageModal = ({ isOpen, onClose, receiverId }) => {
  const { authUser, socket } = useAuthStore();
  const [text, setText] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  const handleSchedule = async () => {
    if (!text || !scheduledFor) {
      toast.error("Please enter message and time.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/messages/schedule`,
        {
          receiverId,
          text,
          scheduledFor,
        },
        {
          withCredentials: true, // ✅ send cookies for auth
        }
      );

      toast.success("Message scheduled successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to schedule message:", error);
      toast.error("Failed to schedule message");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">📅 Schedule Message</h2>

        <textarea
          className="textarea textarea-bordered w-full mb-3"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="datetime-local"
          className="input input-bordered w-full mb-3"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleSchedule} className="btn btn-primary">
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMessageModal;

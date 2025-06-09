import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReminderManager = ({ onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [text, setText] = useState("");
  const [scheduledFor, setScheduledFor] = useState(new Date());

  const fetchReminders = async () => {
    try {
      const res = await axiosInstance.get("/reminders");
      if (Array.isArray(res.data)) {
        setReminders(res.data);
      } else {
        console.error("❌ Not an array ➝", res.data);
        setReminders([]);
      }
    } catch (err) {
      console.error("🔥 Fetch failed: ", err);
      toast.error("Failed to fetch reminders");
    }
  };

  const addReminder = async () => {
    if (!text) {
      toast.error("Please enter reminder text");
      return;
    }
    try {
      await axiosInstance.post("/reminders", { text, scheduledFor });
      toast.success("Reminder added!");
      setText("");
      setScheduledFor(new Date());
      fetchReminders();
    } catch (err) {
      console.error("❌ Failed to add reminder:", err);
      toast.error("Failed to add reminder");
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axiosInstance.delete(`/reminders/${id}`);
      toast.success("Deleted");
      fetchReminders();
    } catch (err) {
      console.error("❌ Failed to delete reminder:", err);
      toast.error("Failed to delete reminder");
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">📋 My Reminders</h2>

        <div className="mb-4">
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder="Reminder message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <DatePicker
            selected={scheduledFor}
            onChange={(date) => setScheduledFor(date)}
            showTimeSelect
            dateFormat="Pp"
            className="input input-bordered w-full"
          />
          <button onClick={addReminder} className="btn btn-primary w-full mt-3">
            ➕ Add Reminder
          </button>
        </div>

        <h3 className="font-semibold mb-2">📅 Upcoming:</h3>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {reminders.length > 0 ? (
            reminders.map((r) => (
              <div
                key={r._id}
                className="flex justify-between items-center bg-zinc-100 p-2 rounded"
              >
                <div>
                  <p className="font-medium">{r.text}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(r.scheduledFor).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(r._id)}
                  className="btn btn-sm btn-error"
                >
                  ✖
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">No reminders yet</p>
          )}
        </div>

        <button onClick={onClose} className="btn btn-ghost mt-4 w-full">
          Close
        </button>
      </div>
    </div>
  );
};

export default ReminderManager;

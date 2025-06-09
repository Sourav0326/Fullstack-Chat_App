import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

const StatusManager = ({ onClose }) => {
  const [statuses, setStatuses] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const { authUser } = useAuthStore();

  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/statuses");
      setStatuses(res.data);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
      toast.error("Could not fetch statuses");
    }
  };

  const addStatus = async () => {
    if (!file) return toast.error("Please select a file");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await axiosInstance.post("/statuses", {
          file: reader.result,
          caption,
          mediaType: file.type.startsWith("video") ? "video" : "image",
        });
        toast.success("Status uploaded!");
        setFile(null);
        setCaption("");
        fetchStatuses();
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload status");
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteStatus = async (id) => {
    try {
      await axiosInstance.delete(`/statuses/${id}`);
      toast.success("Status deleted");
      fetchStatuses();
    } catch (err) {
      toast.error("Failed to delete status");
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const myStatuses = statuses.filter((s) => s.userId._id === authUser._id);
  const othersStatuses = statuses.filter((s) => s.userId._id !== authUser._id);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">📝 Statuses</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input file-input-bordered w-full mb-3"
        />
        <textarea
          className="textarea textarea-bordered w-full mb-3"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button onClick={addStatus} className="btn btn-primary w-full mb-4">
          ➕ Upload Status
        </button>

        {/* 🔷 My Statuses */}
        {myStatuses.length > 0 && (
          <>
            <h3 className="font-semibold mb-2">🙋‍♂️ My Statuses</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
              {myStatuses.map((s, idx) => (
                <div key={idx} className="p-2 bg-zinc-100 rounded relative">
                  {s.mediaType === "image" ? (
                    <img
                      src={s.mediaUrl}
                      alt="status"
                      className="w-full rounded mb-1"
                    />
                  ) : (
                    <video
                      src={s.mediaUrl}
                      controls
                      className="w-full rounded mb-1"
                    />
                  )}
                  <p>{s.caption}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => deleteStatus(s._id)}
                    className="absolute top-2 right-2 text-red-500 font-bold"
                    title="Delete Status"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 🔶 Others' Statuses */}
        <h3 className="font-semibold mb-2">📖 Others' Statuses</h3>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {othersStatuses.length > 0 ? (
            othersStatuses.map((s, idx) => (
              <div key={idx} className="p-2 bg-zinc-100 rounded">
                {s.mediaType === "image" ? (
                  <img
                    src={s.mediaUrl}
                    alt="status"
                    className="w-full rounded mb-1"
                  />
                ) : (
                  <video
                    src={s.mediaUrl}
                    controls
                    className="w-full rounded mb-1"
                  />
                )}
                <p className="text-sm font-semibold">{s.userId.fullName}</p>
                <p>{s.caption}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No statuses yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusManager;

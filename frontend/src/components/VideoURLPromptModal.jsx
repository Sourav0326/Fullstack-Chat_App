// src/components/VideoURLPromptModal.jsx
import { useState } from "react";

const VideoURLPromptModal = ({ isOpen, onSubmit, onCancel }) => {
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-md w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Enter Video URL</h2>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="input input-bordered w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSubmit(url)}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoURLPromptModal;

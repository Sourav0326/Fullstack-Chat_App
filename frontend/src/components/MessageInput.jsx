import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import ScheduleMessageModal from "./ScheduleMessageModal";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 📦 emoji picker toggle

  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full relative">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* 📸 Image button */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* 😊 Emoji picker button */}
          <button
            type="button"
            className="btn btn-circle text-zinc-400"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add Emoji"
          >
            😊
          </button>
        </div>

        {/* 📅 Schedule button */}
        <button
          type="button"
          className="btn btn-sm btn-circle"
          onClick={() => setIsSchedulerOpen(true)}
          disabled={!selectedUser}
          title="Schedule Message"
        >
          📅
        </button>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>

      {/* 📅 Schedule Modal */}
      {selectedUser && (
        <ScheduleMessageModal
          isOpen={isSchedulerOpen}
          onClose={() => setIsSchedulerOpen(false)}
          receiverId={selectedUser._id}
        />
      )}

      {/* 😊 Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-50">
          <EmojiPicker
            onEmojiClick={(emojiObject) => {
              setText((prev) => prev + emojiObject.emoji);
            }}
            theme="light"
          />
        </div>
      )}
    </div>
  );
};

export default MessageInput;

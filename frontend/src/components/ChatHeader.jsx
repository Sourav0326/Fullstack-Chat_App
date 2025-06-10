import { X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import GroupInfoModal from "./GroupInfoModal";
import VideoURLPromptModal from "./VideoURLPromptModal"; // ✅ new

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, setWatchingWith } = useChatStore();
  const { onlineUsers, socket, authUser } = useAuthStore();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isVideoPromptOpen, setIsVideoPromptOpen] = useState(false); // ✅ modal state

  const isGroup = selectedUser?.isGroup;
  const groupMembers = selectedUser?.members || [];

  const handleWatchRequest = (videoUrl) => {
    setWatchingWith(selectedUser._id);
    socket.emit("watch-request", {
      to: selectedUser._id,
      from: authUser.fullName,
      fromId: authUser._id,
      videoUrl,
    });
    setIsVideoPromptOpen(false);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  isGroup
                    ? selectedUser.groupImage || "/group-icon.png"
                    : selectedUser.profilePic || "/avatar.png"
                }
                alt={selectedUser.groupName || selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3
              className={`font-medium ${
                isGroup ? "cursor-pointer hover:underline" : ""
              }`}
              onClick={() => isGroup && setIsInfoModalOpen(true)}
            >
              {isGroup ? selectedUser.groupName : selectedUser.fullName}
            </h3>

            <p className="text-sm text-base-content/70">
              {isGroup
                ? `${groupMembers.length} members`
                : onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>

            {isGroup && (
              <div className="text-xs text-zinc-400 truncate max-w-xs">
                {groupMembers.map((m) => m.fullName).join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isGroup && (
            <button
              onClick={() => setIsVideoPromptOpen(true)}
              className="btn btn-sm"
              title="Watch Together"
            >
              📺
            </button>
          )}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>

      {isGroup && isInfoModalOpen && (
        <GroupInfoModal close={() => setIsInfoModalOpen(false)} />
      )}

      {/* ✅ Watch Together Video URL modal */}
      {!isGroup && (
        <VideoURLPromptModal
          isOpen={isVideoPromptOpen}
          onSubmit={handleWatchRequest}
          onCancel={() => setIsVideoPromptOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;

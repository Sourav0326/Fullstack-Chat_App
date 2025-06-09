import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus, ClipboardList } from "lucide-react";
import GroupCreateModal from "./GroupCreateModal";
import ReminderManager from "./ReminderManager";
import StatusManager from "./StatusManager"; // 📌 new

const Sidebar = () => {
  const {
    getUsers,
    users,
    groups,
    getGroups,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false); // 📌 status modal state

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const contactItems = [
    { _id: "reminders", fullName: "📋 My Reminders", isReminder: true },
    { _id: "statuses", fullName: "📝 Statuses", isStatus: true }, // 📌 new status button
    ...groups.map((group) => ({ ...group, isGroup: true })),
    ...filteredUsers.map((user) => ({ ...user, isGroup: false })),
  ];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden lg:flex items-center justify-center p-1 hover:opacity-80"
            title="Create Group"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Online filter */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* Contact list */}
      <div className="overflow-y-auto w-full py-3">
        {contactItems.map((item) => (
          <button
            key={item._id}
            onClick={() => {
              if (item.isReminder) setIsReminderOpen(true);
              else if (item.isStatus) setIsStatusOpen(true);
              else setSelectedUser(item);
            }}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedUser?._id === item._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative mx-auto lg:mx-0">
              {item.isReminder ? (
                <ClipboardList className="size-10 text-emerald-500" />
              ) : item.isStatus ? (
                <div className="size-10 bg-yellow-300 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  S
                </div>
              ) : (
                <img
                  src={
                    item.isGroup
                      ? item.groupImage || "/group-icon.png"
                      : item.profilePic || "/avatar.png"
                  }
                  alt={item.fullName || item.groupName}
                  className="size-12 object-cover rounded-full"
                />
              )}

              {!item.isGroup &&
                !item.isReminder &&
                !item.isStatus &&
                onlineUsers.includes(item._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
            </div>

            {/* Name and status */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">
                {item.fullName || item.groupName}
              </div>
              <div className="text-sm text-zinc-400">
                {item.isGroup
                  ? "Group"
                  : item.isReminder
                  ? "Reminder Manager"
                  : item.isStatus
                  ? "Status"
                  : onlineUsers.includes(item._id)
                  ? "Online"
                  : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {contactItems.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts</div>
        )}
      </div>

      {/* Group creation modal */}
      {isModalOpen && <GroupCreateModal close={() => setIsModalOpen(false)} />}

      {/* Reminder manager modal */}
      {isReminderOpen && (
        <ReminderManager onClose={() => setIsReminderOpen(false)} />
      )}

      {/* Status manager modal */}
      {isStatusOpen && <StatusManager onClose={() => setIsStatusOpen(false)} />}
    </aside>
  );
};

export default Sidebar;

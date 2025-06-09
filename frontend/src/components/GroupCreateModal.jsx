import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

const GroupCreateModal = ({ close }) => {
  const { users, createGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!groupName || selectedMembers.length === 0) {
      return;
    }
    await createGroup({ groupName, memberIds: selectedMembers });
    close(); // Close modal on success
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md space-y-4">
        <h2 className="text-xl font-bold">Create Group</h2>

        <input
          type="text"
          placeholder="Enter group name"
          className="input input-bordered w-full"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="max-h-52 overflow-y-auto border rounded-md p-2 space-y-2">
          {users.map((user) => (
            <label key={user._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMembers.includes(user._id)}
                onChange={() => toggleMember(user._id)}
              />
              <span>{user.fullName}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="btn btn-outline" onClick={close}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;

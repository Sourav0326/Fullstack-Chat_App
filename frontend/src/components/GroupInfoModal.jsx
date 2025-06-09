import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const GroupInfoModal = ({ close }) => {
  const { selectedUser, getGroups, setSelectedUser } = useChatStore();

  const [groupName, setGroupName] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedUser?.isGroup) {
      setGroupName(selectedUser.groupName || "");
    }
  }, [selectedUser]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setBase64Image(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!selectedUser?._id) {
      toast.error("Group ID is missing");
      return;
    }

    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    try {
      const res = await fetch(
        `${API_URL}/api/groups/${selectedUser._id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            groupName: groupName.trim(),
            image: base64Image,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update group");
      }

      toast.success("Group updated");

      await getGroups();

      setSelectedUser({
        ...selectedUser,
        groupName: data.group.groupName,
        groupImage: data.group.groupImage,
      });

      close();
    } catch (error) {
      console.error("Group update error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Group Info</h2>

        {/* Group DP Upload */}
        <div className="flex justify-center mb-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="avatar">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img
                  src={
                    base64Image || selectedUser?.groupImage || "/group-icon.png"
                  }
                  alt="Group DP"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <p className="text-xs text-center mt-1 text-zinc-500">
              Click image to change
            </p>
          </label>
        </div>

        {/* Group Name Edit */}
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="input input-bordered w-full mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={close}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="btn btn-primary"
            disabled={isLoading || !groupName.trim()}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;

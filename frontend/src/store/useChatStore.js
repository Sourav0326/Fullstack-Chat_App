import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error("Failed to load groups");
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set((state) => ({
        groups: [...state.groups, res.data],
      }));
      toast.success("Group created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Group creation failed");
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    const { selectedUser } = get();
    const isGroup = selectedUser?.isGroup;

    try {
      const url = isGroup
        ? `/messages/${userId}?group=true`
        : `/messages/${userId}`;
      const res = await axiosInstance.get(url);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const isGroup = selectedUser?.isGroup;
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        isGroup ? { ...messageData, groupId: selectedUser._id } : messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");
    socket.off("messageDeleted");

    socket.on("newMessage", (newMessage) => {
      const { messages } = get();
      const isSelected = selectedUser?.isGroup
        ? newMessage.groupId === selectedUser._id
        : newMessage.senderId === selectedUser?._id ||
          newMessage.receiverId === selectedUser?._id;

      if (isSelected) {
        set({ messages: [...messages, newMessage] });
      }
    });

    socket.on("messageDeleted", (deletedMessageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  deleteMessageForEveryone: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Message deleted for everyone");
    } catch (error) {
      console.log("Delete for everyone failed", error);
      toast.error("Failed to delete for everyone");
    }
  },

  deleteMessageForMe: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/deleteForMe/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Message deleted for you");
    } catch (error) {
      console.log("Delete for me failed", error);
      toast.error("Failed to delete message for you");
    }
  },

  // ✅ Watch Together States
  watchingWith: null,
  setWatchingWith: (id) => set({ watchingWith: id }),

  // ✅ Real-time Video Data
  watchTogetherData: null,
  setWatchTogetherData: (data) => set({ watchTogetherData: data }),

  // ✅ Floating Video Minimize/Maximize
  isVideoMinimized: false,
  minimizeVideo: () => set({ isVideoMinimized: true }),
  maximizeVideo: () => set({ isVideoMinimized: false }),
}));

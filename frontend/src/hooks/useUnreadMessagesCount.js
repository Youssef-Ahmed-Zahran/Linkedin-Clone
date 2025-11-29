import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useCurrentUser } from "../store/auth";
import { axiosInstance } from "../lib/axios";

const useUnreadMessagesCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { data: currentUser } = useCurrentUser();

  // Function to fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get("/messages/unread/count");
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch initial unread count
  useEffect(() => {
    if (currentUser?._id) {
      fetchUnreadCount();
    }
  }, [currentUser?._id]);

  // Listen for new messages and messagesSeen via socket
  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    const handleNewMessage = (message) => {
      // Only increment if message is from someone else
      if (message.sender !== currentUser._id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleMessagesSeen = () => {
      // Refetch the exact count from backend
      console.log("🔄 Messages marked as seen, refetching count...");
      fetchUnreadCount();
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, currentUser?._id]);

  return unreadCount;
};

export default useUnreadMessagesCount;

import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { selectedConversationAtom } from "../../store/atom/messagesAtom";
import { useRecoilValue } from "recoil";
import { useSocket } from "../../context/SocketContext";
import messageSound from "../../assets/sounds/message.mp3";
import { useCurrentUser } from "../../store/auth";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

function MessageContainer() {
  const { data: currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [messages, setMessages] = useState([]);
  const { socket } = useSocket();
  const messageEndRef = useRef(null);
  const scrollRef = useRef(null);

  // Listen for new messages (only for receiver)
  useEffect(() => {
    if (!socket || !selectedConversation?._id || !currentUser?._id) return;

    const handleNewMessage = (message) => {
      // Only add message if it belongs to current conversation AND not from current user
      if (
        (selectedConversation._id === message.conversationId ||
          selectedConversation.userId === message.sender) &&
        message.sender !== currentUser._id
      ) {
        setMessages((prev) => {
          // Prevent duplicates by checking if message already exists
          const messageExists = prev.some((m) => m._id === message._id);
          if (messageExists) {
            console.log("⚠️ Duplicate message prevented:", message._id);
            return prev;
          }
          return [...prev, message];
        });

        // Play notification sound if window not focused
        if (!document.hasFocus()) {
          const sound = new Audio(messageSound);
          sound.play().catch(() => {});
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [
    socket,
    selectedConversation?._id,
    selectedConversation?.userId,
    currentUser?._id,
  ]);

  // Mark messages as seen
  useEffect(() => {
    if (!socket || !messages.length || !selectedConversation?._id) return;

    const lastMessage = messages[messages.length - 1];
    const lastMessageIsFromOtherUser = lastMessage.sender !== currentUser._id;

    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    const handleMessagesSeen = ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.seen ? m : { ...m, seen: true }))
        );
      }
    };

    socket.on("messagesSeen", handleMessagesSeen);
    return () => socket.off("messagesSeen", handleMessagesSeen);
  }, [socket, currentUser?._id, messages, selectedConversation]);

  // Smooth scroll down when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Load initial messages for selected conversation
  useEffect(() => {
    const getMessages = async () => {
      // Skip loading for new conversations (temporary IDs starting with "temp_")
      if (
        selectedConversation?._id?.startsWith("temp_") ||
        selectedConversation?.isNewConversation
      ) {
        setMessages([]);
        return;
      }

      setLoading(true);
      setMessages([]);
      try {
        const res = await axiosInstance.get(
          `/messages/${selectedConversation.userId}`
        );
        if (res.data) {
          setMessages(res.data);
        } else {
          toast.error("Messages not found");
        }
      } catch (err) {
        // Don't show error for new conversations
        if (!err.response?.status === 404) {
          toast.error(err.message || "Could not load messages");
        }
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?.userId) {
      getMessages();
    }
  }, [
    selectedConversation?.userId,
    selectedConversation?._id,
    selectedConversation?.isNewConversation,
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <img
          src={selectedConversation.userProfilePic}
          alt={selectedConversation.username}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="font-medium text-gray-800 dark:text-gray-100">
          {selectedConversation.username}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                } gap-3`}
              >
                {i % 2 === 0 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="w-[240px] h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                {i % 2 !== 0 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-2">
              Start the conversation by sending a message!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m._id}>
                <Message
                  message={m}
                  ownMessage={currentUser._id === m.sender}
                />
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
        <MessageInput setMessages={setMessages} />
      </div>
    </div>
  );
}

export default MessageContainer;

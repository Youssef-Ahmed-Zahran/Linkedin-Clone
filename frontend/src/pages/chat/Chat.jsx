import { useEffect, useState } from "react";
import { GiConversation } from "react-icons/gi";
import ConversationsList from "../../components/chat/ConversationsList";
import MessageContainer from "../../components/chat/MessageContainer";
import useGetConversations from "../../hooks/useGetConversations";
import { useRecoilState } from "recoil";
import { selectedConversationAtom } from "../../store/atom/messagesAtom";
import { useSocket } from "../../context/SocketContext";
import { toast, Toaster } from "react-hot-toast";
import { useCurrentUser } from "../../store/auth";

function Chat() {
  const { conversations, setConversations, loading } = useGetConversations();
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [searchText, setSearchText] = useState("");
  const [searchingLoading, setSearchingLoading] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { socket, onlineUsers } = useSocket();

  // Create a simple beep sound using Web Audio API
  const playNotificationSound = () => {
    try {
      console.log("🔔 Attempting to play sound...");

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      console.log("✅ Sound played successfully");
    } catch (error) {
      console.error("❌ Could not play notification sound:", error);
    }
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleMessagesSeen = ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: { ...c.lastMessage, seen: true } }
            : c
        )
      );
    };

    const handleNewMessage = (message) => {
      console.log("📩 New message received:", {
        sender: message.sender,
        currentUser: currentUser._id,
        isFromOtherUser: message.sender !== currentUser._id,
        conversationId: message.conversationId,
        selectedConversation: selectedConversation?._id,
        isConversationOpen:
          selectedConversation?._id === message.conversationId,
      });

      const shouldPlaySound =
        message.sender !== currentUser._id &&
        selectedConversation?._id !== message.conversationId;

      if (shouldPlaySound) {
        console.log("🔔 Playing sound - conversation is closed!");
        playNotificationSound();
      } else if (message.sender === currentUser._id) {
        console.log("⏭️ Skipping sound (own message)");
      } else {
        console.log("⏭️ Skipping sound (conversation is open)");
      }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
                seen: message.sender === currentUser._id,
                img: message.img || "",
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    };

    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, setConversations, currentUser, selectedConversation]);

  const handleConversationSearch = async (e) => {
    e?.preventDefault();

    if (!searchText.trim()) {
      toast.error("Please enter a username to search");
      return;
    }

    setSearchingLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/users/profile/${searchText}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // This sends the HTTP-only cookie
        }
      );

      const searchUser = await res.json();

      if (searchUser.error) {
        toast.error(searchUser.error);
        return;
      }

      if (searchUser._id === currentUser._id) {
        toast.error("You can't message yourself");
        return;
      }

      // Check if conversation already exists
      const conversationAlreadyExists = conversations.find(
        (conv) => conv.participants[0]._id === searchUser._id
      );

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          userId: searchUser._id,
          username: searchUser.username,
          userProfilePic: searchUser.profilePicture,
        });
        toast.success(`Conversation with ${searchUser.username} opened!`);
        setSearchText("");
        return;
      }

      // Create a temporary conversation object for the new user
      const newConversation = {
        _id: `temp_${searchUser._id}_${Date.now()}`, // Temporary unique ID
        participants: [
          {
            _id: searchUser._id,
            username: searchUser.username,
            profilePicture: searchUser.profilePicture,
          },
        ],
        lastMessage: {
          text: "",
          sender: "",
          seen: false,
        },
      };

      // Add to conversations list at the top
      setConversations((prev) => [newConversation, ...prev]);

      // Select the new conversation
      setSelectedConversation({
        _id: newConversation._id,
        userId: searchUser._id,
        username: searchUser.username,
        userProfilePic: searchUser.profilePicture,
        isNewConversation: true, // Flag for new conversation
      });

      toast.success(`Start chatting with ${searchUser.username}!`);
      setSearchText("");
    } catch (err) {
      console.error("Search error:", err);
      toast.error(err.message || "Search failed. Please try again.");
    } finally {
      setSearchingLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="min-h-screen bg-[#f3f2ef] dark:bg-gray-900 py-6">
        <div className="max-w-[1350px] mx-auto px-4">
          <div className="grid grid-cols-[320px_1fr] gap-5">
            {/* Left side */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[80vh] overflow-hidden">
              <ConversationsList
                conversations={conversations}
                loading={loading}
                onlineUsers={onlineUsers}
                onSearchSubmit={handleConversationSearch}
                searchText={searchText}
                setSearchText={setSearchText}
                searchingLoading={searchingLoading}
              />
            </div>

            {/* Middle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[80vh] overflow-hidden">
              {selectedConversation?._id || selectedConversation?.userId ? (
                <MessageContainer />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-600 dark:text-gray-300">
                  <GiConversation size={80} className="text-gray-400" />
                  <h3 className="mt-4 text-xl font-semibold">
                    Select a conversation
                  </h3>
                  <p className="mt-2 max-w-[380px]">
                    Choose a conversation from the left to view messages — or
                    search a user to start a new chat.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;

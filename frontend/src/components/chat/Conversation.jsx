import React from "react";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { useRecoilState } from "recoil";
import { selectedConversationAtom } from "../../store/atom/messagesAtom";
import { useCurrentUser } from "../../store/auth";

function Conversation({ conversation, isOnline }) {
  const user = conversation.participants[0] || {};
  const lastMessage = conversation.lastMessage || {};
  const { data: currentUser } = useCurrentUser();

  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const isSelected = selectedConversation?._id === conversation._id;

  // Check if there's an unread message
  const hasUnreadMessage =
    lastMessage.sender &&
    lastMessage.sender !== currentUser?._id &&
    !lastMessage.seen;

  const handleClick = () =>
    setSelectedConversation({
      _id: conversation._id,
      userId: user._id,
      userProfilePic: user.profilePicture,
      username: user.username,
      mock: conversation.mock,
    });

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-blue-600 text-white"
            : hasUnreadMessage
            ? "bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
            : "hover:bg-gray-50 dark:hover:bg-gray-700"
        }
      `}
    >
      <div className="relative">
        <img
          src={user.profilePicture}
          alt={user.username || "User"}
          className="w-11 h-11 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div
            className={`font-medium truncate ${
              isSelected
                ? "text-white"
                : hasUnreadMessage
                ? "text-gray-900 dark:text-white font-semibold"
                : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {user.username}
          </div>

          {/* Unread badge */}
          {hasUnreadMessage && !isSelected && (
            <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full" />
          )}
        </div>

        <div
          className={`flex items-center gap-2 mt-1 text-sm ${
            isSelected
              ? "text-white/80"
              : hasUnreadMessage
              ? "text-gray-700 dark:text-gray-200 font-medium"
              : "text-gray-500 dark:text-gray-300"
          }`}
        >
          {/* Show checkmark if current user sent the last message */}
          {currentUser?._id === lastMessage.sender && (
            <div
              className={`flex-shrink-0 ${
                lastMessage.seen
                  ? isSelected
                    ? "text-white"
                    : "text-blue-400"
                  : isSelected
                  ? "text-white/60"
                  : "text-gray-400"
              }`}
            >
              <BsCheck2All size={14} />
            </div>
          )}

          {/* Show image icon or message text */}
          {lastMessage.img ? (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <BsFillImageFill size={14} />
              <span>Image</span>
            </div>
          ) : lastMessage.text ? (
            <div className="truncate">
              {lastMessage.text.length > 50
                ? lastMessage.text.substring(0, 50) + "..."
                : lastMessage.text}
            </div>
          ) : (
            <div className="truncate text-gray-400">No messages yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Conversation;

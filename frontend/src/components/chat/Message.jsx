// Message.jsx
import React, { useState } from "react";
import { BsCheck2All } from "react-icons/bs";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../../store/atom/messagesAtom";
import { useCurrentUser } from "../../store/auth";

function Message({ ownMessage, message }) {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const { data: currentUser } = useCurrentUser();
  const [imgLoaded, setImgLoaded] = useState(false);

  if (ownMessage) {
    // Right-side bubble (you)
    return (
      <div className="flex justify-end items-end gap-2 mb-3">
        <div className="flex items-end gap-2">
          <div className="flex flex-col items-end max-w-[65%]">
            {message.text && (
              <div className="bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-2xl rounded-br-md shadow break-words">
                <div className="whitespace-pre-wrap break-words">
                  {message.text}
                </div>
              </div>
            )}

            {message.img && (
              <div className="mt-2 w-[240px]">
                {!imgLoaded && (
                  <div className="w-full h-[200px] bg-gray-200 rounded-lg animate-pulse" />
                )}
                <img
                  src={message.img}
                  alt="message"
                  onLoad={() => setImgLoaded(true)}
                  className={`w-full h-[200px] object-cover rounded-lg ${
                    imgLoaded ? "" : "hidden"
                  }`}
                />
              </div>
            )}
          </div>

          <img
            src={currentUser?.profilePicture}
            alt="me"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />

          <div className="flex items-end text-xs text-gray-400">
            <BsCheck2All
              size={14}
              className={message.seen ? "text-blue-400" : "text-gray-400"}
            />
          </div>
        </div>
      </div>
    );
  }

  // Left-side bubble (other user)
  return (
    <div className="flex items-start gap-2 mb-3">
      <img
        src={selectedConversation?.userProfilePic}
        alt="user"
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex flex-col max-w-[65%]">
        {message.text && (
          <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded-2xl rounded-bl-md shadow break-words">
            <div className="whitespace-pre-wrap break-words">
              {message.text}
            </div>
          </div>
        )}

        {message.img && (
          <div className="mt-2 w-[240px]">
            {!imgLoaded && (
              <div className="w-full h-[200px] bg-gray-200 rounded-lg animate-pulse" />
            )}
            <img
              src={message.img}
              alt="message"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-[200px] object-cover rounded-lg ${
                imgLoaded ? "" : "hidden"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;

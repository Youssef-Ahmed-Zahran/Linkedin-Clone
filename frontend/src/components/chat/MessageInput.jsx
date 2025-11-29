import React, { useState, useRef } from "react";
import { BsSend, BsImage, BsX } from "react-icons/bs";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../../store/atom/messagesAtom";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

function MessageInput({ setMessages }) {
  const [messageText, setMessageText] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const imageRef = useRef(null);
  const selectedConversation = useRecoilValue(selectedConversationAtom);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const res = await axiosInstance.post("/messages", {
        recipientId: selectedConversation.userId,
        message: messageText,
        img: imgUrl,
      });

      if (res.data) {
        // Add sent message immediately to UI for sender
        setMessages((prev) => [...prev, res.data]);

        // Clear inputs
        setMessageText("");
        setImgUrl("");
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      {imgUrl && (
        <div className="relative inline-block">
          <img
            src={imgUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={() => setImgUrl("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <BsX size={20} />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSending}
        />

        <input
          type="file"
          hidden
          ref={imageRef}
          accept="image/*"
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          disabled={isSending}
        >
          <BsImage size={20} />
        </button>

        <button
          type="submit"
          disabled={isSending || (!messageText.trim() && !imgUrl)}
          className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BsSend size={20} />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;

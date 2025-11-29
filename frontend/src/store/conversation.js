import { axiosInstance } from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Fetch all conversations
export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/messages/conversations");
      return res.data;
    },
    onError: (error) => {
      console.log(error.message);
    },
  });
};

// Fetch messages for a specific user
export const useMessages = (userId, isEnabled = true) => {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/messages/${userId}`);
      return res.data;
    },
    enabled: isEnabled && !!userId,
    onError: (error) => {
      console.log(error.message);
    },
  });
};

// Send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, recipientId, img }) => {
      const res = await axiosInstance.post("/messages", {
        message,
        recipientId,
        img,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      // Update messages cache
      queryClient.setQueryData(["messages", variables.recipientId], (old) => {
        return old ? [...old, data] : [data];
      });

      // Update conversations cache
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old) return old;
        return old.map((conversation) => {
          if (conversation.participants[0]._id === variables.recipientId) {
            return {
              ...conversation,
              lastMessage: {
                text: variables.message,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
      });
    },
    onError: (error) => {
      console.log(error.message);
    },
  });
};

// Search for a user
export const useSearchUser = () => {
  return useMutation({
    mutationFn: async (username) => {
      const res = await axiosInstance.get(`/users/search/${username}`);
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response.data.error || "An error occurred");
    },
  });
};

// Hook to get online users
export const useOnlineUsers = () => {
  return useQuery({
    queryKey: ["onlineUsers"],
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });
};

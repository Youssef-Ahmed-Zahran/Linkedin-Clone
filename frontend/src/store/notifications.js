import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const NOTIFICATIONS_QUERY_KEY = ["notifications"];

// *********************************** ((API Functions)) **************************************** //

const getUserNotifications = async () => {
  const response = await axiosInstance.get("/notifications");
  return response.data;
};

const markNotificationAsRead = async (notificationId) => {
  const response = await axiosInstance.put(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};

const deleteNotification = async (notificationId) => {
  const response = await axiosInstance.delete(
    `/notifications/${notificationId}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetUserNotifications = (userId) => {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getUserNotifications,
    enabled: !!userId,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
    },
  });
};

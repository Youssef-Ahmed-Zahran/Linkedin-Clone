import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const CONNECTIONREQUESTS_QUERY_KEY = ["connectionRequests"];
export const USER_CONNECTIONS_QUERY_KEY = ["userConnections"];
export const CONNECTION_STATUS_QUERY_KEY = ["connectionStatus"];

// *********************************** ((API Functions)) **************************************** //

const sendConnectionRequest = async (userId) => {
  const response = await axiosInstance.post(`/connections/request/${userId}`);
  return response.data;
};

const acceptConnectionRequest = async (requestId) => {
  const response = await axiosInstance.put(`/connections/accept/${requestId}`);
  return response.data;
};

const rejectConnectionRequest = async (requestId) => {
  const response = await axiosInstance.put(`/connections/reject/${requestId}`);
  return response.data;
};

const getConnectionRequests = async () => {
  const response = await axiosInstance.get("/connections/requests");
  return response.data;
};

const getUserConnections = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get("/connections", {
    params: {
      page: pageParam,
      limit: 10,
    },
  });
  return response.data;
};

const removeConnection = async (userId) => {
  const response = await axiosInstance.delete(`/connections/${userId}`);
  return response.data;
};

const getConnectionStatus = async (userId) => {
  const response = await axiosInstance.get(`/connections/status/${userId}`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useSendConnectionRequest = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sendConnectionRequest(userId),
    onSuccess: () => {
      // Refetch immediately
      queryClient.refetchQueries({
        queryKey: [CONNECTION_STATUS_QUERY_KEY, userId],
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTIONREQUESTS_QUERY_KEY,
      });
    },
  });
};

export const useAcceptConnectionRequest = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => acceptConnectionRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONNECTION_STATUS_QUERY_KEY, userId],
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTIONREQUESTS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: USER_CONNECTIONS_QUERY_KEY,
      });
    },
  });
};

export const useRejectConnectionRequest = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => rejectConnectionRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONNECTION_STATUS_QUERY_KEY, userId],
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTIONREQUESTS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: USER_CONNECTIONS_QUERY_KEY,
      });
    },
  });
};

export const useGetConnectionRequests = (userId) => {
  return useQuery({
    queryKey: CONNECTIONREQUESTS_QUERY_KEY,
    queryFn: getConnectionRequests,
    enabled: !!userId,
  });
};

export const useGetUserConnections = (userId) => {
  return useInfiniteQuery({
    queryKey: USER_CONNECTIONS_QUERY_KEY,
    queryFn: getUserConnections,
    enabled: !!userId,
    getNextPageParam: (lastPage) => {
      const { currentPage, hasMore } = lastPage.pagination;
      return hasMore ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useRemoveConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => removeConnection(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_CONNECTIONS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTION_STATUS_QUERY_KEY,
      });
    },
  });
};

export const useGetConnectionStatus = (userId) => {
  return useQuery({
    queryKey: [CONNECTION_STATUS_QUERY_KEY, userId],
    queryFn: () => getConnectionStatus(userId),
    enabled: !!userId,
  });
};

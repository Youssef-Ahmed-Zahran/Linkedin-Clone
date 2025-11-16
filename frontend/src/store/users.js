import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { AUTHUSER_QUERY_KEY } from "./auth";

// Query Keys
export const SUGGESTIONS_QUERY_KEY = ["suggestionUsers"];
export const SINGLEPROFILE_QUERY_KEY = ["singleProfile"];

// *********************************** ((API Functions)) **************************************** //

const getSuggestedConnections = async () => {
  const response = await axiosInstance.get("/users/suggestions");
  return response.data;
};

const getPublicProfile = async (username) => {
  const response = await axiosInstance.get(`/users/${username}`);
  return response.data;
};

const updateCurrentUser = async (userData) => {
  const response = await axiosInstance.put(`/users/profile`, userData);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetSuggestedConnections = (userId) => {
  return useQuery({
    queryKey: SUGGESTIONS_QUERY_KEY,
    queryFn: getSuggestedConnections,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

export const useGetPublicProfile = (username) => {
  return useQuery({
    queryKey: [...SINGLEPROFILE_QUERY_KEY, username],
    queryFn: () => getPublicProfile(username),
    enabled: !!username,
    retry: 2,
  });
};

export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (data) => {
      // Invalidate auth user query
      queryClient.invalidateQueries({
        queryKey: AUTHUSER_QUERY_KEY,
      });

      // Invalidate the specific user's profile
      if (data?.username) {
        queryClient.invalidateQueries({
          queryKey: [...SINGLEPROFILE_QUERY_KEY, data.username],
        });
      }
    },
  });
};

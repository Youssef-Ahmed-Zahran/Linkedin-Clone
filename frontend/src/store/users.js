import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { AUTHUSER_QUERY_KEY } from "./auth";

// Query Keys
export const SUGGESTIONS_QUERY_KEY = ["suggestionUsers"];
export const USERPROFILE_QUERY_KEY = ["userProfile"];

// *********************************** ((API Functions)) **************************************** //

const getSuggestedUsers = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get("/users/suggestions", {
    params: {
      page: pageParam,
      limit: 5,
    },
  });
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

export const useGetSuggestedUsers = (userId) => {
  return useInfiniteQuery({
    queryKey: SUGGESTIONS_QUERY_KEY,
    queryFn: getSuggestedUsers,
    enabled: !!userId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

export const useGetPublicProfile = (username) => {
  return useQuery({
    queryKey: [USERPROFILE_QUERY_KEY, username],
    queryFn: () => getPublicProfile(username),
    enabled: !!username,
    retry: 2,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => updateCurrentUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: AUTHUSER_QUERY_KEY,
      });

      if (data?.username) {
        queryClient.invalidateQueries({
          queryKey: [USERPROFILE_QUERY_KEY, data.username],
        });
      }
    },
  });
};

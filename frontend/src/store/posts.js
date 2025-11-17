import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const FEEDPOSTS_QUERY_KEY = ["posts"];

// *********************************** ((API Functions)) **************************************** //

// Post Section
const getFeedPosts = async () => {
  const response = await axiosInstance.get("/posts");
  return response.data;
};

const getPostById = async (postId) => {
  const response = await axiosInstance.get(`/posts/${postId}`);
  return response.data;
};

const createPost = async (postData) => {
  const response = await axiosInstance.post("/posts/create", postData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

const deletePost = async (postId) => {
  const response = await axiosInstance.delete(`/posts/delete/${postId}`);
  return response.data;
};

const likePost = async (postId) => {
  const response = await axiosInstance.post(`/posts/${postId}/like`);
  return response.data;
};

const sharePost = async ({ postId, content }) => {
  const response = await axiosInstance.post(`/posts/${postId}/share`, {
    content,
  });
  return response.data;
};

// Comment Section
const createComment = async ({ postId, content }) => {
  const response = await axiosInstance.post(`/posts/${postId}/comment`, {
    content,
  });
  return response.data;
};

const deleteComment = async ({ postId, commentId }) => {
  const response = await axiosInstance.delete(
    `/posts/${postId}/delete/${commentId}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Post Section
export const useGetFeedPosts = () => {
  return useQuery({
    queryKey: FEEDPOSTS_QUERY_KEY,
    queryFn: getFeedPosts,
  });
};

export const useGetPostById = (postId) => {
  return useQuery({
    queryKey: [FEEDPOSTS_QUERY_KEY, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEEDPOSTS_QUERY_KEY,
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEEDPOSTS_QUERY_KEY,
      });
    },
  });
};

export const useLikePost = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => likePost(postId),
    onSuccess: () => {
      // Invalidate the feed to update like count in feed view
      queryClient.invalidateQueries({
        queryKey: FEEDPOSTS_QUERY_KEY,
      });
      // Invalidate the single post to update like count in single post view
      queryClient.invalidateQueries({
        queryKey: [FEEDPOSTS_QUERY_KEY, postId],
      });
    },
  });
};

export const useSharePost = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }) => sharePost({ postId, content }),
    onSuccess: () => {
      // Invalidate the feed to show the new shared post
      queryClient.invalidateQueries({
        queryKey: FEEDPOSTS_QUERY_KEY,
      });
      // Invalidate the specific post (in case share count is tracked)
      queryClient.invalidateQueries({
        queryKey: [FEEDPOSTS_QUERY_KEY, postId],
      });
    },
  });
};

// Comment Section
export const useCreateComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }) => createComment({ postId, content }),
    onSuccess: () => {
      // Invalidate the feed to update comment count in feed view
      queryClient.invalidateQueries({
        queryKey: FEEDPOSTS_QUERY_KEY,
      });
      // Invalidate the single post to show the new comment in single post view
      queryClient.invalidateQueries({
        queryKey: [FEEDPOSTS_QUERY_KEY, postId],
      });
    },
  });
};

export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId) => deleteComment({ postId, commentId }),
    onSuccess: () => {
      // Invalidate the feed to update comment count in feed view
      queryClient.invalidateQueries({
        queryKey: FEEDPOSTS_QUERY_KEY,
      });
      // Invalidate the single post to remove the deleted comment in single post view
      queryClient.invalidateQueries({
        queryKey: [FEEDPOSTS_QUERY_KEY, postId],
      });
    },
  });
};

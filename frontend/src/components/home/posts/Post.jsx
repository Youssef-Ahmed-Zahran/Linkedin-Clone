import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Loader,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import PostAction from "./PostAction";

// React Query
import { useCurrentUser } from "../../../store/auth";
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
  useLikePost,
} from "../../../store/posts";

function Post({ post }) {
  const { data: currentUser } = useCurrentUser();

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const isPostOwner = currentUser._id === post.author._id;
  const isLiked = post.likes.includes(currentUser._id);

  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();
  const { mutate: createComment, isPending: isAddingComment } =
    useCreateComment(post._id);
  const { mutate: likePost, isPending: isLikingPost } = useLikePost(post._id);
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteComment(post._id);

  const handleDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    deletePost(post._id, {
      onSuccess: () => {
        toast.success("Post deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleLikePost = async () => {
    if (isLikingPost) return;
    likePost({
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (newComment.trim()) {
      createComment(
        { content: newComment },
        {
          onSuccess: () => {
            toast.success("Comment added successfully");
            setNewComment("");
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Failed to add comment"
            );
          },
        }
      );
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    deleteComment(commentId, {
      onSuccess: () => {
        toast.success("Comment deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-black">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post.author.profilePicture || "/avatar.png"}
                alt={post.author.name}
                className="size-10 rounded-full mr-3"
              />
            </Link>

            <div>
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold">{post.author.name}</h3>
              </Link>
              <p className="text-xs text-[#5E5E5E]">{post.author.headline}</p>
              <p className="text-xs text-[#5E5E5E]">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          {isPostOwner && (
            <button
              onClick={handleDeletePost}
              className="text-red-500 hover:text-red-700"
            >
              {isDeletingPost ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>

        <p className="mb-4 text-black">{post.content}</p>

        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="rounded-lg w-full mb-4"
          />
        )}

        <div className="flex justify-between text-[#5E5E5E]">
          <PostAction
            icon={
              <ThumbsUp
                size={18}
                className={isLiked ? "text-blue-500  fill-blue-300" : ""}
              />
            }
            text={`Like (${post.likes.length})`}
            onClick={handleLikePost}
          />

          <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${post.comments?.length || 0})`}
            onClick={() => setShowComments(!showComments)}
          />

          <PostAction icon={<Share2 size={18} />} text="Share" />
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-4">
          <div className="mb-4 max-h-60 overflow-y-auto">
            {post.comments?.map((comment) => {
              const isCommentOwner = currentUser._id === comment.user._id;

              return (
                <div
                  key={comment._id}
                  className="mb-2 bg-[#F3F2EF] text-black p-2 rounded flex items-start"
                >
                  <img
                    src={comment.user.profilePicture || "/avatar.png"}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-[#5E5E5E]">
                          {formatDistanceToNow(new Date(comment.createdAt))}
                        </span>
                      </div>
                      {isCommentOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          {isDeletingComment ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-black">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 rounded-l-full bg-[#F3F2EF] focus:outline-none focus:ring-2 focus:ring-primary text-black"
            />

            <button
              type="submit"
              className="bg-[#0A66C2] text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300"
              disabled={isAddingComment}
            >
              {isAddingComment ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Post;

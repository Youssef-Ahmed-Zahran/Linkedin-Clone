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
  X,
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
  useSharePost,
} from "../../../store/posts";

function Post({ post }) {
  const { data: currentUser } = useCurrentUser();

  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const isPostOwner = currentUser._id === post.author._id;
  const isLiked = post.likes.includes(currentUser._id);

  // Check if this is a shared post
  const isSharedPost = !!post.sharedPost;
  const originalPost = post.sharedPost;

  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();
  const { mutate: createComment, isPending: isAddingComment } =
    useCreateComment(post._id);
  const { mutate: likePost, isPending: isLikingPost } = useLikePost(post._id);
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteComment(post._id);
  const { mutate: sharePost, isPending: isSharingPost } = useSharePost(
    post._id
  );

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

  const handleSharePost = async (e) => {
    e.preventDefault();

    sharePost(
      { content: shareMessage },
      {
        onSuccess: () => {
          toast.success("Post shared successfully");
          setShowShareModal(false);
          setShareMessage("");
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Failed to share post");
        },
      }
    );
  };

  return (
    <>
      <div className="bg-[#FFFFFF] rounded-lg shadow mb-4">
        <div className="p-4">
          {/* Post Author (Person who shared or created) */}
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
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                {isDeletingPost ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            )}
          </div>

          {/* User's message when sharing */}
          {isSharedPost && post.content && (
            <p className="mb-4 text-black">{post.content}</p>
          )}

          {/* Original Post Content (if shared) */}
          {isSharedPost && originalPost ? (
            <div className="border border-gray-300 rounded-lg p-4 mb-4">
              {/* Original Post Author */}
              <div className="flex items-center mb-3">
                <Link to={`/profile/${originalPost?.author?.username}`}>
                  <img
                    src={originalPost.author.profilePicture || "/avatar.png"}
                    alt={originalPost.author.name}
                    className="size-10 rounded-full mr-3"
                  />
                </Link>
                <div>
                  <Link to={`/profile/${originalPost?.author?.username}`}>
                    <h3 className="font-semibold text-black">
                      {originalPost.author.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#5E5E5E]">
                    {originalPost.author.headline}
                  </p>
                  <p className="text-xs text-[#5E5E5E]">
                    {formatDistanceToNow(new Date(originalPost.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {/* Original Post Content */}
              <p className="mb-3 text-black">{originalPost.content}</p>

              {/* Original Post Image */}
              {originalPost.image && (
                <img
                  src={originalPost.image}
                  alt="Post content"
                  className="rounded-lg w-full"
                />
              )}
            </div>
          ) : (
            <>
              {/* Regular Post Content (not shared) */}
              {!isSharedPost && post.content && (
                <p className="mb-4 text-black">{post.content}</p>
              )}

              {!isSharedPost && post.image && (
                <img
                  src={post.image}
                  alt="Post content"
                  className="rounded-lg w-full mb-4"
                />
              )}
            </>
          )}

          {/* Post Actions */}
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

            <PostAction
              icon={<Share2 size={18} />}
              text="Share"
              onClick={() => setShowShareModal(true)}
            />
          </div>
        </div>

        {/* Comments Section */}
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
                            className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
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
      {/* Share Modal */}
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">Share Post</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSharePost}>
              <div className="mb-4">
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="What do you want to say about this?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] text-black resize-none"
                  rows="3"
                />
              </div>

              {/* Preview of the post being shared */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <img
                    src={
                      (isSharedPost
                        ? originalPost?.author?.profilePicture
                        : post.author.profilePicture) || "/avatar.png"
                    }
                    alt={
                      isSharedPost
                        ? originalPost?.author?.name
                        : post.author.name
                    }
                    className="size-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="font-semibold text-sm text-black">
                      {isSharedPost
                        ? originalPost?.author?.name
                        : post.author.name}
                    </p>
                    <p className="text-xs text-[#5E5E5E]">
                      {isSharedPost
                        ? originalPost?.author?.headline
                        : post.author.headline}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-black line-clamp-3">
                  {isSharedPost ? originalPost?.content : post.content}
                </p>
                {((isSharedPost && originalPost?.image) ||
                  (!isSharedPost && post.image)) && (
                  <img
                    src={isSharedPost ? originalPost?.image : post.image}
                    alt="Post preview"
                    className="mt-2 rounded w-full max-h-32 object-cover"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSharingPost}
                  className="flex-1 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSharingPost ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Sharing...
                    </>
                  ) : (
                    "Share"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{" "}
    </>
  );
}

export default Post;

import { toast } from "react-hot-toast";
import {
  ExternalLink,
  Eye,
  MessageSquare,
  ThumbsUp,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/global/Sidebar";
import { formatDistanceToNow } from "date-fns";

// React Query
import { useCurrentUser } from "../../store/auth";
import {
  useDeleteNotification,
  useGetUserNotifications,
  useMarkNotificationAsRead,
} from "../../store/notifications";

const Notifications = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: notifications, isLoading } = useGetUserNotifications(
    currentUser?._id
  );

  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead({
    onSuccess: () => {
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to mark notification as read"
      );
    },
  });

  const { mutate: deleteNotificationMutation } = useDeleteNotification({
    onSuccess: () => {
      toast.success("Notification deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete notification"
      );
    },
  });

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="text-blue-500" />;
      case "comment":
        return <MessageSquare className="text-green-500" />;
      case "connectionAccepted":
        return <UserPlus className="text-purple-500" />;
      case "share":
        return <ExternalLink className="text-orange-500" />;
      default:
        return null;
    }
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "like":
        return (
          <span className="text-black">
            <strong>{notification.relatedUser.name}</strong> liked your post
          </span>
        );
      case "comment":
        return (
          <span className="text-black">
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-bold"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            commented on your post
          </span>
        );
      case "connectionAccepted":
        return (
          <span className="text-black">
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-bold"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            accepted your connection request
          </span>
        );
      case "share":
        return (
          <span className="text-black">
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-bold"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            shared your post
          </span>
        );

      default:
        return null;
    }
  };

  const renderRelatedPost = (relatedPost) => {
    if (!relatedPost) return null;

    return (
      <Link
        to={`/post/${relatedPost._id}`}
        className="mt-2 p-2 bg-gray-50 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
      >
        {relatedPost.image && (
          <img
            src={relatedPost.image}
            alt="Post preview"
            className="w-10 h-10 object-cover rounded"
          />
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-black truncate">
            {relatedPost.content}
          </p>
        </div>
        <ExternalLink size={14} className="text-gray-400" />
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={currentUser} />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-black">Notifications</h1>

          {isLoading ? (
            <p className="text-black">Loading notifications...</p>
          ) : notifications && notifications?.length > 0 ? (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`bg-white border rounded-lg p-4 my-4 transition-all hover:shadow-md ${
                    !notification.read ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/profile/${notification.relatedUser.username}`}
                      >
                        <img
                          src={
                            notification.relatedUser.profilePicture ||
                            "/avatar.png"
                          }
                          alt={notification.relatedUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </Link>

                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded-full">
                            {renderNotificationIcon(notification.type)}
                          </div>
                          <p className="text-sm">
                            {renderNotificationContent(notification)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                        {renderRelatedPost(notification.relatedPost)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() =>
                            markNotificationAsRead(notification._id)
                          }
                          className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                          aria-label="Mark as read"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotificationMutation(notification._id)
                        }
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors cursor-pointer"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-black">No notification at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

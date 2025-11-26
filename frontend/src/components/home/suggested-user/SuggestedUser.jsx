import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, Clock, UserCheck, UserPlus, X } from "lucide-react";

// React Query
import {
  useAcceptConnectionRequest,
  useGetConnectionStatus,
  useRejectConnectionRequest,
  useSendConnectionRequest,
} from "../../../store/connectionRequest";

function SuggestedUser({ user }) {
  const { data: connectionStatus, isLoading } = useGetConnectionStatus(
    user._id
  );
  const { mutate: sendConnectionRequest, isPending: isSending } =
    useSendConnectionRequest(user._id);
  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptConnectionRequest(user._id);
  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectConnectionRequest(user._id);

  const handleAccept = () => {
    if (!connectionStatus?.requestId) {
      toast.error("Request ID not found");
      return;
    }

    acceptRequest(connectionStatus.requestId, {
      onSuccess: () => {
        toast.success("Connection request accepted");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      },
    });
  };

  const handleReject = () => {
    if (!connectionStatus?.requestId) {
      toast.error("Request ID not found");
      return;
    }

    rejectRequest(connectionStatus.requestId, {
      onSuccess: () => {
        toast.success("Connection request rejected");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      },
    });
  };

  const handleConnect = () => {
    sendConnectionRequest({
      onSuccess: () => {
        toast.success("Connection request sent successfully");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      },
    });
  };

  const renderConnectionButton = () => {
    if (isLoading) {
      return (
        <button
          className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-500"
          disabled
        >
          Loading...
        </button>
      );
    }

    // Show loading state during mutations
    if (isAccepting || isRejecting || isSending) {
      return (
        <button
          className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-500"
          disabled
        >
          Processing...
        </button>
      );
    }

    switch (connectionStatus?.status) {
      case "pending":
        return (
          <button
            className="px-3 py-1 rounded-full text-sm bg-yellow-500 text-white flex items-center"
            disabled
          >
            <Clock size={16} className="mr-1" />
            Pending
          </button>
        );

      case "received":
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="rounded-full p-1 flex items-center justify-center bg-[#0A66C2] hover:bg-[#004182] text-white disabled:opacity-50"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleReject}
              disabled={isRejecting}
              className="rounded-full p-1 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        );

      case "connected":
        return (
          <button
            className="px-3 py-1 rounded-full text-sm bg-green-500 text-white flex items-center"
            disabled
          >
            <UserCheck size={16} className="mr-1" />
            Connected
          </button>
        );

      default:
        return (
          <button
            className="px-3 py-1 rounded-full text-sm border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors duration-200 flex items-center disabled:opacity-50"
            onClick={handleConnect}
            disabled={isSending}
          >
            <UserPlus size={16} className="mr-1" />
            Connect
          </button>
        );
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center flex-grow"
      >
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-sm text-black">{user.name}</h3>
          <p className="text-xs text-[#5E5E5E]">{user.headline}</p>
        </div>
      </Link>
      {renderConnectionButton()}
    </div>
  );
}

export default SuggestedUser;

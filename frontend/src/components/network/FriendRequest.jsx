import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  useAcceptConnectionRequest,
  useRejectConnectionRequest,
} from "../../store/connectionRequest";

const FriendRequest = ({ request, user }) => {
  const { mutate: acceptRequest } = useAcceptConnectionRequest(user?._id);
  const { mutate: rejectRequest } = useRejectConnectionRequest(user?._id);

  const acceptConnectionRequest = () => {
    if (!request._id) {
      toast.error("Request ID not found");
      return;
    }

    acceptRequest(request._id, {
      onSuccess: () => {
        toast.success("Connection request accepted");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      },
    });
  };

  const rejectConnectionRequest = () => {
    if (!request._id) {
      toast.error("Request ID not found");
      return;
    }

    rejectRequest(request._id, {
      onSuccess: () => {
        toast.success("Connection request rejected");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <Link to={`/profile/${request.sender.username}`}>
          <img
            src={request.sender.profilePicture || "/avatar.png"}
            alt={request.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        </Link>

        <div>
          <Link
            to={`/profile/${request.sender.username}`}
            className="font-semibold text-lg text-black"
          >
            {request.sender.name}
          </Link>
          <p className="text-gray-600">{request.sender.headline}</p>
        </div>
      </div>

      <div className="space-x-2">
        <button
          className="bg-[#0A66C2] text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
          onClick={() => acceptConnectionRequest(request._id)}
        >
          Accept
        </button>
        <button
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => rejectConnectionRequest(request._id)}
        >
          Reject
        </button>
      </div>
    </div>
  );
};
export default FriendRequest;

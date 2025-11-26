import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Camera,
  Clock,
  MapPin,
  UserCheck,
  UserPlus,
  X,
  Check,
  Loader2,
} from "lucide-react";

// React Query
import {
  useAcceptConnectionRequest,
  useGetConnectionStatus,
  useRejectConnectionRequest,
  useSendConnectionRequest,
} from "../../store/connectionRequest";

const ProfileHeader = ({ userData, isOwnProfile, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  // connection status
  const { data: connectionStatus, isLoading } = useGetConnectionStatus(
    userData._id
  );
  // send connection
  const { mutate: sendConnectionRequest, isPending: isSending } =
    useSendConnectionRequest(userData._id);
  // accept connection
  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptConnectionRequest(userData._id);
  // reject connection
  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectConnectionRequest(userData._id);

  // accept connection
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

  // reject connection
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

  // send connection
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

  // shows status of connection
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

  // update image
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prev) => ({
          ...prev,
          [event.target.name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // save user data
  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
    setEditedData({});
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6 relative">
      <div
        className="relative h-48 rounded-t-lg bg-cover bg-center"
        style={{
          backgroundImage: `url('${
            editedData.bannerImg || userData.bannerImg || "/banner.png"
          }')`,
        }}
      >
        {isEditing && (
          <label className="absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer text-black">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              name="bannerImg"
              onChange={handleImageChange}
              accept="image/*"
              disabled={isSaving}
            />
          </label>
        )}
      </div>

      <div className="p-4">
        <div className="relative -mt-20 mb-4">
          <img
            className="w-32 h-32 rounded-full mx-auto object-cover"
            src={
              editedData.profilePicture ||
              userData.profilePicture ||
              "/avatar.png"
            }
            alt={userData.name}
          />

          {isEditing && (
            <label className="absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer text-black">
              <Camera size={20} />
              <input
                type="file"
                className="hidden"
                name="profilePicture"
                onChange={handleImageChange}
                accept="image/*"
                disabled={isSaving}
              />
            </label>
          )}
        </div>

        <div className="text-center mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editedData.name ?? userData.name}
              onChange={(e) =>
                setEditedData({ ...editedData, name: e.target.value })
              }
              className="text-2xl font-bold mb-2 text-center w-full text-black"
              disabled={isSaving}
            />
          ) : (
            <h1 className="text-2xl font-bold mb-2 text-black">
              {userData.name}
            </h1>
          )}

          {isEditing ? (
            <input
              type="text"
              value={editedData.headline ?? userData.headline}
              onChange={(e) =>
                setEditedData({ ...editedData, headline: e.target.value })
              }
              className="text-gray-600 text-center w-full"
              disabled={isSaving}
            />
          ) : (
            <p className="text-gray-600">{userData.headline}</p>
          )}

          <div className="flex justify-center items-center mt-2">
            <MapPin size={16} className="text-gray-500 mr-1" />
            {isEditing ? (
              <input
                type="text"
                value={editedData.location ?? userData.location}
                onChange={(e) =>
                  setEditedData({ ...editedData, location: e.target.value })
                }
                className="text-gray-600 text-center"
                disabled={isSaving}
              />
            ) : (
              <span className="text-gray-600">{userData.location}</span>
            )}
          </div>
        </div>

        {isOwnProfile ? (
          isEditing ? (
            <div className="flex gap-2">
              <button
                className="flex-1 bg-[#0A66C2] text-white py-2 px-4 rounded-full hover:bg-[#004182] transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
              <button
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={() => {
                  setIsEditing(false);
                  setEditedData({});
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#0A66C2] text-white py-2 px-4 rounded-full hover:bg-[#004182] transition duration-300 cursor-pointer"
            >
              Edit Profile
            </button>
          )
        ) : (
          <div className="flex justify-center">{renderConnectionButton()}</div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

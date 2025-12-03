import { UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useEffect, useRef } from "react";
import Sidebar from "../../components/global/Sidebar";
import FriendRequest from "../../components/network/FriendRequest";
import UserCard from "../../components/network/UserCard";

// React Query
import { useCurrentUser } from "../../store/auth";
import {
  useGetConnectionRequests,
  useGetUserConnections,
  useRemoveConnection,
} from "../../store/connectionRequest";

function Network() {
  const { data: currentUser } = useCurrentUser();
  const {
    data: connectionRequests,
    isLoading,
    error,
  } = useGetConnectionRequests(currentUser?._id);

  const {
    data: userConnectionsData,
    isLoading: connectionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetUserConnections(currentUser?._id);

  const removeConnectionMutation = useRemoveConnection();

  // Intersection Observer for infinite scroll
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Handle error
  if (error) {
    toast.error(error?.response?.data?.message || "Failed to fetch requests");
  }

  // Handle remove connection
  const handleRemoveConnection = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from your connections?`)) {
      removeConnectionMutation.mutate(userId, {
        onSuccess: () => {
          toast.success("Connection removed successfully");
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Failed to remove connection");
        },
      });
    }
  };

  // Flatten all pages of connections
  const connections =
    userConnectionsData?.pages.flatMap((page) => page.connections) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={currentUser} />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div className="bg-[#FFFFFF] rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-black">My Network</h1>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading connection requests...</p>
            </div>
          ) : connectionRequests && connectionRequests.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-black">
                Connection Request
              </h2>
              <div className="space-y-4">
                {connectionRequests.map((request) => (
                  <FriendRequest
                    key={request._id}
                    request={request}
                    user={currentUser}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center mb-6">
              <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-black">
                No Connection Requests
              </h3>
              <p className="text-gray-600">
                You don&apos;t have any pending connection requests at the
                moment.
              </p>
              <p className="text-gray-600 mt-2">
                Explore suggested connections below to expand your network!
              </p>
            </div>
          )}

          {connectionsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading connections...</p>
            </div>
          ) : connections.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-black">
                My Connections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <UserCard
                    key={connection._id}
                    user={connection}
                    isConnection={true}
                    onRemove={handleRemoveConnection}
                  />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="py-4 text-center">
                {isFetchingNextPage && (
                  <p className="text-gray-600">Loading more connections...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-xl font-semibold mb-2 text-black">
                No Connections Yet
              </h3>
              <p className="text-gray-600">
                Start connecting with people to grow your network!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Network;
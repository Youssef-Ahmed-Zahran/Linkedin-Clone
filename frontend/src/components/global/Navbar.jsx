import { Link } from "react-router-dom";
import { Bell, Home, LogOut, User, Users } from "lucide-react";

// React Query
import { useCurrentUser, useLogoutUser } from "../../store/auth";
import { useGetUserNotifications } from "../../store/notifications.js";
import { useGetConnectionRequests } from "../../store/connectionRequest.js";

function Navbar() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: logoutUser } = useLogoutUser();

  const { data: notifications } = useGetUserNotifications(currentUser?._id);
  const { data: connectionRequests } = useGetConnectionRequests(
    currentUser?._id
  );

  const unreadNotificationCount =
    notifications?.filter((notif) => !notif.read).length || 0;

  const unreadConnectionRequestsCount = connectionRequests?.data?.length || 0;

  const formatCount = (count) => (count > 99 ? "99+" : count);

  const handleLogout = () => {
    // ✨ Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (confirmed) {
      logoutUser();
    }
  };

  return (
    <nav className="bg-[#FFFFFF] shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img
                className="h-8 rounded"
                src="/small-logo.png"
                alt="LinkedIn"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {currentUser ? (
              <>
                <Link
                  to={"/"}
                  className="text-neutral flex flex-col items-center"
                >
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </Link>
                <Link
                  to="/network"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Users size={20} />
                  <span className="text-xs hidden md:block">My Network</span>
                  {unreadConnectionRequestsCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {formatCount(unreadConnectionRequestsCount)}
                    </span>
                  )}
                </Link>
                <Link
                  to="/notifications"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {formatCount(unreadNotificationCount)}
                    </span>
                  )}
                </Link>
                <Link
                  to={`/profile/${currentUser.username}`}
                  className="text-neutral flex flex-col items-center"
                >
                  <User size={20} />
                  <span className="text-xs hidden md:block">Me</span>
                </Link>
                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn bg-[#ffffff] border-none text-black"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary bg-[#0A66C2] border-none"
                >
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;

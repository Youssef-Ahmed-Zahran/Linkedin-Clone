import { Link } from "react-router-dom";
import { Home, UserPlus, Bell } from "lucide-react";

export default function Sidebar({ user }) {
  return (
    <div className="bg-[#FFFFFF] rounded-lg shadow">
      <div className="p-4 text-center">
        <div
          className="h-16 rounded-t-lg bg-cover bg-center"
          style={{
            backgroundImage: `url("${user.bannerImg || "/banner.png"}")`,
          }}
        />
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.profilePicture || "/avatar.png"}
            alt={user.name}
            className="w-20 h-20 rounded-full mx-auto -mt-10"
          />
          <h2 className="text-xl text-black font-semibold mt-2">{user.name}</h2>
        </Link>
        <p className="text-[#5E5E5E]">{user.headline}</p>
        <p className="text-[#5E5E5E] text-xs">
          {user.connections?.length || 0} connections
        </p>
      </div>
      <div className="border-t border-[#F3F2EF] p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="flex items-center py-2 px-4 rounded-md text-black hover:bg-[#0A66C2] hover:text-white transition-colors"
              >
                <Home className="mr-2" size={20} /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/network"
                className="flex items-center py-2 px-4 rounded-md text-black hover:bg-[#0A66C2] hover:text-white transition-colors"
              >
                <UserPlus className="mr-2" size={20} /> My Network
              </Link>
            </li>
            <li>
              <Link
                to="/notifications"
                className="flex items-center py-2 px-4 rounded-md text-black hover:bg-[#0A66C2] hover:text-white transition-colors"
              >
                <Bell className="mr-2" size={20} /> Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t text-black border-[#F3F2EF] p-4">
        <Link
          to={`/profile/${user.username}`}
          className="text-sm font-semibold"
        >
          Visit your profile
        </Link>
      </div>
    </div>
  );
}

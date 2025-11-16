import { Users } from "lucide-react";
import { PostCreation } from "../../components/home/posts/post-creation/PostCreation";
import Sidebar from "../../components/home/sidebar/Sidebar";
import SuggestedUser from "../../components/home/suggested-user/SuggestedUser";
import Post from "../../components/home/posts/Post";

// React Query
import { useCurrentUser } from "../../store/auth";
import { useGetFeedPosts } from "../../store/posts";
import { useGetSuggestedConnections } from "../../store/users";

const HomePage = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: suggestedUsers } = useGetSuggestedConnections();
  const { data: posts } = useGetFeedPosts();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={currentUser} />
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <PostCreation user={currentUser} />

        {posts?.map((post) => (
          <Post key={post._id} post={post} />
        ))}

        {posts?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <Users size={64} className="mx-auto text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              No Posts Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with others to start seeing posts in your feed!
            </p>
          </div>
        )}
      </div>

      {suggestedUsers?.length > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">People you may know</h2>
            {suggestedUsers?.map((user) => (
              <SuggestedUser key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

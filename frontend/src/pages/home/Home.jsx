import { Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { PostCreation } from "../../components/post/post-creation/PostCreation";
import Sidebar from "../../components/global/Sidebar";
import SuggestedUser from "../../components/home/suggested-user/SuggestedUser";
import Post from "../../components/post/Post";

// React Query
import { useCurrentUser } from "../../store/auth";
import { useGetFeedPosts } from "../../store/posts";
import { useGetSuggestedUsers } from "../../store/users";

const HomePage = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: posts } = useGetFeedPosts();

  const {
    data: suggestedUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetSuggestedUsers(currentUser?._id);

  const observerTarget = useRef(null);

  // Flatten the pages array to get all users
  const suggestedUsers =
    suggestedUsersData?.pages.flatMap((page) => page.users) || [];

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

      {(suggestedUsers.length > 0 || isLoading) && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-[#FFFFFF] rounded-lg shadow sticky top-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-black">People you may know</h2>
            </div>

            {/* Scrollable container - reduced height to show only 5 users */}
            <div className="overflow-y-auto max-h-[380px] p-4">
              {/* Loading state for initial load */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                </div>
              )}

              {/* Render suggested users */}
              {suggestedUsers.map((user) => (
                <SuggestedUser key={user._id} user={user} />
              ))}

              {/* Intersection observer target */}
              <div ref={observerTarget} className="h-4" />

              {/* Loading state for fetching next page */}
              {isFetchingNextPage && (
                <div className="text-center py-2">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                </div>
              )}

              {/* No more users message */}
              {!hasNextPage && suggestedUsers.length > 0 && !isLoading && (
                <p className="text-center text-sm text-gray-500 py-2">
                  No more suggestions
                </p>
              )}

              {/* No users found */}
              {!isLoading && suggestedUsers.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                  No suggestions available
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

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

function HomePage() {
  const { data: currentUser } = useCurrentUser();

  // Posts infinite query
  const {
    data: postsData,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
    isLoading: isLoadingPosts,
  } = useGetFeedPosts();

  // Suggested users infinite query
  const {
    data: suggestedUsersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
    isFetchingNextPage: isFetchingNextUsers,
    isLoading: isLoadingUsers,
  } = useGetSuggestedUsers(currentUser?._id);

  const postsObserverTarget = useRef(null);
  const usersObserverTarget = useRef(null);

  // Flatten posts pages
  const posts = postsData?.pages.flatMap((page) => page.posts) || [];

  // Flatten suggested users pages
  const suggestedUsers =
    suggestedUsersData?.pages.flatMap((page) => page.users) || [];

  // Intersection Observer for posts infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPosts && !isFetchingNextPosts) {
          fetchNextPosts();
        }
      },
      { threshold: 0.5 }
    );

    if (postsObserverTarget.current) {
      observer.observe(postsObserverTarget.current);
    }

    return () => {
      if (postsObserverTarget.current) {
        observer.unobserve(postsObserverTarget.current);
      }
    };
  }, [hasNextPosts, isFetchingNextPosts, fetchNextPosts]);

  // Intersection Observer for suggested users infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextUsers && !isFetchingNextUsers) {
          fetchNextUsers();
        }
      },
      { threshold: 0.5 }
    );

    if (usersObserverTarget.current) {
      observer.observe(usersObserverTarget.current);
    }

    return () => {
      if (usersObserverTarget.current) {
        observer.unobserve(usersObserverTarget.current);
      }
    };
  }, [hasNextUsers, isFetchingNextUsers, fetchNextUsers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={currentUser} />
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <PostCreation user={currentUser} />

        {/* Loading state for initial posts load */}
        {isLoadingPosts && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Render posts */}
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}

        {/* Intersection observer target for posts */}
        {!isLoadingPosts && posts.length > 0 && (
          <div ref={postsObserverTarget} className="h-4" />
        )}

        {/* Loading state for fetching next page of posts */}
        {isFetchingNextPosts && (
          <div className="bg-white rounded-lg shadow p-6 text-center mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading more posts...</p>
          </div>
        )}

        {/* No more posts message */}
        {!hasNextPosts && posts.length > 0 && !isLoadingPosts && (
          <div className="bg-white rounded-lg shadow p-6 text-center mb-4">
            <p className="text-gray-600">You've reached the end! 🎉</p>
          </div>
        )}

        {/* No posts message */}
        {!isLoadingPosts && posts.length === 0 && (
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

      {(suggestedUsers.length > 0 || isLoadingUsers) && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-[#FFFFFF] rounded-lg shadow sticky top-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-black">People you may know</h2>
            </div>

            {/* Scrollable container - reduced height to show only 5 users */}
            <div className="overflow-y-auto max-h-[380px] p-4">
              {/* Loading state for initial load */}
              {isLoadingUsers && (
                <div className="text-center py-4">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                </div>
              )}

              {/* Render suggested users */}
              {suggestedUsers.map((user) => (
                <SuggestedUser key={user._id} user={user} />
              ))}

              {/* Intersection observer target */}
              <div ref={usersObserverTarget} className="h-4" />

              {/* Loading state for fetching next page */}
              {isFetchingNextUsers && (
                <div className="text-center py-2">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                </div>
              )}

              {/* No more users message */}
              {!hasNextUsers &&
                suggestedUsers.length > 0 &&
                !isLoadingUsers && (
                  <p className="text-center text-sm text-gray-500 py-2">
                    No more suggestions
                  </p>
                )}

              {/* No users found */}
              {!isLoadingUsers && suggestedUsers.length === 0 && (
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
}

export default HomePage;

import { useParams } from "react-router-dom";
import Sidebar from "../../components/global/Sidebar";
import Post from "../../components/post/Post";
import { useCurrentUser } from "../../store/auth";
import { useGetPostById } from "../../store/posts";

function SinglePost() {
  const { postId } = useParams();
  const { data: currentUser } = useCurrentUser();

  const { data: post, isLoading } = useGetPostById(postId);

  if (isLoading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={currentUser} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <Post post={post} />
      </div>
    </div>
  );
}
export default SinglePost;

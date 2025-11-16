import { useState } from "react";
import toast from "react-hot-toast";
import { Image, Loader } from "lucide-react";

// React Query
import { useCreatePost } from "../../../../store/posts";

export const PostCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { mutate: createPost, isPending } = useCreatePost();

  const handlePostCreation = async () => {
    // Validate that post has content or image
    if (!content.trim() && !image) {
      toast.error("Please add some content or an image to your post");
      return;
    }

    try {
      const postData = { content };
      if (image) postData.image = await readFileAsDataURL(image);

      createPost(postData, {
        onSuccess: () => {
          resetForm();
          toast.success("Post created successfully");
        },
        onError: (err) => {
          toast.error(err.response.data.message || "Failed to create post");
        },
      });
    } catch (error) {
      console.error("Error in handlePostCreation:", error);
    }
  };

  const resetForm = () => {
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      readFileAsDataURL(file).then(setImagePreview);
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-lg shadow mb-4 p-4">
      <div className="flex space-x-3">
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="size-12 rounded-full"
        />
        <textarea
          placeholder="What do you want to talk about?"
          className="w-full p-3 rounded-lg text-black bg-[#F3F2EF] hover:bg-neutral-300 focus:bg-neutral-300 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {imagePreview && (
        <div className="mt-4">
          <img
            src={imagePreview}
            alt="Selected"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <label className="flex items-center text-[#5E5E5E] hover:text-gray-950 transition-colors duration-200 cursor-pointer">
            <Image size={20} className="mr-2" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <button
          className="bg-[#0A66C2] text-white rounded-lg px-4 py-2 hover:bg-blue-900 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePostCreation}
          disabled={isPending || (!content.trim() && !image)}
        >
          {isPending ? <Loader className="size-5 animate-spin" /> : "Share"}
        </button>
      </div>
    </div>
  );
};

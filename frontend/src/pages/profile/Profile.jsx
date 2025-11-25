import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileHeader from "../../components/profile/ProfileHeader";

// React Query
import { useCurrentUser } from "../../store/auth";
import { useGetPublicProfile, useUpdateCurrentUser } from "../../store/users";

const Profile = () => {
  const { username } = useParams();
  //current user
  const { data: currentUser, isLoading } = useCurrentUser();
  // user profile
  const { data: userProfile, isLoading: isUserProfileLoading } =
    useGetPublicProfile(username, {
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to get user profile"
        );
      },
    });
  // update profile
  const { mutate: updateProfile } = useUpdateCurrentUser({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  if (isLoading || isUserProfileLoading) return null;

  const isOwnProfile = currentUser.username === userProfile.username;
  const userData = isOwnProfile ? currentUser : userProfile;

  const handleSave = (updatedData) => {
    updateProfile(updatedData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      {/* <AboutSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <ExperienceSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <EducationSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <SkillsSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      /> */}
    </div>
  );
};

export default Profile;

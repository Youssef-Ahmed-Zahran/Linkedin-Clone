import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileHeader from "../../components/profile/ProfileHeader";
import AboutSection from "../../components/profile/AboutSection";
import ExperienceSection from "../../components/profile/ExperienceSection";
import EducationSection from "../../components/profile/EducationSection";
import SkillsSection from "../../components/profile/SkillsSection";

// React Query
import { useCurrentUser } from "../../store/auth";
import { useGetPublicProfile, useUpdateUserProfile } from "../../store/users";
import { Loader2 } from "lucide-react";

function Profile() {
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
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateUserProfile();

  if (isLoading || isUserProfileLoading) return null;

  const isOwnProfile = currentUser.username === userProfile.username;
  const userData = isOwnProfile ? currentUser : userProfile;

  const handleSave = (updatedData) => {
    updateProfile(updatedData, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to update profile"
        );
      },
    });
  };

  return (
    <>
      {/* LOADER – appears when ANYTHING is saving */}
      {isUpdating && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-9999">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#0A66C2] animate-spin mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-800">
              Updating profile...
            </p>
            <p className="text-gray-600 mt-2">Please wait</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        <ProfileHeader
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
          isSaving={isUpdating}
        />
        <AboutSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
          isSaving={isUpdating}
        />
        <ExperienceSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
          isSaving={isUpdating}
        />
        <EducationSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
          isSaving={isUpdating}
        />
        <SkillsSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
          isSaving={isUpdating}
        />
      </div>
    </>
  );
}

export default Profile;

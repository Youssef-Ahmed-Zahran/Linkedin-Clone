import { useState } from "react";
import { Loader2 } from "lucide-react";

const AboutSection = ({ userData, isOwnProfile, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState(userData.about || "");

  // save user data
  const handleSave = () => {
    onSave({ about });
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">About</h2>
      {isOwnProfile && (
        <>
          {isEditing ? (
            <>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-2 border rounded text-black"
                rows="4"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-[#0A66C2] text-white py-2 px-4 rounded hover:bg-blue-900 
								transition duration-300 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 
								transition duration-300 cursor-pointer"
                  onClick={() => {
                    setAbout(userData.about || "");
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-black">{userData.about}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-[#0A66C2] hover:text-blue-900 transition duration-300 cursor-pointer"
              >
                Edit
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AboutSection;

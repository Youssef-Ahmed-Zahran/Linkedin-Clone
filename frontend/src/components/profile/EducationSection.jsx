import { useState } from "react";
import { Loader2, School, X } from "lucide-react";

const EducationSection = ({ userData, isOwnProfile, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [educations, setEducations] = useState(userData.education || []);
  const [newEducation, setNewEducation] = useState({
    school: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
  });

  const handleAddEducation = () => {
    if (
      newEducation.school &&
      newEducation.fieldOfStudy &&
      newEducation.startYear
    ) {
      setEducations([...educations, newEducation]);
      setNewEducation({
        school: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
      });
    }
  };

  const handleDeleteEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ education: educations });
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Education</h2>
      {educations.map((edu, index) => (
        <div key={index} className="mb-4 flex justify-between items-start">
          <div className="flex items-start">
            <School size={20} className="mr-2 mt-1 text-black" />
            <div>
              <p className="font-semibold text-black">{edu.school}</p>
              <h3 className="text-gray-600">{edu.fieldOfStudy}</h3>
              <p className="text-gray-500 text-sm">
                {edu.startYear} - {edu.endYear || "Present"}
              </p>
            </div>
          </div>
          {isEditing && (
            <button
              onClick={() => handleDeleteEducation(index)}
              className="text-red-500 cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ))}
      {isEditing && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="School"
            value={newEducation.school}
            onChange={(e) =>
              setNewEducation({ ...newEducation, school: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />
          <input
            type="text"
            placeholder="Field of Study"
            value={newEducation.fieldOfStudy}
            onChange={(e) =>
              setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />
          <input
            type="number"
            placeholder="Start Year"
            value={newEducation.startYear}
            onChange={(e) =>
              setNewEducation({ ...newEducation, startYear: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />
          <input
            type="number"
            placeholder="End Year"
            value={newEducation.endYear}
            onChange={(e) =>
              setNewEducation({ ...newEducation, endYear: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />
          <button
            onClick={handleAddEducation}
            className="bg-[#0A66C2] text-white py-2 px-4 rounded hover:bg-blue-900 transition duration-300 cursor-pointer"
            disabled={isSaving}
          >
            Add Education
          </button>
        </div>
      )}

      {isOwnProfile && (
        <>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSave}
                className="mt-4 bg-[#0A66C2] text-white py-2 px-4 rounded hover:bg-blue-900
							transition duration-300 cursor-pointer"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-[#0A66C2] hover:text-shadow-blue-900 transition duration-300 cursor-pointer"
            >
              Edit Education
            </button>
          )}
        </>
      )}
    </div>
  );
};
export default EducationSection;

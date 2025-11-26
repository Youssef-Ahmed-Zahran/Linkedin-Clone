import { useState } from "react";
import { Briefcase, Loader2, X } from "lucide-react";
import { formatDate } from "../../utils/dateUtils.js";

const ExperienceSection = ({ userData, isOwnProfile, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [experiences, setExperiences] = useState(userData.experience || []);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    currentlyWorking: false,
  });

  const handleAddExperience = () => {
    if (
      !newExperience.title ||
      !newExperience.company ||
      !newExperience.startDate
    )
      return;

    setExperiences([...experiences, newExperience]);

    setNewExperience({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      currentlyWorking: false,
    });
  };

  const handleDeleteExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ experience: experiences });
    setIsEditing(false);
  };

  const handleCurrentlyWorkingChange = (e) => {
    setNewExperience({
      ...newExperience,
      currentlyWorking: e.target.checked,
      endDate: e.target.checked ? "" : newExperience.endDate,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Experience</h2>

      {experiences.map((exp, index) => (
        <div key={index} className="mb-4 flex justify-between items-start">
          <div className="flex items-start">
            <Briefcase size={20} className="mr-2 mt-1 text-black" />
            <div>
              <h3 className="font-semibold text-black">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-gray-500 text-sm">
                {formatDate(exp.startDate)} -{" "}
                {exp.currentlyWorking
                  ? "Present"
                  : exp.endDate
                  ? formatDate(exp.endDate)
                  : "Present"}
              </p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          </div>

          {isEditing && (
            <button
              onClick={() => handleDeleteExperience(index)}
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
            placeholder="Title"
            value={newExperience.title}
            onChange={(e) =>
              setNewExperience({ ...newExperience, title: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />

          <input
            type="text"
            placeholder="Company"
            value={newExperience.company}
            onChange={(e) =>
              setNewExperience({ ...newExperience, company: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />

          <input
            type="date"
            placeholder="Start Date"
            value={newExperience.startDate}
            onChange={(e) =>
              setNewExperience({ ...newExperience, startDate: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={newExperience.currentlyWorking}
              onChange={handleCurrentlyWorkingChange}
              className="mr-2"
            />
            <label className="text-black">I currently work here</label>
          </div>

          {!newExperience.currentlyWorking && (
            <input
              type="date"
              placeholder="End Date"
              value={newExperience.endDate}
              onChange={(e) =>
                setNewExperience({ ...newExperience, endDate: e.target.value })
              }
              className="w-full p-2 border rounded mb-2 text-black"
            />
          )}

          <textarea
            placeholder="Description"
            value={newExperience.description}
            onChange={(e) =>
              setNewExperience({
                ...newExperience,
                description: e.target.value,
              })
            }
            className="w-full p-2 border rounded mb-2 text-black"
          />

          <button
            onClick={handleAddExperience}
            className="bg-[#0A66C2] text-white py-2 px-4 rounded hover:bg-blue-900 transition cursor-pointer"
          >
            Add Experience
          </button>
        </div>
      )}

      {isOwnProfile && (
        <>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSave}
                className="mt-4 bg-[#0A66C2] text-white py-2 px-4 rounded hover:bg-blue-900 transition cursor-pointer"
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
              className="mt-4 text-[#0A66C2] hover:text-blue-900 transition cursor-pointer"
            >
              Edit Experiences
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ExperienceSection;

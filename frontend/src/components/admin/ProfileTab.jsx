import React from "react";
import { Camera } from "lucide-react";

const ProfileTab = ({
  profile,
  setProfile,
  profilePhotoInputRef,
  handleProfilePhotoChange,
  handleProfileSave,
  darkMode,
  cardClass,
  labelClass,
  inputClass
}) => {
  return (
    <div className={`${cardClass} rounded-2xl overflow-hidden`}>
      <div className="h-32 bg-gradient-to-r from-green-500 to-green-400" />
      <div className="px-8 pb-8 relative">
        <div className="relative -mt-12 mb-6 inline-block">
          <div
            className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-md ${darkMode
              ? "bg-gray-700 border-gray-800"
              : "bg-gray-200 border-white"
              }`}
          >
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => profilePhotoInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full shadow-md hover:bg-green-600"
          >
            <Camera size={14} />
          </button>
          <input
            type="file"
            ref={profilePhotoInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleProfilePhotoChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Position</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) =>
                  setProfile({ ...profile, role: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleProfileSave}
            className="bg-green-500 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg hover:bg-green-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;

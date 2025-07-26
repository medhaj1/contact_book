import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiLogOut, FiKey, FiArrowLeft } from "react-icons/fi";
import { MdEmail, MdPhone, MdPerson, MdLock } from "react-icons/md";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import {supabase} from "../supabaseClient";

const UserProfile = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: currentUser?.name,
    email: currentUser?.email || "No email provided",
    phone: currentUser?.user_metadata?.contact || currentUser?.phone || "Not provided",
    photo: currentUser?.user_metadata?.avatar_url || null,
    password: "dummy123",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirmNew: "",
  });

  // Update userData when currentUser changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          // Fetch user profile from user_profile table
          const { data: userProfile, error } = await supabase
            .from("user_profile")
            .select("*")
            .eq("u_id", currentUser.id)
            .single();

          if (error) {
            console.warn("Failed to fetch user profile from database:", error.message);
            // Fallback to auth metadata if database fetch fails
            setUserData({
              name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "User",
              email: currentUser?.email || "No email provided",
              phone: currentUser?.user_metadata?.contact || currentUser?.phone || "Not provided",
              photo: currentUser?.user_metadata?.image || null,
              password: "dummy123",
            });
          } else {
            // Use data from user_profile table
            setUserData({
              name: userProfile.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "User",
              email: userProfile.email || currentUser?.email || "No email provided",
              phone: userProfile.phone || currentUser?.user_metadata?.contact || "Not provided",
              photo: userProfile.image || currentUser?.user_metadata?.image || null,
              password: "dummy123",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback to auth metadata
          setUserData({
            name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "User",
            email: currentUser?.email || "No email provided",
            phone: currentUser?.user_metadata?.contact || currentUser?.phone || "Not provided",
            photo: currentUser?.user_metadata?.image || null,
            password: "dummy123",
          });
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  const userName = userData.name.replace(/\s+/g, "_") || "user";
  const folderPath = `users/${userName}`;

  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${userName}-${Date.now()}.${fileExt}`;
  const filePath = `${folderPath}/${uniqueFileName}`;

  try {
    // 1. Fetch old photo path from metadata (if exists)
    const oldUrl = currentUser?.user_metadata?.image;
    let oldPath = null;

    if (oldUrl) {
      const fullPath = new URL(oldUrl).pathname; // e.g. /storage/v1/object/public/user-images/users/Name/file.jpg
      oldPath = decodeURIComponent(fullPath.replace("/storage/v1/object/public/user-images/", ""));
    }

    // 2. Upload new image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw new Error("Upload failed: " + uploadError.message);

    // 3. Get public URL of uploaded image
    const { data: publicData } = supabase.storage
      .from("user-images")
      .getPublicUrl(filePath);

    const newPhotoUrl = publicData.publicUrl;

    // 4. Delete old image (if any)
    if (oldPath) {
      const { error: deleteError } = await supabase.storage
        .from("user-images")
        .remove([oldPath]);
      
      if (deleteError) {
        console.warn("Failed to delete old image:", deleteError.message);
      } else {
        console.log("Old image deleted:", oldPath);
      }
    }

    // 5. Update Supabase Auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {image: newPhotoUrl },
    });

    if (updateError) throw new Error("Failed to update metadata: " + updateError.message);

    // 6. Update user_profile table
    const { error: profileUpdateError } = await supabase
      .from("user_profile")
      .update({ image: newPhotoUrl })
      .eq("u_id", currentUser.id);

    if (profileUpdateError) {
      console.warn("Failed to update profile table:", profileUpdateError.message);
    }

    // 7. Update UI
    setUserData((prev) => ({ ...prev, photo: newPhotoUrl }));
    alert("Profile picture updated!");

  } catch (error) {
    console.error("Image upload error:", error.message);
    alert("Error updating profile picture.");
  }
};


  const handleEditToggle = async () => {
    if (isEditing) {
      // Save the profile changes to the database
      await handleSaveProfile();
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      // Update user_profile table in Supabase
      const { error: profileError } = await supabase
        .from("user_profile")
        .update({
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        })
        .eq("u_id", currentUser.id);

      if (profileError) {
        throw new Error("Failed to update profile: " + profileError.message);
      }

      // Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          contact: userData.phone,
          email: userData.email
        }
      });

      if (authError) {
        console.warn("Failed to update auth metadata:", authError.message);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error.message);
      alert("Error updating profile: " + error.message);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleResetPasswordClick = () => {
    setIsResettingPassword(true);
  };

  const handleCancelResetPassword = () => {
    setPasswords({ current: "", new: "", confirmNew: "" });
    setIsResettingPassword(false);
  };

  const handleSaveNewPassword = () => {
    if (passwords.current !== userData.password) {
      alert("Current password is incorrect.");
      return;
    }

    if (passwords.new !== passwords.confirmNew) {
      alert("New passwords do not match.");
      return;
    }

    setUserData({ ...userData, password: passwords.new });
    alert("Password changed successfully!");
    setPasswords({ current: "", new: "", confirmNew: "" });
    setIsResettingPassword(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-white flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-10 mx-auto my-4">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-3 text-sky-600 hover:text-sky-800 bg-transparent border-none cursor-pointer rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-sky-600 text-center flex-1">
            User Profile
          </h1>
          <div className="w-32"></div> {/* Spacer for perfect centering */}
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start justify-center max-w-4xl mx-auto">
          <div className="flex flex-col items-center min-w-72 flex-shrink-0">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <ProfileAvatar 
                name={userData.name}
                image={userData.photo}
                size="128px"
                textSize="3rem"
              />
              {isEditing && (
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              )}
            </label>
            <h2 className="text-2xl font-semibold mt-4 text-sky-600 text-center">
              {userData.name}
            </h2>
            <p className="text-gray-600 text-base my-1">{userData.email}</p>
          </div>

          <div className="flex flex-col gap-3 flex-1 min-w-96">
            <Detail label="Name" icon={<MdPerson />} isEditing={isEditing}>
              <input
                name="name"
                value={userData.name}
                onChange={handleChange}
                className={`w-full border border-gray-300 p-2 rounded-md text-base outline-none ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                }`}
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Email" icon={<MdEmail />} isEditing={isEditing}>
              <input
                name="email"
                value={userData.email}
                onChange={handleChange}
                className={`w-full border border-gray-300 p-2 rounded-md text-base outline-none ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                }`}
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Contact No" icon={<MdPhone />} isEditing={isEditing}>
              <input
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                className={`w-full border border-gray-300 p-2 rounded-md text-base outline-none ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                }`}
                disabled={!isEditing}
              />
            </Detail>

            {isResettingPassword && (
              <div className="mt-4 p-4 bg-sky-50 rounded-lg shadow-inner">
                <Detail label="Current Password" icon={<FiKey />} isEditing={true}>
                  <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordInputChange}
                    className="w-full border p-2 rounded-md"
                  />
                </Detail>
                <Detail label="New Password" icon={<FiKey />} isEditing={true}>
                  <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordInputChange}
                    className="w-full border p-2 rounded-md"
                  />
                </Detail>
                <Detail label="Confirm New Password" icon={<FiKey />} isEditing={true}>
                  <input
                    type="password"
                    name="confirmNew"
                    value={passwords.confirmNew}
                    onChange={handlePasswordInputChange}
                    className="w-full border p-2 rounded-md"
                  />
                </Detail>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={handleCancelResetPassword}
                    className="px-4 py-2 border border-red-400 text-red-600 rounded-lg hover:bg-red-100 transition-transform transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewPassword}
                    className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-lg shadow-md hover:scale-105 hover:from-sky-500 hover:to-blue-700 transition-transform"
                  >
                    Save Password
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none rounded-lg shadow-md cursor-pointer text-sm font-medium transition-transform duration-200 hover:scale-105"
              >
                <FiEdit2 />
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>

              <button
                onClick={handleResetPasswordClick}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none rounded-lg shadow-md cursor-pointer text-sm font-medium transition-transform duration-200 hover:scale-105"
              >
                <MdLock />
                Reset Password
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white border-none rounded-lg shadow-md cursor-pointer text-sm font-medium transition-transform duration-200 hover:scale-105"
              >
                <FiLogOut />
                Log Out
              </button>
            </div>
          </div>

          {/* Debug Section (Development Only) */}
          {process.env.NODE_ENV === 'development' && currentUser && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <details className="cursor-pointer">
                <summary className="text-sm font-medium text-gray-600 mb-2">
                  Debug: Raw User Data (Development Only)
                </summary>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(currentUser, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, icon, children, isEditing }) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-sky-600 flex items-center gap-2 mb-1">
      {icon} {label}
    </label>
    <div className="text-black">{children}</div>
  </div>
);

export default UserProfile;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2,FiLogOut,FiKey,FiArrowLeft} from "react-icons/fi";
import {MdEmail, MdPhone, MdPerson, MdLock} from "react-icons/md";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import {supabase} from "../supabaseClient";
import { getUserProfile, updateUserProfile, uploadUserAvatar } from "../services/userService";


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
          const result = await getUserProfile(currentUser.id);
          
          if (result.success) {
            // Use data from user_profile table
            const userProfile = result.data;
            setUserData({
              name: userProfile.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "User",
              email: userProfile.email || currentUser?.email || "No email provided",
              phone: userProfile.phone || currentUser?.user_metadata?.contact || "Not provided",
              photo: userProfile.avatar_url || currentUser?.user_metadata?.image || null,
              password: "dummy123",
            });
          } else {
            console.warn("Failed to fetch user profile:", result.error);
            // Fallback to auth metadata if database fetch fails
            setUserData({
              name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "User",
              email: currentUser?.email || "No email provided",
              phone: currentUser?.user_metadata?.contact || currentUser?.phone || "Not provided",
              photo: currentUser?.user_metadata?.image || null,
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

    try {
      const result = await uploadUserAvatar(currentUser.id, file);
      
      if (result.success) {
        setUserData((prev) => ({ ...prev, photo: result.avatarUrl }));
        alert("Profile picture updated!");
      } else {
        alert("Error updating profile picture: " + result.error);
      }
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
      const result = await updateUserProfile(currentUser.id, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      });

      if (result.success) {
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
      } else {
        alert("Error updating profile: " + result.error);
      }
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

  // Add form submission handlers for Enter key support
  // eslint-disable-next-line no-unused-vars
  const handleProfileFormSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleEditToggle(); // This will save the profile
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handlePasswordFormSubmit = (e) => {
    e.preventDefault();
    handleSaveNewPassword();
  };

  const handleResetPasswordClick = () => setIsResettingPassword(true);

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
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center font-inter p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-10 relative">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-4 text-sm flex items-center text-sky-600 dark:text-slate-500 hover:scale-105 hover:text-sky-800 dark:hover:text-slate-400 transition-transform transform"
        >
          <FiArrowLeft className="mr-1" />
          Back
        </button>

        {/* Title */}
        <h1 className="text-center text-3xl font-bold text-blue-800 dark:text-blue-300 mb-10">
          User Profile
        </h1>

        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Left: Avatar & Info */}
          <div className="flex flex-col items-center w-full md:w-1/3">
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
            <h2 className="text-2xl font-family font-bold mt-4 text-blue-800 dark:text-blue-300 text-center">
              {userData.name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">{userData.email}</p>
          </div>

          {/* Right: Fields */}
          <div className="w-full md:w-2/3 space-y-4">
            <Detail label="Name" icon={<MdPerson />} isEditing={isEditing}>
              <input
                name="name"
                value={userData.name}
                onChange={handleChange}
                className={`w-full border p-2 rounded-md dark:bg-slate-600 dark:text-white dark:border-slate-500 ${
                  isEditing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Email" icon={<MdEmail />} isEditing={isEditing}>
              <input
                name="email"
                value={userData.email}
                onChange={handleChange}
                className={`w-full border p-2 rounded-md dark:bg-slate-600 dark:text-white dark:border-slate-500 ${
                  isEditing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Contact No" icon={<MdPhone />} isEditing={isEditing}>
              <input
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                className={`w-full border p-2 rounded-md dark:bg-slate-600 dark:text-white dark:border-slate-500 ${
                  isEditing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!isEditing}
              />
            </Detail>

            {/* Password Reset Fields */}
            {isResettingPassword && (
              <form>
              <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-md shadow-inner">
                <Detail label="Current Password" icon={<FiKey />} isEditing={true}>
                  <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordInputChange}
                    className="w-full border p-2 mb-1 rounded-md dark:bg-slate-600 dark:text-white dark:border-slate-500"
                  />
                </Detail>
                <Detail label="New Password" icon={<FiKey />} isEditing={true}>
                  <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordInputChange}
                    className="w-full border p-2 mb-1 rounded-md dark:bg-slate-600 dark:text-white dark:border-slate-500"
                  />
                </Detail>
                <Detail label="Confirm New Password" icon={<FiKey />} isEditing={true}>
                  <input
                    type="password"
                    name="confirmNew"
                    value={passwords.confirmNew}
                    onChange={handlePasswordInputChange}
                    className="w-full border p-2 rounded-md dark:bg-slate-600 dark:text-white dark:border-slate-500"
                  />
                </Detail>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleCancelResetPassword}
                    className="flex items-center gap-2 px-4 py-2 border border-red-400 text-red-600 dark:hover:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-transform transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewPassword}
                    className="btn"
                  >
                    Save Password
                  </button>
                </div>
                </div>
              </form>
              
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 flex-wrap">
              <button
                onClick={handleEditToggle}
                className="btn"
              >
                <FiEdit2 />
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>

              <button
                onClick={handleResetPasswordClick}
                className="btn">
                <MdLock />
                Reset Password
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-400 text-red-600 dark:hover:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-transform transform hover:scale-105"
              >
                <FiLogOut />
                Log Out
              </button>
            </div>
          </div>
          {/* Debug Section (Development Only) */}
          {process.env.NODE_ENV === 'development' && currentUser && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-slate-600 rounded-lg">
              <details className="cursor-pointer">
                <summary className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">
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

const Detail = ({ label, icon, children, }) => (
  <div>
    <label className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-1">
      {icon} {label}
    </label>
    {children}
  </div>
);

export default UserProfile;

import React, { useState } from "react";
import { FiEdit2, FiLogOut, FiKey } from "react-icons/fi";
import { MdEmail, MdLocationOn, MdPhone, MdPerson, MdLock } from "react-icons/md";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: "Veena Gauns",
    email: "veena@gmail.com",
    phone: "7350678596",
    address: "Goa, India",
    photo: null,
    password: "dummy123",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirmNew: "",
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, photo: URL.createObjectURL(file) });
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

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
    alert("Logged out");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden p-10">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex flex-col items-center">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-md border-4 border-white hover:opacity-80">
                {userData.photo ? (
                  <img
                    src={userData.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-sky-100 text-sky-600">
                    {userData.name.charAt(0)}
                  </div>
                )}
              </div>
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
            <h2 className="text-2xl font-semibold mt-4 text-sky-600">
              {userData.name}
            </h2>
            <p className="text-gray-600">{userData.email}</p>
            <p className="text-gray-500">{userData.address}</p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-2/3">
            <Detail label="Name" icon={<MdPerson />} isEditing={isEditing}>
              <input
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Email" icon={<MdEmail />} isEditing={isEditing}>
              <input
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Contact No" icon={<MdPhone />} isEditing={isEditing}>
              <input
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                disabled={!isEditing}
              />
            </Detail>

            <Detail label="Address" icon={<MdLocationOn />} isEditing={isEditing}>
              <input
                name="address"
                value={userData.address}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r  from-sky-400 to-blue-600 text-white rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 hover:from-sky-500 hover:to-blue-700"
              >
                <FiEdit2 />
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>

              <button
                onClick={handleResetPasswordClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 hover:from-sky-500 hover:to-blue-700"
              >
                <MdLock />
                Reset Password
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, icon, children, isEditing }) => (
  <div>
    <label className="text-sm font-medium text-sky-600 flex items-center gap-2 mb-1">
      {icon} {label}
    </label>
    <div className="text-black">{children}</div>
  </div>
);

export default UserProfile;

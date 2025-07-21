import React from 'react';

const ProfileAvatar = ({ name, image }) => {
  const initial = name?.charAt(0).toUpperCase() || '?';

  return image ? (
    <img
      src={image}
      alt="profile"
      className="w-24 h-24 rounded-full object-cover border"
    />
  ) : (
    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
      {initial}
    </div>
  );
};

export default ProfileAvatar;

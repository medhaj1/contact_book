import React from 'react';

const ProfileAvatar = ({ name, image, size = "128px", textSize = "3rem" }) => {
  const initial = name?.charAt(0).toUpperCase() || '?';
  
  // Convert size prop to appropriate Tailwind class if needed
  const getSizeClass = (size) => {
    // Default size mapping
    const sizeMap = {
      "128px": "w-32 h-32",
      "64px": "w-16 h-16",
      "48px": "w-12 h-12",
      "40px": "w-10 h-10",
      "32px": "w-8 h-8"
    };
    
    return sizeMap[size] || "w-32 h-32"; // Default to w-32 h-32 if not found
  };
  
  // Get text size class
  const getTextSizeClass = (textSize) => {
    const textSizeMap = {
      "3rem": "text-5xl",
      "2rem": "text-4xl",
      "1.5rem": "text-3xl",
      "1rem": "text-xl"
    };
    
    return textSizeMap[textSize] || "text-5xl";
  };
  
  const sizeClass = getSizeClass(size);
  const textSizeClass = getTextSizeClass(textSize);

  return image ? (
    <img
      src={image}
      alt="profile"
      className={`${sizeClass} rounded-full object-cover shadow-lg border-4 border-white`}
    />
  ) : (
    <div className={`${sizeClass} rounded-full flex items-center justify-center bg-blue-200 dark:bg-indigo-200 text-blue-800 dark:text-indigo-800 ${textSizeClass} font-bold shadow-lg border-4 border-white hover:bg-blue-100 dark:hover:bg-indigo-100 transition-colors duration-200`}>
      {initial}
    </div>
  );
};

export default ProfileAvatar;
import React, { useEffect, useState } from 'react';
import { getFavouritesByUser, addFavourite, removeFavourite } from '../services/favouriteService';

export default function Favourite({ userId, contactId }) {
  const [isFavourite, setIsFavourite] = useState(false);

  // Fetch favourite state on mount
  useEffect(() => {
    const fetchFavouriteStatus = async () => {
      const favourites = await getFavouritesByUser(userId);
      setIsFavourite(favourites.includes(contactId));
    };
    if (userId && contactId) {
      fetchFavouriteStatus();
    }
  }, [userId, contactId]);

  // Toggle favourite
  const handleToggleFavourite = async () => {
    if (isFavourite) {
      await removeFavourite(userId, contactId);
    } else {
      await addFavourite(userId, contactId);
    }
    setIsFavourite(prev => !prev);
  };

  return (
    <button
      onClick={handleToggleFavourite}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isFavourite ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'
      }`}
      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
    >
      {isFavourite ? '★' : '☆'}
    </button>
  );
} 



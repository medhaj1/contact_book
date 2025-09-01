import React from 'react';
import { Trash2, Star, StarOff, Download, X } from 'lucide-react';

const BulkActionsBar = ({
  selectedContacts = [],
  onBulkDelete,
  onBulkAddFavourite,
  onBulkRemoveFavourite,
  onBulkExport,
  onClearSelection,
  contacts = []
}) => {
  const selectedCount = selectedContacts.length;
  
  if (selectedCount === 0) {
    return null;
  }

  // Check if all selected contacts are favourites
  const selectedContactObjects = contacts.filter(c => selectedContacts.includes(c.contact_id));
  const allAreFavourites = selectedContactObjects.every(c => c.is_favourite);
  const someAreFavourites = selectedContactObjects.some(c => c.is_favourite);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 z-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedCount} contact{selectedCount > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClearSelection}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 border-l dark:border-gray-600 pl-4">
        {/* Favourite Actions */}
        {!allAreFavourites && (
          <button
            onClick={onBulkAddFavourite}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            title="Add to favourites"
          >
            <Star size={16} />
            <span className="text-sm">Add to Favourites</span>
          </button>
        )}
        
        {someAreFavourites && (
          <button
            onClick={onBulkRemoveFavourite}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Remove from favourites"
          >
            <StarOff size={16} />
            <span className="text-sm">Remove Favourites</span>
          </button>
        )}

        {/* Export Actions */}
        <div className="relative group">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title="Export selected contacts"
          >
            <Download size={16} />
            <span className="text-sm">Export</span>
          </button>
          
          {/* Export dropdown */}
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[120px]">
            <button
              onClick={() => onBulkExport('csv')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
            >
              Export as CSV
            </button>
            <button
              onClick={() => onBulkExport('vcf')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-b-lg"
            >
              Export as VCF
            </button>
          </div>
        </div>

        {/* Delete Action */}
        <button
          onClick={onBulkDelete}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          title="Delete selected contacts"
        >
          <Trash2 size={16} />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;

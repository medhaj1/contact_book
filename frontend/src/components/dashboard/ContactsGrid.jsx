import React from 'react';
import { Star, Edit2, Trash2, Mail, Phone, Check } from 'lucide-react';
import { useFormat } from '../settings/FormatContext';

const ContactsGrid = ({
  contacts,
  toggleFavourite,
  handleEditContact,
  handleDeleteContact,
  renderCategoryBadges,
  // Bulk selection props
  selectedContacts = [],
  onContactSelect,
  selectionMode = false
}) => {
  const { formatContactName } = useFormat();
  const safeString = (val) => (val ? String(val) : "");

  const handleContactClick = (contact) => {
    if (selectionMode && onContactSelect) {
      onContactSelect(contact.contact_id);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {contacts.map((c) => {
        const isFav = c.is_favourite || false;
        const isSelected = selectedContacts.includes(c.contact_id);
        
        return (
          <div
            key={c.contact_id}
            className={`bg-white dark:text-gray-300 dark:bg-[#161b22] p-6 rounded-2xl border dark:border-[#30363d] hover:shadow-lg scale-100 hover:scale-105 transition transition-transform duration-200 space-y-3 cursor-pointer ${
              selectionMode 
                ? isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : ''
                : ''
            }`}
            onClick={() => handleContactClick(c)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Selection checkbox */}
                {selectionMode && (
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <Check size={12} />}
                  </div>
                )}
                
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex justify-center items-center font-bold overflow-hidden">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={formatContactName(c)} className="w-full h-full object-cover" />
                  ) : (
                    safeString(formatContactName(c)).charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{formatContactName(c) || "Unnamed Contact"}</h3>
                  {renderCategoryBadges(c)}
                </div>
              </div>
              
              {!selectionMode && (
                <button onClick={(e) => { e.stopPropagation(); toggleFavourite(c.contact_id); }}>
                  <Star size={18} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
              <Mail size={14} /> {c.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
              <Phone size={14} /> {c.phone}
            </div>
            
            {!selectionMode && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditContact(c); }}
                  className="p-2 bg-blue-50 dark:bg-indigo-600/50 text-blue-600 dark:text-indigo-200 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteContact(c.contact_id); }}
                  className="p-2 bg-red-50 dark:bg-red-600/50 text-red-600 rounded-lg dark:text-red-200 hover:bg-red-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ContactsGrid;

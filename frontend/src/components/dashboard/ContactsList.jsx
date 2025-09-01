import React from 'react';
import { Star, Edit2, Trash2, Mail, Phone, Check } from 'lucide-react';
import { useFormat } from '../settings/FormatContext';

const ContactsList = ({
  contacts,
  onToggleFavourite,
  onEditContact,
  onDeleteContact,
  renderCategoryBadges,
  // Bulk selection props
  selectedContacts = [],
  onContactSelect,
  selectionMode = false,
  onToggleSelectionMode
}) => {

  const { formatContactName } = useFormat();

  const safeString = (val) => (val ? String(val) : "");

  const handleContactClick = (contact) => {
    if (selectionMode && onContactSelect) {
      onContactSelect(contact.contact_id);
    }
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-lg shadow overflow-hidden">
      {contacts.map((c) => {
        const isFav = c.is_favourite || false;
        const isSelected = selectedContacts.includes(c.contact_id);
        
        return (
          <div
            key={c.contact_id}
            className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${
              selectionMode 
                ? isSelected 
                  ? 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30' 
                  : 'hover:bg-blue-50 dark:hover:bg-gray-800/40'
                : 'hover:bg-blue-50 dark:hover:bg-gray-800/40'
            } even:bg-slate-50 dark:even:bg-[#30363d]/10`}
            onClick={() => handleContactClick(c)}
          >
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
              
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex items-center justify-center font-bold overflow-hidden">
                {c.photo_url ? (
                  <img src={c.photo_url} alt={formatContactName(c)} className="w-full h-full object-cover" />
                ) : (
                  safeString(formatContactName(c)).charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-200">{formatContactName(c)}</div>
                {renderCategoryBadges(c)}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 pt-1">
                  <Mail size={14} /> {c.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                  <Phone size={14} /> {c.phone}
                </div>
              </div>
            </div>
            
            {!selectionMode && (
              <div className="flex gap-1 sm:gap-2 items-center">
                <button onClick={(e) => { e.stopPropagation(); onToggleFavourite(c.contact_id); }}>
                  <Star size={16} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEditContact(c); }}
                  className="p-1.5 sm:p-2 rounded-full bg-blue-50 dark:bg-indigo-800/70 text-blue-600 dark:text-indigo-100 hover:bg-blue-100 dark:hover:bg-indigo-700"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteContact(c.contact_id); }}
                  className="p-1.5 sm:p-2 rounded-full bg-red-50 dark:bg-red-800/40 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
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

export default ContactsList;

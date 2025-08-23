import React from 'react';
import { Star, Edit2, Trash2, Mail, Phone } from 'lucide-react';

const ContactsGrid = ({
  contacts,
  toggleFavourite,
  handleEditContact,
  handleDeleteContact,
  renderCategoryBadges
}) => {
  const safeString = (val) => (val ? String(val) : "");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {contacts.map((c) => {
        const isFav = c.is_favourite || false;
        return (
          <div
            key={c.contact_id}
            className="bg-white dark:text-gray-300 dark:bg-[#161b22] p-6 rounded-2xl border dark:border-[#30363d] hover:shadow-lg scale-100 hover:scale-105 transition transition-transform duration-200 space-y-3 "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex justify-center items-center font-bold overflow-hidden">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    safeString(c.name).charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  {renderCategoryBadges(c)}
                </div>
              </div>
              <button onClick={() => toggleFavourite(c.contact_id)}>
                <Star size={18} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
              <Mail size={14} /> {c.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
              <Phone size={14} /> {c.phone}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleEditContact(c)}
                className="p-2 bg-blue-50 dark:bg-indigo-600/50 text-blue-600 dark:text-indigo-200 rounded-lg hover:bg-blue-100"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDeleteContact(c.contact_id)}
                className="p-2 bg-red-50 dark:bg-red-600/50 text-red-600 rounded-lg dark:text-red-200 hover:bg-red-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactsGrid;

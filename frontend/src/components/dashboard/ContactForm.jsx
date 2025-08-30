import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { NoSymbolIcon } from '@heroicons/react/24/solid';
import { useBlockedContacts } from './BlockedContactsContext';
import { addContact, updateContact } from '../../services/contactService';
import { useFormat } from '../settings/FormatContext';
import { toast } from 'react-toastify';

const ContactForm = ({ contact, categories = [], onSave, onCancel, userId }) => {
  const { nameFormat, dateFormat, formatContactName, formatDate } = useFormat();

  // Helper functions for formatting
  function formatName(contact) {
    if (!contact) return "";
    return formatContactName(contact);
  }

  // Initialize form data with persistence
  const getInitialFormData = () => {
    if (contact) {
      // If editing existing contact, use contact data
      return {
        name: contact?.name != null ? String(contact.name) : '',
        email: contact?.email != null ? String(contact.email) : '',
        phone: contact?.phone != null ? String(contact.phone) : '',
        birthday: contact?.birthday || '',
        category_ids:
          contact?.category_ids != null
            ? contact.category_ids.map(String)
            : [],
        image: contact?.photo_url || contact?.image || null
      };
    } else {
      // If adding new contact, try to restore from localStorage
      const saved = localStorage.getItem('contactFormData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, return default
        }
      }
      return {
        name: '',
        email: '',
        phone: '',
        birthday: '',
        category_ids: [],
        image: null
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Persist form data when adding new contact (not when editing)
  useEffect(() => {
    if (!contact && (formData.name || formData.email || formData.phone)) {
      localStorage.setItem('contactFormData', JSON.stringify(formData));
    }
  }, [formData, contact]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // ✅ Blocked Contacts Context
  const { blockedContacts, block, unblock } = useBlockedContacts();
  const isBlocked = contact && blockedContacts.some(blockedContact => blockedContact.contact_id === contact.contact_id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // String-safe validation
    if (
      !String(formData.name || '').trim() ||
      !String(formData.email || '').trim() ||
      !String(formData.phone || '').trim()
    ) {
      toast.error('Name, email, and phone are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const contactData = {
        name: String(formData.name).trim(),
        email: String(formData.email).trim(),
        phone: String(formData.phone).trim(),
        birthday: formData.birthday,
        category_ids: formData.category_ids // ✅ multi-category
      };

      let result;
      if (contact) {
        result = await updateContact(contact.contact_id, contactData, selectedFile, userId);
      } else {
        result = await addContact(contactData, selectedFile, userId);
      }

      if (result.success) {
        // Clear persisted form data on successful submission
        localStorage.removeItem('contactFormData');
        onSave();
      } else {
        toast.error(`Failed to ${contact ? 'update' : 'add'} contact: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error ${contact ? 'updating' : 'adding'} contact: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setSelectedFile(null);
  };

  // ✅ Category tag handling
  const addCategory = (id) => {
    if (!formData.category_ids.includes(id)) {
      setFormData({
        ...formData,
        category_ids: [...formData.category_ids, id]
      });
    }
  };

  const removeCategory = (id) => {
    setFormData({
      ...formData,
      category_ids: formData.category_ids.filter((cid) => cid !== id)
    });
  };

  // ✅ Block/unblock handler
  const handleBlockContact = async () => {
    if (!contact) {
      toast.error("You can only block saved contacts.");
      return;
    }

    if (isBlocked) {
      if (window.confirm(`Are you sure you want to unblock ${formatName(contact)}?`)) {
        const result = await unblock(contact.contact_id);
        if (result.success) {
          toast.error(`${formatName(contact)} has been unblocked.`);
        } else {
          toast.error(`Failed to unblock ${formatName(contact)}: ${result.error}`);

        }
      }
    } else {
      const result = await block(contact.contact_id);
      if (result.success) {

        toast.error(`${formatName(contact)} has been blocked.`);
      } else {
        toast.error(`Failed to block ${formatName(contact)}: ${result.error}`);

      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-[#161b22] p-8 rounded-[16px] border dark:border-slate-700 w-[400px] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
        <h3 className="text-[1.4rem] font-semibold text-[#334155] dark:text-slate-300 mb-6 text-center">
          {contact ? `Edit Contact - ${formatName(contact)}` : 'Add New Contact'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="mb-4 text-center">
            <label htmlFor="image-upload">
              <div className="w-[100px] h-[100px] mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-800/50 flex items-center justify-center relative overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:scale-105 transform transition duration-200">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt={contact ? formatName(contact) : "Contact"} className="w-full h-full object-cover" />
                    <button
                      className="absolute top-[5px] right-[5px] bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-[12px]"
                      type="button"
                      onClick={removeImage}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <Camera size={32} color="#94a3b8" />
                )}
              </div>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
          </div>

          {/* Name */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 dark:bg-gray-800/50 dark:border-slate-700 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 transform transition duration-200"
              required
            />
            {formData.name && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Display format: {formatName({ name: formData.name })}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 dark:bg-gray-800/50 dark:border-slate-700 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 transform transition duration-200"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 dark:bg-gray-800/50 dark:border-slate-700 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 transform transition duration-200"
              required
            />
          </div>

          {/* Birthday with label */}
<div className="mb-4">
  <label
    htmlFor="birthday-input"
    className="block mb-1 font-semibold text-gray-700 dark:text-gray-300"
  >
    Birthday
  </label>
  <input
    id="birthday-input"
    type="date"
    placeholder="Birthday"
    value={formData.birthday}
    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
    className="w-full px-4 py-3 dark:bg-gray-800/50 dark:border-slate-700 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 transform transition duration-200"
  />
  {formData.birthday && (
    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Display format: {formatDate(formData.birthday)}
    </div>
  )}
</div>


          {/* ✅ Multi-Category Select with Tags */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.category_ids.map((id) => {
                const cat = categories.find((c) => String(c.category_id) === id);
                return (
                  <span
                    key={id}
                    className="px-3 py-1 bg-blue-100 dark:bg-indigo-700 text-blue-700 dark:text-slate-100 rounded-full flex items-center gap-2 text-sm"
                  >
                    {cat?.category_name || cat?.name || 'Unknown'}
                    <button
                      type="button"
                      onClick={() => removeCategory(id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
            <select
              onClick={() => setShowCategoryPicker(true)}
              className="w-full px-4 py-3 dark:bg-gray-800/50 dark:border-slate-700 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 bg-white text-slate-600 transform transition duration-200"
            >
              <option value="">+ Add more</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-xl text-white text-base font-medium transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-700 to-blue-400 dark:from-indigo-950 dark:to-indigo-700 dark:text-slate-100 border dark:border-slate-800 hover:scale-105 hover:from-blue-800 hover:to-blue-500 dark:hover:from-indigo-900/70 dark:hover:to-indigo-600'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-gray-700/70 text-base font-medium scale-100 hover:scale-105 hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Block / Unblock */}
          {contact && (
            <button
              type="button"
              onClick={handleBlockContact}
              className={`mt-4 h-[48px] flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-base font-medium scale-100 hover:scale-105 transition duration-200 ${
                isBlocked
                  ? 'border-green-700 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800'
                  : 'border-red-200 bg-red-100 text-red-600 dark:text-red-200 dark:border-red-950 dark:bg-red-950 dark:hover:bg-red-900'
              }`}
            >
              <NoSymbolIcon className="h-5 w-5" />
              {isBlocked ? 'Unblock Contact' : 'Block Contact'}
            </button>
          )}
        </form>

        {/* Category Picker Dropdown */}
        {showCategoryPicker && (
          <div className="absolute z-50 bg-white border rounded-lg shadow-lg p-4 mt-2 w-full max-h-64 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {categories.map(category => (
                <button
                  key={category.category_id}
                  className="text-left px-3 py-2 rounded hover:bg-blue-100 text-slate-700"
                  onClick={() => {
                    addCategory(String(category.category_id));
                    setShowCategoryPicker(false);
                  }}
                >
                  {category.category_name || category.name}
                </button>
              ))}
            </div>
            <button
              className="mt-2 text-xs text-red-500"
              onClick={() => setShowCategoryPicker(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
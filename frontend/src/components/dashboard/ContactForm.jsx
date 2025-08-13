import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { addContact, updateContact } from '../../services/contactService';

const ContactForm = ({ contact, categories = [], onSave, onCancel, userId }) => {
  const [formData, setFormData] = useState({
    name: contact?.name != null ? String(contact.name) : '',
    email: contact?.email != null ? String(contact.email) : '',
    phone: contact?.phone != null ? String(contact.phone) : '',
    birthday: contact?.birthday || '',
    category_id:
      contact?.category_id != null
        ? String(contact.category_id)
        : categories.length > 0
        ? String(categories[0]?.category_id)
        : '',
    image: contact?.photo_url || contact?.image || null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ String-safe validation
    if (
      !String(formData.name || '').trim() ||
      !String(formData.email || '').trim() ||
      !String(formData.phone || '').trim()
    ) {
      alert('Name, email, and phone are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const contactData = {
        name: String(formData.name).trim(),
        email: String(formData.email).trim(),
        phone: String(formData.phone).trim(),
        birthday: formData.birthday,
        category_id: formData.category_id || null
      };

      let result;
      if (contact) {
        result = await updateContact(contact.contact_id, contactData, selectedFile, userId);
      } else {
        result = await addContact(contactData, selectedFile, userId);
      }

      if (result.success) {
        onSave();
      } else {
        alert(`Failed to ${contact ? 'update' : 'add'} contact: ${result.error}`);
      }
    } catch (error) {
      alert(`Error ${contact ? 'updating' : 'adding'} contact: ${error.message}`);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-60 flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[16px] border dark:border-slate-600 w-[400px] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
        <h3 className="text-[1.4rem] font-semibold text-[#334155] dark:text-slate-300 mb-6 text-center">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="mb-4 text-center">
            <label htmlFor="image-upload">
              <div className="w-[100px] h-[100px] mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center relative overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-500 cursor-pointer hover:scale-105 transform transition duration-200">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Contact" className="w-full h-full object-cover" />
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
              onChange={(e) => setFormData({ ...formData, name: String(e.target.value) })}
              className="w-full px-4 py-3 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 focus:scale-105 transition duration-200"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: String(e.target.value) })}
              className="w-full px-4 py-3 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 focus:scale-105 transition duration-200"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: String(e.target.value) })}
              className="w-full px-4 py-3 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 focus:scale-105 transition duration-200"
              required
            />
          </div>

          {/* Birthday */}
          <div className="mb-4">
            <input
              type="date"
              placeholder="Birthday"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="w-full px-4 py-3 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 focus:scale-105 transition duration-200"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value || '' })}
              className="w-full px-4 py-3 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200 border border-slate-300 rounded-xl text-base outline-none hover:scale-105 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 focus:scale-105 bg-white text-slate-600 transition duration-200"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name || category.name}
                </option>
              ))}
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
                  : 'bg-gradient-to-r from-blue-700 to-blue-400 dark:from-indigo-800 dark:to-indigo-500'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 text-base font-medium hover:scale-105 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;

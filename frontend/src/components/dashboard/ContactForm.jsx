import React, { useState } from 'react';
import {Camera, X } from 'lucide-react';

const ContactForm = ({ contact, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      category_id: contact?.category_id || categories[0]?.category_id || 1,
      image: contact?.image || null
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };
  
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData({...formData, image: event.target.result});
        };
        reader.readAsDataURL(file);
      }
    };
  
    const removeImage = () => {
      setFormData({...formData, image: null});
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white p-8 rounded-[16px] w-[400px] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
          <h3 className="text-[1.4rem] font-semibold text-[#334155] mb-6 text-center">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="mb-4 text-center">
              <label htmlFor="image-upload">
                  <div className="w-[100px] h-[100px] mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center relative overflow-hidden border-2 border-dashed border-slate-300 cursor-pointer hover:scale-105 transform transition duration-200">
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
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 focus:scale-105 transform transition duration-200"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 focus:scale-105 transform transition duration-200"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 focus:scale-105 transform transition duration-200"
                required
              />
            </div>
            <div className="mb-6">
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 focus:scale-105 bg-white text-slate-600 transform transition duration-200"
              >
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl text-white text-base font-medium bg-gradient-to-r from-blue-700 to-blue-400 scale-100 hover:scale-105 hover:from-blue-800 hover:to-blue-500 transition-all duration-200">
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl text-slate-500 bg-slate-100 text-base font-medium scale-100 hover:scale-105 hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
    
  };
export default ContactForm; 
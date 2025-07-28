import React, { useState } from 'react';

const CategoryForm = ({ onSave, onCancel }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave(categoryName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-[12px] w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        <h3 className="mb-6 ">Add New Category</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text" placeholder="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-[8px] text-base outline-none box-border" required/>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit"
              className="flex-1 p-3 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-xl text-md scale-100 hover:from-blue-700 hover:to-blue-500 hover:scale-105 transform transition-transform duration-200 transition-colors cursor-pointer text-base">
              Save
            </button>
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 bg-slate-100 text-base font-medium scale-100 hover:scale-105 hover:bg-slate-200 hover:border-slate-300 transition cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CategoryForm;
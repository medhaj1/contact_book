import React, { useState } from 'react';
import { addCategory } from '../../services/categoryService';

const CategoryForm = ({ onSave, onCancel, existingCategories = [], userId }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedName = categoryName.trim();
    
    // Validation
    if (!trimmedName) {
      setError('Category name is required');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }
    
    if (trimmedName.length > 50) {
      setError('Category name must be less than 50 characters');
      return;
    }
    
    // Check for duplicates
    const isDuplicate = existingCategories.some(
      category => category.category_name?.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      setError('A category with this name already exists');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await addCategory(trimmedName);
      
      if (result.success) {
        onSave(result.data);
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      setError('Failed to create category: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-[12px] w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Add New Category</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text" 
              placeholder="Category Name" 
              value={categoryName} 
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError(''); // Clear error when user types
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base outline-none scale-100 hover:scale-105 focus:ring-1 focus:ring-blue-400 focus:scale-105 transform transition duration-200"
              required
              disabled={isSubmitting}
              maxLength={50}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <div className="flex gap-4">
            <button 
              type="submit"
              disabled={isSubmitting || !categoryName.trim()}
              className={`flex-1 py-3 rounded-xl text-white text-base font-medium transition-all duration-200 ${
                isSubmitting || !categoryName.trim()
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-700 to-blue-400 scale-100 hover:from-blue-800 hover:to-blue-500 hover:scale-105 transform'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl text-slate-500 bg-slate-100 text-base font-medium scale-100 hover:scale-105 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CategoryForm;
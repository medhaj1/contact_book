import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import CategoryForm from './CategoryForm';

const CategoriesPanel = ({ 
  categories, 
  contacts, 
  userId, 
  onCategoriesChange 
}) => {
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleCategorySave = async () => {
    await onCategoriesChange();
    setShowAddCategory(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // Check if any contact uses this category
      const hasContacts = contacts.some(c => c.category_id === categoryId);
      if (hasContacts) {
        alert('Cannot delete category: There are contacts using this category.');
        return;
      }

      // Import deleteCategory from service
      const { deleteCategory } = await import('../../services/categoryService');
      const result = await deleteCategory(categoryId);
      
      if (result.success) {
        await onCategoriesChange();
      } else {
        alert('Error deleting category: ' + result.error);
      }
    }
  };

  return (
    <>
      {/* Add Category Button */}
      <div className="flex mb-8">
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-xl text-md scale-100 hover:from-blue-800 hover:to-blue-500 hover:scale-105 transform transition-transform duration-200 transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div 
            key={category.category_id} 
            className="bg-white dark:bg-slate-600 border border-blue-100 dark:border-slate-500 p-6 rounded-2xl flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300">
                {category.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {contacts.filter(c => String(c.category_id) === String(category.category_id)).length} contacts
              </p>
            </div>
            <button
              className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 ml-4"
              onClick={() => handleDeleteCategory(category.category_id)}
              title="Delete Category"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Category Form Modal */}
      {showAddCategory && (
        <CategoryForm
          existingCategories={categories}
          onSave={handleCategorySave}
          onCancel={() => setShowAddCategory(false)}
          userId={userId}
        />
      )}
    </>
  );
};

export default CategoriesPanel;

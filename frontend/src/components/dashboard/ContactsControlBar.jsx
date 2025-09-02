import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Plus, CheckSquare, Square } from 'lucide-react';
import CategoryForm from './CategoryForm';

const ContactsControlBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  categories,
  contacts,
  userId,
  onCategoriesChange,
  // Selection mode props
  selectionMode = false,
  onToggleSelectionMode,
  selectedContacts = [],
  onSelectAll,
  onClearSelection
}) => {
  const [showAddCategory, setShowAddCategory] = useState(() => {
    return localStorage.getItem('contactsControlBarShowAddCategory') === 'true';
  });

  // Persist add category modal state
  useEffect(() => {
    localStorage.setItem('contactsControlBarShowAddCategory', showAddCategory.toString());
  }, [showAddCategory]);

  const handleCategorySave = async () => {
    await onCategoriesChange();
    setShowAddCategory(false);
    localStorage.removeItem('contactsControlBarShowAddCategory');
  };

  const handleCancelCategory = () => {
    setShowAddCategory(false);
    localStorage.removeItem('contactsControlBarShowAddCategory');
  };

  // Count contacts for each category
  const getCategoryCount = (categoryId) => {
    if (categoryId === '') {
      return contacts.length;
    }
    if (categoryId === 'favourites') {
      return contacts.filter(c => c.is_favourite === true).length;
    }
    // Use category_ids array for filtering (correct logic)
    return contacts.filter(c => 
      Array.isArray(c.category_ids) && 
      c.category_ids.some(id => String(id) === String(categoryId))
    ).length;
  };

  // Get filtered contacts count for selection
  const getFilteredContacts = () => {
    return contacts.filter(contact => {
      const matchesSearch =
        (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.phone || '').includes(searchTerm);
    
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === '' ||
        (selectedCategory === 'favourites' ? contact.is_favourite === true :
          (Array.isArray(contact.category_ids) &&
            contact.category_ids.some((id) => String(id) === String(selectedCategory))));
    
      return matchesSearch && matchesCategory;
    });
  };

  const filteredContacts = getFilteredContacts();
  const allSelected = filteredContacts.length > 0 && filteredContacts.every(c => selectedContacts.includes(c.contact_id));

  return (
    <div className="mb-8">
      {/* Search bar and view controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm dark:bg-[#161b22] dark:border-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selection controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSelectionMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectionMode
                ? 'bg-blue-500 dark:bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={selectionMode ? "Exit selection mode" : "Enter selection mode"}
          >
            {selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            <span>{selectionMode ? 'Exit Select' : 'Select'}</span>
          </button>

          {selectionMode && (
            <>
              <button
                onClick={allSelected ? onClearSelection : () => onSelectAll(filteredContacts)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={allSelected ? "Deselect all" : "Select all visible"}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </>
          )}
        </div>

        <div className="flex h-10 bg-white dark:bg-[#161b22] rounded-xl border dark:border-slate-700">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-xl ${
              viewMode === "card"
                ? "bg-blue-500 dark:bg-indigo-600 text-white"
                : "text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"
            }`}
            title="Card view"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-xl ${
              viewMode === "list"
                ? "bg-blue-500 dark:bg-indigo-600 text-white"
                : "text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"
            }`}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Categories tabs - WhatsApp style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* All Contacts */}
        <button
          onClick={() => setSelectedCategory('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-blue-600 dark:bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-700 border border-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All ({getCategoryCount('')})
        </button>

        {/* Favourites */}
        <button
          onClick={() => setSelectedCategory('favourites')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'favourites'
              ? 'bg-blue-600 dark:bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-700 border border-gray-200 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
          }`}
        >
          ⭐ Favourites ({getCategoryCount('favourites')})
        </button>

        {/* User's Categories - Place here */}
        {categories.map((category) => (
          <button
            key={category.category_id}
            onClick={() => setSelectedCategory(category.category_id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              String(selectedCategory) === String(category.category_id)
                ? 'bg-blue-600 dark:bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.name} ({getCategoryCount(category.category_id)})
          </button>
        ))}

        {/* Add Category Button - Place last */}
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex-shrink-0 p-2 rounded-full bg-white border border-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Add Category"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Category Form Modal */}
      {showAddCategory && (
        <CategoryForm
          existingCategories={categories}
          onSave={handleCategorySave}
          onCancel={handleCancelCategory}
          userId={userId}
        />
      )}
    </div>
  );
};

export default ContactsControlBar;

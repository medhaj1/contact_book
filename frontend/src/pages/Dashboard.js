import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Search, Plus, Edit2, Trash2,
  Users, BookOpen, Settings, LogOut, CheckSquare,MessageSquare
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import ChatPanel from '../components/chat/ChatPanel';

import ContactForm from '../components/dashboard/ContactForm';
import CategoryForm from '../components/dashboard/CategoryForm';
import BirthdayReminder from './BirthdayReminder'; // Only UI, uses contacts with .birthday supported
import TaskPanel from '../components/dashboard/TaskPanel';
import SettingsTab from './SettingsTab';

// Utility function to check if birthday is today
function isBirthdayToday(birthday) {
  if (!birthday) return false;
  
  try {
    const today = new Date();
    const bdate = new Date(birthday);
    
    // Check if the date is valid
    if (isNaN(bdate.getTime())) return false;
    
    return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
  } catch (error) {
    console.error("Error parsing birthday date:", birthday, error);
    return false;
  }
}

const Dashboard = ({ currentUser, onLogout = () => {} }) => {

  const navigate = useNavigate();

  // --- Contacts and Categories Data (API driven, from First Code) ---
  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
  const userEmail = currentUser?.email || 'No email';
  const userId = currentUser?.id || 'unknown';

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Restore active tab from localStorage, default to 'contacts'
    return localStorage.getItem('dashboardActiveTab') || 'contacts';
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [profileImageError, setProfileImageError] = useState(false);

  const API_BASE_URL = 'http://localhost:5050';

  // Fetch contacts from backend (including .birthday, as per 16)
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && userId !== 'unknown') {
      fetchContacts();
    }
  }, [userId, fetchContacts]);

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .order('category_id', { ascending: true });
      if (error) {
        console.error('Error fetching categories:', error.message);
        // Set default categories if fetch fails
        setCategories([
          { category_id: 1, name: 'Family' },
          { category_id: 2, name: 'Friends' },
          { category_id: 3, name: 'Work' },
          { category_id: 4, name: 'Business' }
        ]);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories if fetch fails
      setCategories([
        { category_id: 1, name: 'Family' },
        { category_id: 2, name: 'Friends' },
        { category_id: 3, name: 'Work' },
        { category_id: 4, name: 'Business' }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab);
  }, [activeTab]);

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) {
      alert('Error fetching documents: ' + error.message);
      setDocuments([]);
    } else {
      setDocuments(data);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.relative')) {
        setShowUserDropdown(false);
      }
      if (showAddContactDropdown && !event.target.closest('.relative')) {
        setShowAddContactDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showAddContactDropdown]);

  // --- Contact CRUD (Simplified - API calls moved to ContactForm) ---
  const handleContactSave = async () => {
    // Refresh contacts list after successful save
    await fetchContacts();
    // Close modals
    setShowAddContact(false);
    setEditingContact(null);
  };

  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchContacts();
        } else {
          const error = await response.json();
          alert('Failed to delete contact: ' + (error.details || error.error));
        }
      } catch (error) {
        alert('Error deleting contact: ' + error.message);
      }
    }
  };

  // --- Category Management (Simplified - validation moved to CategoryForm) ---
  const handleCategorySave = async (categoryData) => {
    // Handle both category name string and category object
    const categoryName = typeof categoryData === 'string' ? categoryData : categoryData.name;
    await addCategory(categoryName);
  };

  const addCategory = async (categoryName) => {
    const { data, error } = await supabase
      .from('category')
      .insert([{ name: categoryName }])
      .select();

    if (error) {
      alert('Error adding category: ' + error.message);
      return;
    }

    // Refresh categories from DB
    const { data: updatedCategories } = await supabase
      .from('category')
      .select('*')
      .order('category_id', { ascending: true });

    setCategories(updatedCategories);
    setShowAddCategory(false);
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // Optional: Prevent deletion if any contact uses this category
      const hasContacts = contacts.some(c => c.category_id === categoryId);
      if (hasContacts) {
        alert('Cannot delete category: There are contacts using this category.');
        return;
      }

      const { error } = await supabase
        .from('category')
        .delete()
        .eq('category_id', categoryId);

      if (error) {
        alert('Error deleting category: ' + error.message);
        return;
      }

      // Refresh categories from DB
      const { data: updatedCategories } = await supabase
        .from('category')
        .select('*')
        .order('category_id', { ascending: true });

      setCategories(updatedCategories);
    }
  };

  // Filtering (search + category)
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
    );
    const matchesCategory = !selectedCategory || String(contact.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Get today's birthday contacts
  const todaysBirthdays = contacts.filter(contact => isBirthdayToday(contact.birthday));

  const sidebarItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'categories', label: 'Categories', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'chat', label: 'Chat', icon: MessageSquare }, // Add Task section
  ];

  // Classnames for prettier transitions/buttons - reference 22: use 2nd code style
  const getSidebarItemClass = (isActive) =>
    `flex items-center px-4 py-2 rounded-lg cursor-pointer transition text-sm font-medium ${
      isActive
        ? 'bg-blue-100 dark:bg-indigo-300 text-blue-700 dark:text-indigo-900 scale-100 hover:scale-105'
        : 'text-slate-500 dark:text-slate-400 scale-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 hover:text-slate-600 dark:hover:text-slate-300'
    }`;
  
  // Card border color from 2nd code
  const cardBorderClass = "bg-white border border-blue-100 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1";

  const handleImportCSV = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);   // Attach the logged-in user's id

  try {
    const resp = await fetch(`${API_BASE_URL}/contacts/import`, {
      method: 'POST',
      body: formData,
    });
    if (resp.ok) {
      alert('Contacts imported successfully!');
      await fetchContacts(); // Refresh UI
    } else {
      const error = await resp.json();
      alert('Import failed: ' + (error.details || error.error));
    }
  } catch (error) {
    alert('Error importing contacts: ' + error.message);
  } finally {
    // Reset the file input so user can re-import if desired
    e.target.value = '';
  }
};

const handleUploadDocuments = async (e) => {
  const files = Array.from(e.target.files);
  let uploadedCount = 0;
  for (const file of files) {
    // 1. Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(`public/${file.name}`, file, { upsert: true });
    if (storageError) {
      alert(`Failed to upload ${file.name}: ${storageError.message}`);
      continue;
    }
    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(`public/${file.name}`);
    // 3. Insert metadata into documents table
    const { error: dbError } = await supabase
      .from('documents')
      .insert([{
        name: file.name,
        url: urlData.publicUrl,
        uploaded_by: currentUser?.id,
        uploaded_at: new Date().toISOString(),
        contact_id: null // or set if linking to a contact
      }]);
    if (dbError) {
      alert(`Failed to save ${file.name} in DB: ${dbError.message}`);
    } else {
      uploadedCount++;
    }
  }
  fetchDocuments();
  if (uploadedCount > 0) {
    alert(`${uploadedCount} document${uploadedCount > 1 ? 's' : ''} uploaded successfully!`);
  }
};

const handleDeleteDocument = async (doc) => {
  if (!window.confirm(`Delete ${doc.name}?`)) return;
  // 1. Remove from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([`public/${doc.name}`]);
  if (storageError) {
    alert('Delete from storage failed: ' + storageError.message);
    return;
  }
  // 2. Remove from DB
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', doc.id);
  if (dbError) {
    alert('Delete from DB failed: ' + dbError.message);
    return;
  }
  fetchDocuments();
};

  return (
    <div className="flex min-h-screen font-sans">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 w-60 h-screen bg-white dark:bg-slate-900 p-6 border-r border-slate-200 dark:border-slate-600 flex flex-col overflow-y-auto z-10 fixed-sidebar">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-300 mb-8">Contact Book</h2>
        <nav className="flex-1 space-y-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={getSidebarItemClass(isActive)}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} className="mr-3" />
                {item.label}
              </div>
            );
          })}
        </nav>

      </div>

      {/* Main Content - with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-60 p-8 bg-blue-50 dark:bg-slate-800 transition-all duration-200 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-300 capitalize">{activeTab}</h1>
          <div className="relative flex items-center gap-3">
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all duration-200"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-700 to-blue-400 shadow-lg border-2 border-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                {(currentUser?.user_metadata?.image || currentUser?.user_metadata?.picture) && !profileImageError ? (
                  <img 
                    src={currentUser.user_metadata.image || currentUser.user_metadata.picture} 
                    alt={userName}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center">
                    {userName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{userName}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-200 dark:border-slate-500 py-1 z-50">
                <div
                  className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:font-semibold dark:hover:text-indigo-200 hover:bg-blue-100 dark:hover:bg-indigo-700 cursor-pointer"
                  onClick={() => {
                    navigate('/profile');
                    setShowUserDropdown(false);
                  }}
                >
                  <User size={16} className="mr-3" />
                  Profile
                </div>
                <div
                  className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700  dark:text-slate-300 dark:hover:font-semibold hover:text-red-600 dark:hover:text-red-200 dark:hover:bg-red-800 hover:bg-red-100 cursor-pointer"
                  onClick={() => {
                    onLogout();
                    setShowUserDropdown(false);
                  }}
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl dark:text-white border border-blue-100 dark:bg-slate-600 dark:border-slate-500 text-sm focus:outline-none hover:border-blue-200 dark:hover:border-slate-400 shadow focus:ring-1 focus:ring-blue-100 dark:focus:ring-indigo-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="pl-6 pr-3 py-2 rounded-xl dark:text-slate-200 dark:bg-slate-600 border border-blue-100 dark:border-slate-500 text-md focus:outline-none hover:border-blue-200 dark:hover:border-slate-400 hover:shadow focus:ring-1 focus:ring-blue-100 dark:focus:ring-indigo-500 transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="relative">
  <button
    onClick={() => setShowAddContactDropdown(prev => !prev)}
    className="btn"
  >
    <Plus size={16} />
    Add Contact
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {showAddContactDropdown && (
    <div className="absolute mt-2 w-44 right-0 bg-white border border-slate-200 shadow-lg rounded-lg z-10">
      <div
        className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-700"
        onClick={() => {
          setShowAddContact(true);
          setShowAddContactDropdown(false);
        }}
      >
        Add via Form
      </div>
      <div
        className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-700"
        onClick={() => {
          document.getElementById('csvFileInput').click();
          setShowAddContactDropdown(false);
        }}
      >
        Import via CSV
      </div>
    </div>
  )}

  {/* Hidden CSV Input */}
  <input
    type="file"
    id="csvFileInput"
    accept=".csv,.vcf"
    className="hidden"
    onChange={handleImportCSV}
  />
</div>

            </div>

            {/* Today's Birthday Reminders */}
            {todaysBirthdays.length > 0 && (
              <div className="mb-6 p-4 bg-sky-200 bg-opacity-60 dark:bg-blue-900 dark:bg-opacity-50 rounded-xl shadow-md hover:shadow-lg border border-sky-200 dark:border-none flex flex-col gap-2">
                <div className="font-bold text-lg text-sky-700 dark:text-blue-300 flex items-center gap-1">
                  🎂 Birthday{todaysBirthdays.length > 1 ? "s" : ""} Today!
                </div>
                {todaysBirthdays.map((contact) => (
                  <div key={contact.contact_id} className="flex items-center gap-3 text-sky-700 dark:text-blue-400">
                    <span className="font-bold">{contact.name}</span>
                    <span className="text-slate-500 dark:text-slate-500 text-base">{contact.email}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Birthday Reminder */}
            <BirthdayReminder contacts={contacts} />

            {/* Contact Cards */}
            {loading ? (
              <div className="text-center text-slate-400 dark:text-slate-300 py-12">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                {contacts.length === 0
                  ? "No contacts yet. Add your first contact!"
                  : "No contacts match your search criteria."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.contact_id}
                    className="bg-white dark:bg-slate-700 dark:bg-opacity-50 border border-blue-100 dark:border-slate-600 dark:border-opacity-60 dark:hover:shadow-slate-700 p-6 rounded-2xl transition hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-300 flex items-center justify-center text-blue-700 dark:text-indigo-700 font-semibold text-lg overflow-hidden mr-4">
                        {contact.photo_url
                          ? <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover rounded-full" />
                          : contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">{contact.name}</h3>
                        {contact.category_id && (
                          <span className="text-xs bg-blue-100 dark:bg-slate-600 text-blue-800 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                            {categories.find(cat => String(cat.category_id) === String(contact.category_id))?.name || "Unknown"}
                          </span>
                        )}
                        {contact.birthday && (
                          <div className="text-xs text-blue-600 dark:text-indigo-300 mt-1">
                            🎂 {(() => {
                              try {
                                // Parse the date from the database (YYYY-MM-DD format)
                                const date = new Date(contact.birthday);
                                // Check if the date is valid
                                if (isNaN(date.getTime())) {
                                  return contact.birthday; // Return raw value if parsing fails
                                }
                                return date.toLocaleDateString(undefined, {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                });
                              } catch (error) {
                                console.error("Error parsing birthday:", contact.birthday, error);
                                return contact.birthday; // Fallback to raw value
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm mb-1">
                      <Mail size={16} />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm mb-1">
                      <Phone size={16} />
                      <span>{contact.phone}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="p-2 bg-blue-50 dark:bg-indigo-300 text-blue-600 rounded-md hover:bg-blue-100"
                        onClick={() => setEditingContact(contact)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 bg-red-50 dark:bg-red-300 text-red-600 dark:text-red-800 rounded-md hover:bg-red-100"
                        onClick={() => deleteContact(contact.contact_id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="flex mb-8">
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-xl text-md scale-100 hover:from-blue-800 hover:to-blue-500 hover:scale-105 transform transition-transform duration-200 transition-colors"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <div key={category.category_id} className="bg-white dark:bg-slate-600 border border-blue-100 dark:border-slate-500 p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300">{category.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {contacts.filter(c => String(c.category_id) === String(category.category_id)).length} contacts
                    </p>
                  </div>
                  <button
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 ml-4"
                    onClick={() => deleteCategory(category.category_id)}
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab currentUser={currentUser}/>
        )}

        {/* Task Tab */}
        {activeTab === 'task' && (
          <div className="flex flex-col items-center w-full">
            <TaskPanel />
          </div>
        )}

        {activeTab === 'chat' && (
  <ChatPanel currentUser={currentUser} />
)}

  </div>

        {/* Modals with categories passed to ContactForm */}
        {showAddContact && (
          <ContactForm
            categories={categories}
            userId={userId}
            onSave={handleContactSave}
            onCancel={() => setShowAddContact(false)}
          />
        )}
        {editingContact && (
          <ContactForm
            contact={editingContact}
            categories={categories}
            userId={userId}
            onSave={handleContactSave}
            onCancel={() => setEditingContact(null)}
          />
        )}
        {showAddCategory && (
          <CategoryForm
            existingCategories={categories}
            onSave={handleCategorySave}
            onCancel={() => setShowAddCategory(false)}
          />
        )}

        {/* Documents Tab - Enhanced UI */}
        {activeTab === 'documents' && (
          <>
            {/* Upload Section */}
            <div className="mb-8">
              <div className="bg-white dark:bg-slate-600 border border-blue-100 dark:border-slate-500 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300 mb-4">Upload Documents</h3>
                <div className="relative border-2 border-dashed border-blue-200 dark:border-slate-400 rounded-xl p-8 text-center hover:border-blue-300 dark:hover:border-slate-300 transition-colors">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 mb-2">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        PDF, DOC, DOCX, TXT files up to 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleUploadDocuments}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300 mb-4">
                Uploaded Documents ({documents.length})
              </h3>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-lg mb-2">No documents uploaded yet</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Upload your first document to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map(doc => (
                    <div key={doc.id} className={cardBorderClass}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            {doc.name.toLowerCase().includes('.pdf') ? (
                              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            ) : doc.name.toLowerCase().includes('.doc') ? (
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={doc.name}>
                              {doc.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </a>
                        <button
                          className="flex items-center justify-center p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          onClick={() => handleDeleteDocument(doc)}
                          title="Delete Document"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
  );
};



export default Dashboard;

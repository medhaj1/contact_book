import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Search, Plus, Edit2, Trash2,
  Users, BookOpen, Settings, LogOut, CheckSquare,MessageSquare
} from 'lucide-react';
import ChatPanel from '../components/chat/ChatPanel';

import ContactForm from '../components/dashboard/ContactForm';
import BirthdayReminder from '../components/dashboard/BirthdayReminder';
import TaskPanel from '../components/dashboard/TaskPanel';
import SettingsTab from '../components/dashboard/SettingsTab';
import DocumentsPanel from '../components/dashboard/DocumentsPanel';
import CategoriesPanel from '../components/dashboard/CategoriesPanel';
import ImportModal from '../components/dashboard/ImportModal';
import SharedDocumentsPanel from '../components/dashboard/SharedDocumentsPanel';

// Import services
import { getContacts, deleteContact } from '../services/contactService';
import { getCategories } from '../services/categoryService';
import { supabase } from '../supabaseClient';

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
  const userId = currentUser?.id || 'unknown';

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    // Restore active tab from localStorage, default to 'contacts'
    return localStorage.getItem('dashboardActiveTab') || 'contacts';
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Fetch contacts using service
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getContacts(userId);
      if (result.success) {
        setContacts(result.data);
      } else {
        console.error('Failed to fetch contacts:', result.error);
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

  // Fetch categories using service
  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        console.log('Fetched categories from database:', result.data);
        setCategories(result.data);
      } else {
        console.error('Error fetching categories:', result.error);
        // Only set default categories if no categories exist
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (userId && userId !== 'unknown') {
      fetchCategories();
    }
  }, [userId, fetchCategories]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab);
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

  // --- Contact CRUD using services ---
  const handleContactSave = async () => {
    // Refresh contacts list after successful save
    await fetchContacts();
    // Close modals
    setShowAddContact(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const result = await deleteContact(contactId);
        if (result.success) {
          await fetchContacts();
        } else {
          alert('Failed to delete contact: ' + result.error);
        }
      } catch (error) {
        alert('Error deleting contact: ' + error.message);
      }
    }
  };

  // --- Category Management using services ---
  // Category management is now handled by CategoriesPanel component

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
    { id: 'shared_documents', label: 'Shared Documents', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
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

  // Add this function inside Dashboard component
  const handleSendDocument = async (file) => {
    if (!file || !currentUser?.id) return;
    // Generate a unique filename
    const filePath = `chat/${currentUser.id}/${Date.now()}_${file.name}`;
    // Upload to Supabase Storage (make sure you have a 'chat' bucket)
    const { data, error } = await supabase.storage.from('chat').upload(filePath, file);
    if (error) {
      alert('File upload failed: ' + error.message);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('chat').getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl;
    if (!fileUrl) {
      alert('Could not get file URL');
      return;
    }
    // Send as a message (you may want to distinguish file messages)
    // You need to know the selectedContact here, so you may need to lift state up if needed
    // For now, you can pass a callback to ChatPanel and handle message sending there
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
                    {c.category_name || c.name}
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
          setShowImportModal(true);
          setShowAddContactDropdown(false);
        }}
      >
        Import Contacts
      </div>
    </div>
  )}
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
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                            {categories.find(cat => String(cat.category_id) === String(contact.category_id))?.category_name || categories.find(cat => String(cat.category_id) === String(contact.category_id))?.name || "Unknown"}
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
                        className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        onClick={() => handleDeleteContact(contact.contact_id)}
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
          <CategoriesPanel 
            categories={categories}
            contacts={contacts}
            userId={userId}
            onCategoriesChange={fetchCategories}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab currentUser={currentUser} isDark={isDark} setIsDark={setIsDark}/>
        )}

        {/* Task Tab */}
        {activeTab === 'task' && (
          <div className="flex flex-col items-center w-full">
            <TaskPanel />
          </div>
        )}

        {activeTab === 'chat' && (
  <ChatPanel currentUser={currentUser} onSendDocument={handleSendDocument} />
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

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <DocumentsPanel currentUser={currentUser} />
        )}

        {/* Shared Documents Tab */}
        {activeTab === 'shared_documents' && (
          <SharedDocumentsPanel currentUser={currentUser} />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportModal
            userId={userId}
            onImportComplete={fetchContacts}
            onClose={() => setShowImportModal(false)}
          />
        )}
      </div>
  );
};


export default Dashboard;

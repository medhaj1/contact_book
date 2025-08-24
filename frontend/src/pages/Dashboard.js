import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from '../components/chat/ChatPanel';

import ContactForm from '../components/dashboard/ContactForm';
import BirthdayReminder from '../components/dashboard/BirthdayReminder';
import TaskPanel from '../components/dashboard/TaskPanel';
import SettingsTab from '../components/dashboard/SettingsTab';
import DocumentsPanel from '../components/dashboard/DocumentsPanel';
import ImportModal from '../components/dashboard/ImportModal';
import GroupPanel from '../components/groups/GroupPanel';
import SharedDocumentsPanel from '../components/dashboard/SharedDocumentsPanel';
import Sidebar from '../components/dashboard/Sidebar';
import HeaderSection from '../components/dashboard/HeaderSection';
import ContactsControlBar from '../components/dashboard/ContactsControlBar';
import ContactsGrid from '../components/dashboard/ContactsGrid';
import ContactsList from '../components/dashboard/ContactsList';
import FloatingActionButton from '../components/dashboard/FloatingActionButton';
import { addFavourite, removeFavourite } from "../services/favouriteService";
import { exportContactsCSV, exportContactsVCF } from '../services/importExportService';


// Import services
import { getContacts, deleteContact } from '../services/contactService';
import { getCategories } from '../services/categoryService';

const Dashboard = ({ currentUser, onLogout = () => {} }) => {
  const navigate = useNavigate();

  // Navigation handlers
  const onNavigateToProfile = () => {
    navigate('/profile');
  };

  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split("@")[0] || "User";
  const userId = currentUser?.id || "unknown";

  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(
    () => localStorage.getItem("dashboardSearchTerm") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem("dashboardSelectedCategory") || ""
  );
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("dashboardViewMode") || "card"
  );

  const [showAddContact, setShowAddContact] = useState(
    () => localStorage.getItem("dashboardShowAddContact") === "true"
  );
  const [editingContact, setEditingContact] = useState(() => {
    const saved = localStorage.getItem("dashboardEditingContact");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("dashboardActiveTab") || "contacts"
  );

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(
    () => localStorage.getItem("dashboardShowImportModal") === "true"
  );
  const [profileImageError, setProfileImageError] = useState(false);

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  //export functions
  const handleExport = async (format) => {
    try {
      const userId = currentUser?.id;
      if (!userId) {
        alert('User not found');
        return;
      }

      // Use the current selected category for filtering
      const filters = {
        category: selectedCategory, // Pass the selected category as-is, including 'favourites'
        filename: '',
        search: '',
        hasBirthday: ''
      };

      let result;
      if (format === 'csv') {
        result = await exportContactsCSV(userId, filters);
      } else {
        result = await exportContactsVCF(userId, filters);
      }

      if (result.success) {
        alert(`${format.toUpperCase()} exported successfully!`);
      } else {
        alert(`Failed to export ${format.toUpperCase()}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error exporting ${format.toUpperCase()}: ` + error.message);
    }
  };


  // ---------- THEME HANDLING ----------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // ---------- FETCH CONTACTS (with multi-category) ----------
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getContacts(userId);
      setContacts(result.success ? result.data : []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      console.log(result);
      setCategories(result.success ? result.data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (userId && userId !== "unknown") {
      fetchContacts();
      fetchCategories();
    }
  }, [userId, fetchContacts, fetchCategories]);

  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
    // When switching to documents tab, default to 'my' view
    if (activeTab === "documents") {
      setViewMode("my");
    }
  }, [activeTab]);

  // Persist search and filter states
  useEffect(() => {
    localStorage.setItem("dashboardSearchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem("dashboardSelectedCategory", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("dashboardViewMode", viewMode);
  }, [viewMode]);

  // Persist modal states
  useEffect(() => {
    localStorage.setItem("dashboardShowAddContact", showAddContact.toString());
  }, [showAddContact]);

  useEffect(() => {
    localStorage.setItem("dashboardEditingContact", JSON.stringify(editingContact));
  }, [editingContact]);

  useEffect(() => {
    localStorage.setItem("dashboardShowImportModal", showImportModal.toString());
  }, [showImportModal]);

  // Dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(".relative"))
        setShowUserDropdown(false);
      if (showAddContactDropdown && !event.target.closest(".relative"))
        setShowAddContactDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showAddContactDropdown]);

  // ---------- CONTACT CRUD ----------
  const handleContactSave = async () => {
    await fetchContacts();
    setShowAddContact(false);
    setEditingContact(null);
    // Clear persistence when closing modals
    localStorage.removeItem("dashboardShowAddContact");
    localStorage.removeItem("dashboardEditingContact");
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowAddContact(false);
  };

  const handleCancelContactForm = () => {
    setShowAddContact(false);
    setEditingContact(null);
    // Clear persistence when canceling
    localStorage.removeItem("dashboardShowAddContact");
    localStorage.removeItem("dashboardEditingContact");
  };

  const handleImportModalClose = () => {
    setShowImportModal(false);
    localStorage.removeItem("dashboardShowImportModal");
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Delete this contact?")) {
      const result = await deleteContact(contactId);
      if (result.success) fetchContacts();
    }
  };

  const toggleFavourite = async (contactId) => {
    // Find the contact to check current favorite status
    const contact = contacts.find(c => c.contact_id === contactId);
    const isFav = contact?.is_favourite || false;
    
    if (isFav) {
      const result = await removeFavourite(userId, contactId);
      if (result.success) {
        // Update local state
        setContacts(prev => prev.map(c => 
          c.contact_id === contactId ? { ...c, is_favourite: false } : c
        ));
      }
    } else {
      const result = await addFavourite(userId, contactId);
      if (result.success) {
        // Update local state
        setContacts(prev => prev.map(c => 
          c.contact_id === contactId ? { ...c, is_favourite: true } : c
        ));
      }
    }
  };

  // ---------- FILTERS ----------
  const safeString = (val) => (val ? String(val) : "");
  let filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      safeString(contact.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.phone).includes(searchTerm);
    
    // Handle category filtering including favourites
    let matchesCategory = true;
    if (selectedCategory === 'favourites') {
      matchesCategory = contact.is_favourite === true;
    } else if (selectedCategory && selectedCategory !== '') {
      matchesCategory = Array.isArray(contact.category_ids) &&
        contact.category_ids.some((id) => String(id) === String(selectedCategory));
    }
    
    return matchesSearch && matchesCategory;
  });

  // Sort contacts alphabetically
  filteredContacts = filteredContacts.sort((a, b) =>
    safeString(a.name).localeCompare(safeString(b.name))
  );


  const renderCategoryBadges = (contact) => {
    if (!Array.isArray(contact.category_ids) || contact.category_ids.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {contact.category_ids.map((id) => {
          const cat = categories.find(c => String(c.category_id ?? c.id) === String(id));
          const name = cat?.category_name || cat?.name || "Unknown";
          return (
            <span key={id} className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-indigo-700 dark:text-indigo-100">
              {name}
            </span>
          );
        })}
      </div>
    );
  };

  // ---------- RENDER ----------
  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main area */}
      <div className="flex-1 p-8 bg-blue-50 dark:bg-[#0d1117] ml-16">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-blue-50 dark:bg-[#0d1117] px-8 py-4 border-b border-slate-200 dark:border-[#30363d]">
          <HeaderSection
            activeTab={activeTab}
            currentUser={currentUser}
            userName={userName}
            profileImageError={profileImageError}
            setProfileImageError={setProfileImageError}
            showUserDropdown={showUserDropdown}
            setShowUserDropdown={setShowUserDropdown}
            onNavigateToProfile={onNavigateToProfile}
            onLogout={onLogout}
            onExport={handleExport}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-8 overflow-y-auto">
        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <>
            {/* Controls */}
            <ContactsControlBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              viewMode={viewMode}
              setViewMode={setViewMode}
              categories={categories}
              contacts={contacts}
              userId={userId}
              onCategoriesChange={fetchCategories}
            />
            {/* Birthdays */}
            <BirthdayReminder contacts={contacts} />

            {/* Contact display */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                {contacts.length === 0 ? "No contacts yet." : "No matches found."}
              </div>
            ) : viewMode === "card" ? (
              <ContactsGrid
                contacts={filteredContacts}
                renderCategoryBadges={renderCategoryBadges}
                toggleFavourite={toggleFavourite}
                handleEditContact={handleEditContact}
                handleDeleteContact={handleDeleteContact}
                safeString={safeString}
              />
            ) : (
              <ContactsList
                contacts={filteredContacts}
                renderCategoryBadges={renderCategoryBadges}
                onToggleFavourite={toggleFavourite}
                onEditContact={handleEditContact}
                onDeleteContact={handleDeleteContact}
                safeString={safeString}
              />
            )}

            {/* Modals */}
            {showAddContact && (
              <ContactForm
                categories={categories}
                userId={userId}
                onSave={handleContactSave}
                onCancel={handleCancelContactForm}
              />
            )}
            {editingContact && (
              <ContactForm
                contact={editingContact}
                categories={categories}
                userId={userId}
                onSave={handleContactSave}
                onCancel={handleCancelContactForm}
              />
            )}
            {showImportModal && (
              <ImportModal
                userId={userId}
                onImportComplete={fetchContacts}
                onClose={handleImportModalClose}
              />
            )}
          </>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="max-w-6xl mx-auto">
            <GroupPanel currentUser={currentUser} />
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <SettingsTab currentUser={currentUser} isDark={isDark} setIsDark={setIsDark} />
        )}

        {/* Tasks */}
        {activeTab === "task" && <TaskPanel />}

        {/* Chat */}
        {activeTab === "chat" && <ChatPanel currentUser={currentUser} />}

        {/* Documents */}
        {activeTab === "documents" && (
          <div>
            <div className="flex gap-2 mb-8">
              <button
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${viewMode === 'my' ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-slate-700' : 'border-transparent text-slate-600 dark:text-slate-300 bg-transparent'}`}
                onClick={() => setViewMode('my')}
              >
                My Documents
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${viewMode === 'shared' ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-slate-700' : 'border-transparent text-slate-600 dark:text-slate-300 bg-transparent'}`}
                onClick={() => setViewMode('shared')}
              >
                Shared Documents
              </button>
            </div>
            {viewMode === "my" ? (
              <DocumentsPanel currentUser={currentUser} />
            ) : (
              <div className="mt-4">
                <SharedDocumentsPanel currentUser={currentUser} />
              </div>
            )}
          </div>
        )}
        </div>
      
      </div>

      {/* Floating Add Contact Button (FAB) - Only show on contacts page */}
      {activeTab === "contacts" && (
        <FloatingActionButton
          show={true}
          onAddContact={() => setShowAddContact(true)}
          onImportContacts={() => setShowImportModal(true)}
        />
      )}
    </div>
  );
};

export default Dashboard;
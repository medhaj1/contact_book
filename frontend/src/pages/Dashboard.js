
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
  import ReceivedDocumentsPanel from '../components/dashboard/ReceivedDocumentsPanel';
  import SharedDocumentsPanel from '../components/dashboard/SharedDocumentsPanel';
  import Sidebar from '../components/dashboard/Sidebar';
  import HeaderSection from '../components/dashboard/HeaderSection';
  import ContactsControlBar from '../components/dashboard/ContactsControlBar';
  import ContactsGrid from '../components/dashboard/ContactsGrid';
  import ContactsList from '../components/dashboard/ContactsList';
  import FloatingActionButton from '../components/dashboard/FloatingActionButton';
  import { addFavourite, removeFavourite } from "../services/favouriteService";
  import { exportContactsCSV, exportContactsVCF } from '../services/importExportService';
  import { getContacts, deleteContact } from '../services/contactService';
  import { getCategories } from '../services/categoryService';
  import { supabase } from '../supabaseClient';

const Dashboard = ({ currentUser, onLogout = () => {} }) => {
  // Handles birthday wish: sets contact, switches tab, sends message
  // Used to force chat refresh
  const [chatRefreshKey, setChatRefreshKey] = useState(0);

    const handleBirthdayWish = async (contact) => {
      // Always find the chat contact with contact_user_id
      let chatContact = contact;
      if (contacts && contact.email) {
        const found = contacts.find(c => c.email === contact.email && c.contact_user_id);
        if (found) chatContact = found;
      }
      if (!chatContact.contact_user_id) {
        alert('Cannot send message: user is not registered.');
        return;
      }
      await sendWishMessage(chatContact);
      setChatRefreshKey(prev => prev + 1);
  };
  const navigate = useNavigate();

  const onNavigateToProfile = () => {
    navigate('/profile');
  };

  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split("@")[0] || "User";
  const userId = currentUser?.id || "unknown";

  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("dashboardSearchTerm") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem("dashboardSelectedCategory") || "");
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("dashboardViewMode") || "card");

  const [showAddContact, setShowAddContact] = useState(() => localStorage.getItem("dashboardShowAddContact") === "true");
  const [editingContact, setEditingContact] = useState(() => {
    const saved = localStorage.getItem("dashboardEditingContact");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("dashboardActiveTab") || "contacts");

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(() => localStorage.getItem("dashboardShowImportModal") === "true");
  const [profileImageError, setProfileImageError] = useState(false);

  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  // Chat integration states
  const [selectedContact, setSelectedContact] = useState(null);

  const handleExport = async (format) => {
    try {
      if (!userId) {
        alert('User not found');
        return;
      }
      const filters = {
        category: selectedCategory,
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getContacts(userId);
      let contacts = result.success ? result.data : [];
      // Fetch user profiles for all contact emails
      const emails = contacts.map(c => c.email).filter(Boolean);
      let profiles = [];
      if (emails.length > 0) {
        const { data: profileData } = await supabase
          .from('user_profile')
          .select('*')
          .in('email', emails);
        profiles = profileData || [];
      }
      // Map contact_user_id for registered users
      contacts = contacts.map(contact => {
        const profile = profiles.find(p => p.email === contact.email);
        return profile ? {
          ...contact,
          contact_user_id: profile.u_id,
          user_profile: profile
        } : contact;
      });
      setContacts(contacts);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
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
    if (activeTab === "documents") {
      setViewMode("my");
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("dashboardSearchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem("dashboardSelectedCategory", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("dashboardViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("dashboardShowAddContact", showAddContact.toString());
  }, [showAddContact]);

  useEffect(() => {
    localStorage.setItem("dashboardEditingContact", JSON.stringify(editingContact));
  }, [editingContact]);

  useEffect(() => {
    localStorage.setItem("dashboardShowImportModal", showImportModal.toString());
  }, [showImportModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(".relative")) setShowUserDropdown(false);
      if (showAddContactDropdown && !event.target.closest(".relative")) setShowAddContactDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showAddContactDropdown]);

  const handleContactSave = async () => {
    await fetchContacts();
    setShowAddContact(false);
    setEditingContact(null);
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
    const contact = contacts.find(c => c.contact_id === contactId);
    const isFav = contact?.is_favourite || false;
    if (isFav) {
      const result = await removeFavourite(userId, contactId);
      if (result.success) {
        setContacts(prev => prev.map(c => c.contact_id === contactId ? { ...c, is_favourite: false } : c));
      }
    } else {
      const result = await addFavourite(userId, contactId);
      if (result.success) {
        setContacts(prev => prev.map(c => c.contact_id === contactId ? { ...c, is_favourite: true } : c));
      }
    }
  };

  const safeString = (val) => (val ? String(val) : "");
  let filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      safeString(contact.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.phone).includes(searchTerm);
    let matchesCategory = true;
    if (selectedCategory === 'favourites') {
      matchesCategory = contact.is_favourite === true;
    } else if (selectedCategory && selectedCategory !== '') {
      matchesCategory = Array.isArray(contact.category_ids) &&
        contact.category_ids.some(id => String(id) === String(selectedCategory));
    }
    return matchesSearch && matchesCategory;
  }).sort((a, b) => safeString(a.name).localeCompare(safeString(b.name)));

  const renderCategoryBadges = (contact) => {
    if (!Array.isArray(contact.category_ids) || contact.category_ids.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {contact.category_ids.map(id => {
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

  const sendWishMessage = async (contact) => {
    if (!contact) return;
  
    try {
      const senderId = currentUser?.id;
      const receiverId = contact.contact_user_id || contact.contact_id;
  
      if (!senderId || !receiverId) {
        console.error('Invalid sender or receiver ID');
        return;
      }
  
      const birthdayMessage = `Happy Birthday, ${contact.name}! 🎉`;
      const msg = {
        sender_id: senderId,
        receiver_id: receiverId,
        content: birthdayMessage,
        timestamp: new Date().toISOString(),
      };
  
      console.log('Sending birthday wish message:', msg);
  
      const { data, error } = await supabase.from('messages').insert(msg).select();
  
      if (error) {
        console.error('Failed to send birthday wish:', error.message);
        return;
      }
  
      if (data && data.length > 0) {
        console.log('Birthday wish message sent successfully:', data[0]);
        // Update chat messages state here if available to show message immediately
        // Example: setMessages(prev => [...prev, data[0]]) if you manage messages state here
      }
    } catch (err) {
      console.error('Error sending birthday wish:', err);
    }
  };
  

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-8 bg-blue-50 dark:bg-[#0d1117] ml-16">
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
        <div className="flex-1 p-8 overflow-y-auto">

          {activeTab === "contacts" && (
            <>
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
              <BirthdayReminder
                contacts={contacts}
                onBirthdayWish={handleBirthdayWish}
              />
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

          {activeTab === 'groups' && (
            <div className="max-w-6xl mx-auto">
              <GroupPanel currentUser={currentUser} />
            </div>
          )}

          {activeTab === "settings" && (
            <SettingsTab currentUser={currentUser} isDark={isDark} setIsDark={setIsDark} />
          )}

          {activeTab === "task" && <TaskPanel />}

          {activeTab === "chat" && (
            <ChatPanel
              currentUser={currentUser}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              chatRefreshKey={chatRefreshKey}
            />
          )}

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
                  Received Documents
                </button>
                <button
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${viewMode === 'sent' ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-slate-700' : 'border-transparent text-slate-600 dark:text-slate-300 bg-transparent'}`}
                  onClick={() => setViewMode('sent')}
                >
                  Shared Documents
                </button>
              </div>
              {viewMode === "my" ? (
                <DocumentsPanel currentUser={currentUser} />
              ) : viewMode === "shared" ? (
                <div className="mt-4">
                  <ReceivedDocumentsPanel currentUser={currentUser} />
                </div>
              ) : (
                <div className="mt-4">
                  <SharedDocumentsPanel currentUser={currentUser} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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

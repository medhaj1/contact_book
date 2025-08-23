import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, Settings, CheckSquare, MessageSquare,
  Grid, List, Plus, Edit2, Trash2, User, LogOut,
  Mail, Phone, Search, Star, Tags
} from "lucide-react";

import ChatPanel from '../components/chat/ChatPanel';

import ContactForm from '../components/dashboard/ContactForm';
import BirthdayReminder from '../components/dashboard/BirthdayReminder';
import TaskPanel from '../components/dashboard/TaskPanel';
import SettingsTab from '../components/dashboard/SettingsTab';
import DocumentsPanel from '../components/dashboard/DocumentsPanel';
import CategoriesPanel from '../components/dashboard/CategoriesPanel';
import ImportModal from '../components/dashboard/ImportModal';
import GroupPanel from '../components/groups/GroupPanel';
import SharedDocumentsPanel from '../components/dashboard/SharedDocumentsPanel';
import { getFavouritesByUser, addFavourite, removeFavourite } from "../services/favouriteService";
import { useBlockedContacts } from "../components/dashboard/BlockedContactsContext";

// Import services
import { getContacts, deleteContact } from '../services/contactService';
import { getCategories } from '../services/categoryService';

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
  const { blockedContacts } = useBlockedContacts();
  const navigate = useNavigate();

  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split("@")[0] || "User";
  const userId = currentUser?.id || "unknown";

  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [contactViewFilter, setContactViewFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    const activeTab = localStorage.getItem("dashboardActiveTab") || "contacts";
    return activeTab === "documents" ? "my" : "card";
  });

  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("dashboardActiveTab") || "contacts"
  );

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // ---------- THEME HANDLING ----------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // ---------- FETCH CONTACTS (with multi-category + favourites) ----------
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
      setCategories(result.success ? result.data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchFavourites = useCallback(async () => {
    if (!userId || userId === "unknown") return;
    const favRes = await getFavouritesByUser(userId);
    if (favRes.success) {
      setFavourites(favRes.data);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && userId !== "unknown") {
      fetchContacts();
      fetchCategories();
      fetchFavourites();
    }
  }, [userId, fetchContacts, fetchCategories, fetchFavourites]);

  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
    // When switching to documents tab, default to 'my' view
    if (activeTab === "documents") {
      setViewMode("my");
    }
  }, [activeTab]);

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
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowAddContact(false);
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Delete this contact?")) {
      const result = await deleteContact(contactId);
      if (result.success) fetchContacts();
    }
  };

  const toggleFavourite = async (contactId) => {
    const isFav = favourites.includes(contactId);
    if (isFav) {
      await removeFavourite(userId, contactId);
      setFavourites((prev) => prev.filter((id) => id !== contactId));
    } else {
      await addFavourite(userId, contactId);
      setFavourites((prev) => [...prev, contactId]);
    }
  };

  // ---------- FILTERS ----------
  const safeString = (val) => (val ? String(val) : "");
  let filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      safeString(contact.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(contact.phone).includes(searchTerm);
    const matchesCategory =
      !selectedCategory ||
      (Array.isArray(contact.category_ids) &&
        contact.category_ids.some((id) => String(id) === String(selectedCategory)));
    return matchesSearch && matchesCategory;
  });

  if (contactViewFilter === "favourites") {
    filteredContacts = filteredContacts.filter((c) =>
      favourites.includes(c.contact_id)
    );
  } else if (contactViewFilter === "all") {
    filteredContacts = filteredContacts.sort((a, b) =>
      safeString(a.name).localeCompare(safeString(b.name))
    );
  }

  // 🎂 todays birthdays (from Code 2)
  const todaysBirthdays = contacts.filter(c => isBirthdayToday(c.birthday));

  // ---------- SIDEBAR (from Code 1) ----------
  const sidebarItems = [

    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'documents', label: 'Documents', icon: BookOpen },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },

  ];

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
      {/* Sidebar collapsible */}
      <div className="fixed left-0 top-0 h-screen bg-white dark:bg-[#161b22] border-r border-slate-200 dark:border-[#30363d] z-30 group hover:w-60 w-16 transition-all duration-200 overflow-hidden flex flex-col">
        <div className="flex flex-col flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-300 my-8 px-4 h-[40px] flex items-center">
            <span className="overflow-hidden whitespace-nowrap transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs">
              Contact Book
            </span>
          </h2>
        </div>
        <nav className="flex flex-col space-y-2 px-2 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center pl-4 py-2 rounded-lg cursor-pointer ${
                  activeTab === item.id
                    ? "bg-blue-100 dark:bg-indigo-300 text-blue-700 dark:text-indigo-900"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                } transition-all duration-100 ease-in-out`}
              >
                <Icon size={20} className="flex-shrink-0 " />
                <span className="ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Dimming overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20"></div>

      {/* Main area */}
      <div className="flex-1 p-8 bg-blue-50 dark:bg-[#0d1117] ml-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#c9d1d9] capitalize">
            {activeTab}
          </h1>
          <div className="relative flex items-center gap-3">
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-[#161b22] hover:shadow-sm transition-all duration-200"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-700 to-blue-400 dark:from-indigo-700 dark:to-indigo-400 rounded-full flex justify-center items-center text-white font-bold overflow-hidden">
                {currentUser?.user_metadata?.image && !profileImageError ? (
                  <img
                    src={currentUser.user_metadata.image}
                    alt={userName}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>

              <span className="text-sm text-slate-600 dark:text-[#c9d1d9] font-medium">
                {userName}
              </span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showUserDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-slate-200 dark:border-[#30363d] py-1 z-50">
                <div
                  className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-[#c9d1d9] hover:text-blue-700 dark:hover:font-semibold dark:hover:text-indigo-200 hover:bg-blue-100 dark:hover:bg-indigo-500/30 cursor-pointer"
                  onClick={() => {
                    navigate("/profile");
                    setShowUserDropdown(false);
                  }}
                >
                  <User size={16} className="mr-2 inline" /> Profile
                </div>
                <div
                  className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-[#c9d1d9] hover:text-blue-700 dark:hover:font-semibold dark:hover:text-red-200 hover:bg-blue-100 dark:hover:bg-red-700/30 cursor-pointer"
                  onClick={onLogout}
                >
                  <LogOut size={16} className="mr-2 inline" /> Logout
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-8 items-center">
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
              <select
                className="pl-6 pr-3 py-2 rounded-xl border text-md dark:bg-[#161b22] dark:border-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                    {c.category_name || c.name}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 rounded-xl border text-md dark:bg-[#161b22] dark:border-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-400 dark:focus:ring-indigo-600 outline-none"
                value={contactViewFilter}
                onChange={(e) => setContactViewFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="favourites">Favourites</option>
              </select>
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

            {/* 🎂 Today's Birthdays */}
            {todaysBirthdays.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col gap-2">
                <div className="font-semibold text-amber-700 flex items-center gap-1">
                  🎂 Birthday{todaysBirthdays.length > 1 ? "s" : ""} Today!
                </div>
                {todaysBirthdays.map((contact) => (
                  <div key={contact.contact_id} className="flex items-center gap-3 text-amber-700">
                    <span className="font-bold">{contact.name}</span>
                    <span className="text-xs">(Today)</span>
                    <span className="text-slate-500 text-sm">{contact.email}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Birthday Reminder */}
            <BirthdayReminder contacts={contacts} />

            {/* Contact display */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                {contacts.length === 0 ? "No contacts yet." : "No matches found."}
              </div>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((c) => {
                  const isFav = favourites.includes(c.contact_id);
                  return (
                    <div
                      key={c.contact_id}
                      className="bg-white dark:text-gray-300 dark:bg-[#161b22] p-6 rounded-2xl border dark:border-[#30363d] hover:shadow-lg scale-100 hover:scale-105 transition transition-transform duration-200 space-y-3 "
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex justify-center items-center font-bold overflow-hidden">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              safeString(c.name).charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{c.name}</h3>
                            {renderCategoryBadges(c)}
                          </div>
                        </div>
                        <button onClick={() => toggleFavourite(c.contact_id)}>
                          <Star size={18} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                        <Mail size={14} /> {c.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                        <Phone size={14} /> {c.phone}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditContact(c)}
                          className="p-2 bg-blue-50 dark:bg-indigo-600/50 text-blue-600 dark:text-indigo-200 rounded-lg hover:bg-blue-100"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c.contact_id)}
                          className="p-2 bg-red-50 dark:bg-red-600/50 text-red-600 rounded-lg dark:text-red-200 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // LIST VIEW
              <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-lg shadow overflow-hidden">
                {filteredContacts.map((c) => {
                  const isFav = favourites.includes(c.contact_id);
                  return (
                    <div
                      key={c.contact_id}
                      className="flex items-center justify-between px-4 py-4 hover:bg-blue-50 dark:hover:bg-gray-800/40 even:bg-slate-50 dark:even:bg-[#30363d]/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-indigo-500 flex items-center justify-center font-bold overflow-hidden">
                          {c.photo_url ? (
                            <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            safeString(c.name).charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-slate-200">{c.name}</div>
                          {renderCategoryBadges(c)}
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 pt-1">
                            <Mail size={14} /> {c.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                            <Phone size={14} /> {c.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 items-center">
                        <button onClick={() => toggleFavourite(c.contact_id)}>
                          <Star size={16} className={isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
                        </button>
                        <button
                          onClick={() => handleEditContact(c)}
                          className="p-1.5 sm:p-2 rounded-full bg-blue-50 dark:bg-indigo-800/70 text-blue-600 dark:text-indigo-100 hover:bg-blue-100 dark:hover:bg-indigo-700"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c.contact_id)}
                          className="p-1.5 sm:p-2 rounded-full bg-red-50 dark:bg-red-800/40 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modals */}
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
            {showImportModal && (
              <ImportModal
                userId={userId}
                onImportComplete={fetchContacts}
                onClose={() => setShowImportModal(false)}
              />
            )}
          </>
        )}

        {/* Categories */}
        {activeTab === "categories" && (
          <CategoriesPanel
            categories={categories}
            contacts={contacts}
            userId={userId}
            onCategoriesChange={fetchCategories}
          />
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

      {/* Floating Add Contact Button (FAB) */}
      {activeTab === "contacts" && (
        <div className="fixed bottom-10 right-10 z-40">
          <div className="relative">
            <button
              onClick={() => setShowAddContactDropdown((prev) => !prev)}
              className="flex w-[70px] h-[70px] items-center px-5 py-3 rounded-full shadow-lg bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold hover:bg-blue-700 dark:from-indigo-800 dark:to-indigo-500 scale-100 hover:scale-110 transition-transform duration-200"
            >
              <Plus size={30}/>
            </button>
            {showAddContactDropdown && (
              <div className="absolute bottom-14 right-0 w-48 bg-white border rounded-lg shadow-lg">
                <div
                  className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    setShowAddContact(true);
                    setShowAddContactDropdown(false);
                  }}
                >
                  Add via Form
                </div>
                <div
                  className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
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
      )}
    </div>
  );
};



export default Dashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Search, Plus, Edit2, Trash2, Users, BookOpen, Settings, LogOut, Camera, X } from 'lucide-react';

// Mock ContactForm component with image support
const ContactForm = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    image: contact?.photo_url || null
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '400px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#334155' }}>
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '2px dashed #cbd5e1'
            }}>
              {formData.image ? (
                <>
                  <img 
                    src={formData.image} 
                    alt="Contact" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(220, 38, 38, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <Camera size={32} color="#94a3b8" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {formData.image ? 'Change Photo' : 'Add Photo'}
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mock CategoryForm component
const CategoryForm = ({ onSave, onCancel }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave(categoryName.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#334155' }}>Add New Category</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ currentUser, onLogout = () => {} }) => {
  const navigate = useNavigate();
  
  // Extract user info from Supabase user object
  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
  const userEmail = currentUser?.email || 'No email';
  const userId = currentUser?.id || 'unknown';
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([
    { category_id: 1, name: 'Family' },
    { category_id: 2, name: 'Friends' },
    { category_id: 3, name: 'Work' },
    { category_id: 4, name: 'Business' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');

  // API base URL
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch contacts from backend
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load contacts when component mounts or userId changes
  useEffect(() => {
    if (userId && userId !== 'unknown') {
      fetchContacts();
    }
  }, [userId]);



  // Contact Management Functions
  const addContact = async (contactData) => {
    try {
      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('user_id', userId);
      
      // If there's an image, convert base64 to file and append
      if (contactData.image) {
        const response = await fetch(contactData.image);
        const blob = await response.blob();
        formData.append('photo', blob, `${contactData.name}.jpg`);
      }

      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Contact added:', result);
        await fetchContacts(); // Refresh the contacts list
        setShowAddContact(false);
      } else {
        const error = await response.json();
        console.error('Failed to add contact:', error);
        alert('Failed to add contact: ' + (error.details || error.error));
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error adding contact: ' + error.message);
    }
  };

  const updateContact = async (contactData) => {
    try {
      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('user_id', userId);
      
      // If there's a new image, convert base64 to file and append
      if (contactData.image && contactData.image.startsWith('data:')) {
        const response = await fetch(contactData.image);
        const blob = await response.blob();
        formData.append('photo', blob, `${contactData.name}.jpg`);
      }

      const response = await fetch(`${API_BASE_URL}/contacts/${editingContact.contact_id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Contact updated:', result);
        await fetchContacts(); // Refresh the contacts list
        setEditingContact(null);
      } else {
        const error = await response.json();
        console.error('Failed to update contact:', error);
        alert('Failed to update contact: ' + (error.details || error.error));
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Error updating contact: ' + error.message);
    }
  };

  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Contact deleted:', result);
          await fetchContacts(); // Refresh the contacts list
        } else {
          const error = await response.json();
          console.error('Failed to delete contact:', error);
          alert('Failed to delete contact: ' + (error.details || error.error));
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error deleting contact: ' + error.message);
      }
    }
  };

  const addCategory = (categoryName) => {
    const newCategory = {
      category_id: Date.now(),
      name: categoryName
    };
    setCategories([...categories, newCategory]);
    setShowAddCategory(false);
  };

  // Filter contacts based on search only (categories removed for now)
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    return matchesSearch;
  });

  // Get category name by ID

  const sidebarItems = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'categories', label: 'Categories', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
  {/* Sidebar */}
  <div className="w-60 bg-white p-6 border-r border-slate-200 flex flex-col">
    <h2 className="text-xl font-semibold text-slate-900 mb-8">Contact Book</h2>
    <nav className="flex-1 space-y-2">
      {sidebarItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <div
            key={item.id}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition text-sm font-medium ${
              isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={18} className="mr-3" />
            {item.label}
          </div>
        );
      })}
    </nav>
    {/* Profile */}
    <div className="mt-auto border-t pt-4">
      <div
        className="flex items-center px-4 py-2 rounded-lg cursor-pointer text-slate-500 hover:bg-blue-50 hover:text-sky-700 text-sm font-medium"
        onClick={() => navigate('/profile')}
      >
        <User size={18} className="mr-3" />
        Profile
      </div>
      <div
        className="flex items-center px-4 py-2 rounded-lg cursor-pointer text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium"
        onClick={onLogout}
      >
        <LogOut size={18} className="mr-3" />
        Logout
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 p-8">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold text-slate-900 capitalize">{activeTab}</h1>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {userName?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-slate-600 font-medium">{userName}</span>
      </div>
    </div>

    {/* Contacts Tab */}
    {activeTab === 'contacts' && (
      <>
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 text-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md text-sm hover:bg-sky-600"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>

        {/* Contact Cards */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">
            Loading contacts...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {contacts.length === 0 ? "No contacts yet. Add your first contact!" : "No contacts match your search criteria."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <div
                key={contact.contact_id}
                className="bg-white border border-slate-200 p-6 rounded-xl transition hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-lg overflow-hidden mr-4">
                    {contact.photo_url ? (
                      <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      contact.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{contact.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Mail size={16} />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Phone size={16} />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="p-2 bg-blue-50 text-sky-600 rounded-md hover:bg-blue-100"
                    onClick={() => setEditingContact(contact)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    onClick={() => deleteContact(contact.contact_id)}
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
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md text-sm hover:bg-sky-600"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.category_id} className="bg-white border border-slate-200 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {contacts.filter(c => c.category_id === category.category_id).length} contacts
              </p>
            </div>
          ))}
        </div>
      </>
    )}

    {/* Settings Tab */}
    {activeTab === 'settings' && (
      <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
          <User size={16} />
          <span>{userName}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Mail size={16} />
          <span>{userEmail}</span>
        </div>
      </div>
    )}
  </div>

  {/* Modals */}
  {showAddContact && (
    <ContactForm
      onSave={addContact}
      onCancel={() => setShowAddContact(false)}
    />
  )}
  {editingContact && (
    <ContactForm
      contact={editingContact}
      onSave={updateContact}
      onCancel={() => setEditingContact(null)}
    />
  )}
  {showAddCategory && (
    <CategoryForm
      onSave={addCategory}
      onCancel={() => setShowAddCategory(false)}
    />
  )}
</div>
);
};

export default Dashboard;
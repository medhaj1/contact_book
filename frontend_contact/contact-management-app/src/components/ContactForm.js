// src/components/ContactForm.jsx
import React, { useState, useEffect } from 'react';

const ContactForm = ({ contact = {}, categories = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', category_id: '', photo: ''
  });

  useEffect(() => {
    if (contact.contact_id) {
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        category_id: contact.category_id || '',
        photo: contact.photo || ''
      });
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files[0]) {
      const reader = new FileReader();
      reader.onload = () => setFormData(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.category_id) {
      return alert('Fill all fields');
    }
    onSave(formData);
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>{contact.contact_id ? 'Edit Contact' : 'Add Contact'}</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
          <select name="category_id" value={formData.category_id} onChange={handleChange} required>
            <option value="">Choose category</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
            ))}
          </select>

          <div style={{ marginTop: '1rem' }}>
            <label>Photo (optional): </label>
            <input name="photo" type="file" accept="image/*" onChange={handleChange} />
            {formData.photo && <img src={formData.photo} alt="preview" style={{ width: '60px', marginTop: '0.5rem', borderRadius: '6px' }} />}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button type="button" onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.saveBtn}>{contact.contact_id ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top:0,left:0,right:0,bottom:0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%', maxWidth: '400px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '2px solid #90caf9'
  },
  saveBtn: {
    backgroundColor: '#42a5f5',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    marginLeft: '0.5rem'
  },
  cancelBtn: {
    backgroundColor: '#cfd8dc',
    color: '#455a64',
    border: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default ContactForm;

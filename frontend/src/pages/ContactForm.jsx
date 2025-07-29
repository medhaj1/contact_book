import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category_id: "",
    birthday: "", // YYYY-MM-DD format
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("contacts").insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category_id: formData.category_id || null,
        birthday: formData.birthday,
      },
    ]);

    if (error) {
      console.error("Error adding contact:", error.message);
      alert("Failed to add contact");
    } else {
      alert("Contact added successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        category_id: "",
        birthday: "",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Add Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="category_id"
          placeholder="Category ID"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded hover:scale-105 transition"
        >
          Save Contact
        </button>
      </form>
    </div>
  );
};

export default ContactForm;


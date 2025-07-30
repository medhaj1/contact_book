import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BirthdayReminder from "./BirthdayReminder";

const BirthdayReminderPage = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    const { data, error } = await supabase
      .from("contacts")
      .select("contact_id, name, birthday");

    if (error) {
      console.error("Error fetching contacts:", error.message);
    } else {
      setContacts(data);
    }
  }

  return (
    <div className="p-6">
      <BirthdayReminder contacts={contacts} />
    </div>
  );
};

export default BirthdayReminderPage;

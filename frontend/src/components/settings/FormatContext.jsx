import React, { createContext, useContext, useState, useEffect } from "react";

const FormatContext = createContext();

export function FormatProvider({ children }) {
  const [nameFormat, setNameFormat] = useState(
    localStorage.getItem("nameFormat") || "first_last"
  );
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem("dateFormat") || "dd_mm_yyyy"
  );

  // keep localStorage synced
  useEffect(() => {
    localStorage.setItem("nameFormat", nameFormat);
  }, [nameFormat]);

  useEffect(() => {
    localStorage.setItem("dateFormat", dateFormat);
  }, [dateFormat]);

  // ✅ helper functions
  function formatContactName(contact) {
    if (!contact) return "";
    const fullName = (contact.name || "").trim();
    const parts = fullName.split(" ");
    
    // If single word, return as-is
    if (parts.length < 2) return fullName;

    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = parts.slice(1, -1).join(" ");

    if (nameFormat === "first_last") {
      return middle ? `${first} ${middle} ${last}` : `${first} ${last}`;
    } else {
      return middle ? `${last}, ${first} ${middle}` : `${last}, ${first}`;
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return dateFormat === "dd_mm_yyyy"
      ? date.toLocaleDateString("en-GB")
      : date.toLocaleDateString("en-US");
  }

  return (
    <FormatContext.Provider
      value={{
        nameFormat,
        setNameFormat,
        dateFormat,
        setDateFormat,
        formatContactName,
        formatDate,
      }}
    >
      {children}
    </FormatContext.Provider>
  );
}

export function useFormat() {
  return useContext(FormatContext);
}
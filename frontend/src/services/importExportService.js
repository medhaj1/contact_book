import { supabase } from '../supabaseClient';

/**
 * Helper: Clean phone number (digits + optional leading '+')
 */
function cleanPhoneNumber(phone) {
  if (!phone) return null;
  const trimmed = phone.trim();
  const cleaned = trimmed.startsWith("+")
    ? "+" + trimmed.slice(1).replace(/\D/g, "")
    : trimmed.replace(/\D/g, "");
  return cleaned;
}

/**
 * Helper: Sanitize string input (trim and normalize)
 */
function sanitizeString(str) {
  if (!str) return null;
  return str.trim();
}

/**
 * Helper: Parse CSV line properly handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
}

/**
 * Parse VCF string to contact objects with sanitization
 */
function parseVcf(vcfString) {
  const contacts = [];
  const cards = vcfString.split("END:VCARD");

  for (const card of cards) {
    const nameRaw = card.match(/FN:(.+)/)?.[1]?.trim();
    let phoneRaw = card.match(/TEL[^:]*:(.+)/)?.[1]?.trim();
    let emailRaw = card.match(/EMAIL[^:]*:(.+)/)?.[1]?.trim();

    // Extract PHOTO base64 block - support multiline base64 after PHOTO line
    let photoBase64 = null;
    const photoMatch = card.match(/PHOTO[^:]*:(.*)/);
    if (photoMatch) {
      const lines = card.split("\n");
      const photoStartIndex = lines.findIndex(line => line.startsWith("PHOTO"));
      if (photoStartIndex >= 0) {
        let base64Lines = [];
        let lineIndex = photoStartIndex;
        while (++lineIndex < lines.length && lines[lineIndex] && !lines[lineIndex].includes(":")) {
          base64Lines.push(lines[lineIndex].trim());
        }
        photoBase64 = photoMatch[1].trim() + base64Lines.join("");
      }
    }

    if (nameRaw && phoneRaw) {
      contacts.push({
        name: nameRaw,
        phone: phoneRaw,
        email: emailRaw || null,
        photoBase64
      });
    }
  }
  return contacts;
}

/**
 * Convert base64 to blob
 */
function base64ToBlob(base64, mimeType = 'image/jpeg') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Import Contacts from CSV or VCF file
 */
export const importContacts = async (file, userId) => {
  try {
    if (!file) {
      throw new Error("No file uploaded");
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const fileContent = await file.text();
    let contacts = [];

    // Get user's name from the user_profile table
    const { data: userData, error: userError } = await supabase
      .from("user_profile")
      .select("name")
      .eq("u_id", userId)
      .single();

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    const userName = userData.name;

    if (ext === "csv") {
      const lines = fileContent.split("\n").filter(line => line.trim() !== "");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const contact = {};
        for (let j = 0; j < headers.length; j++) {
          contact[headers[j]] = values[j];
        }

        contact.user_id = userId;
        contact.userName = userName;
        contacts.push(contact);
      }

      // Handle photo uploads for CSV contacts with base64 images
      for (const contact of contacts) {
        if (contact.photo_base64 && contact.photo_base64.trim()) {
          try {
            let base64String = contact.photo_base64.replace(/^data:image\/\w+;base64,/, "");
            const imgBlob = base64ToBlob(base64String);
            const fileName = `${contact.name.replace(/\s+/g, '_')}-${Date.now()}.jpg`;
            const filePath = `users/${userName}/${contact.name}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("contact-images")
              .upload(filePath, imgBlob, {
                contentType: "image/jpeg"
              });

            if (uploadError) {
              console.error("Failed to upload photo for contact", contact.name, uploadError.message);
            } else {
              const { data: publicData } = supabase.storage
                .from("contact-images")
                .getPublicUrl(filePath);
              contact.photo_url = publicData.publicUrl;
            }
          } catch (photoError) {
            console.error("Error processing photo for", contact.name, photoError);
          }
          // Remove the base64 data as it's no longer needed
          delete contact.photo_base64;
        }
      }
    } else if (ext === "vcf") {
      contacts = parseVcf(fileContent);
      contacts = contacts.map(c => ({ ...c, user_id: userId }));

      // Handle photo uploads for VCF contacts
      for (const contact of contacts) {
        if (contact.photoBase64) {
          try {
            let base64String = contact.photoBase64.replace(/^data:image\/\w+;base64,/, "");
            const imgBlob = base64ToBlob(base64String);
            const fileName = `${contact.name.replace(/\s+/g, '_')}-${Date.now()}.jpg`;
            const filePath = `users/${userName}/${contact.name}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("contact-images")
              .upload(filePath, imgBlob, {
                contentType: "image/jpeg"
              });

            if (uploadError) {
              console.error("Failed to upload photo for contact", contact.name, uploadError.message);
            } else {
              const { data: publicData } = supabase.storage
                .from("contact-images")
                .getPublicUrl(filePath);
              contact.photo_url = publicData.publicUrl;
            }
          } catch (photoError) {
            console.error("Error processing photo for", contact.name, photoError);
          }
        }
      }
    } else {
      throw new Error("Unsupported file type. Please use CSV or VCF files.");
    }

    // Filter and format for Supabase
    const validContacts = contacts.filter(c => c.name && c.phone && c.user_id);
    if (validContacts.length === 0) {
      throw new Error("No valid contacts found to import.");
    }

    const supabaseInserts = validContacts.map(c => ({
      name: sanitizeString(c.name),
      email: c.email ? sanitizeString(c.email) : null,
      phone: cleanPhoneNumber(c.phone),
      birthday: c.birthday && /^\d{4}-\d{2}-\d{2}$/.test(c.birthday) ? c.birthday : null,
      category_id: c.category_id ? String(sanitizeString(c.category_id)) : null,
      user_id: c.user_id,
      photo_url: c.photo_url || null
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from("contact")
      .insert(supabaseInserts)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert contacts: ${insertError.message}`);
    }

    return { success: true, message: "Contacts imported successfully", count: insertedData.length, data: insertedData };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Export Contacts to CSV (Optimized with Database Function)
 */
export const exportContactsCSV = async (userId, filters = {}) => {
  try {
    const { category, selectedContactIds } = filters;
    let contacts = [];

    if (selectedContactIds && selectedContactIds.length > 0) {
      // Export only selected contacts
      const { data: selectedContacts, error } = await supabase
        .from('contact')
        .select('*')
        .eq('user_id', userId)
        .in('contact_id', selectedContactIds);

      if (error) {
        throw new Error(`Failed to fetch selected contacts: ${error.message}`);
      }
      contacts = selectedContacts || [];
    } else {
      // Use database function for efficient category filtering
      const { data: allContacts, error } = await supabase.rpc('get_contacts_by_category', {
        user_id_param: userId,
        category_filter: category || null  // Pass category ID or 'favourites' or null for all
      });

      if (error) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }
      contacts = allContacts || [];
    }
    
    if (!contacts.length) {
      throw new Error("No contacts found");
    }

    // Convert photo URLs to base64 for each contact
    const processedContacts = await Promise.all(
      contacts.map(async (contact) => {
        const processedContact = { ...contact };
        
        // Convert photo_url to base64 if it exists
        if (contact.photo_url) {
          try {
            const response = await fetch(contact.photo_url);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
              const type = contact.photo_url.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
              processedContact.photo_base64 = `data:image/${type.toLowerCase()};base64,${base64}`;
              // Remove the original URL since we now have base64
              delete processedContact.photo_url;
            } else {
              console.warn("Failed to fetch photo for", contact.name);
              processedContact.photo_base64 = '';
              delete processedContact.photo_url;
            }
          } catch (photoError) {
            console.warn("Failed to convert photo to base64 for", contact.name, photoError);
            processedContact.photo_base64 = '';
            delete processedContact.photo_url;
          }
        } else {
          processedContact.photo_base64 = '';
        }
        
        return processedContact;
      })
    );

    // Define CSV fields (replace photo_url with photo_base64)
    const fields = ["name", "phone", "email", "birthday", "category_ids", "photo_base64"];
    const lines = [fields.join(',')];
    
    console.log('CSV Export - Final filtered contacts count:', processedContacts.length);
    console.log('CSV Export - Filtered contacts:', processedContacts.map(c => ({ name: c.name, category_ids: c.category_ids })));
    
    processedContacts.forEach(c => {
      lines.push(
        fields.map(f => {
          let value = c[f] ?? '';
          // Handle array fields (like category_ids)
          if (Array.isArray(value)) {
            value = value.join(';');
          }
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      );
    });
    const csv = lines.join('\n');

    // Create filename with timestamp
    const exportType = selectedContactIds && selectedContactIds.length > 0 ? 'selected' : 'filtered';
    const safeName = `contacts_${exportType}_${userId}_${new Date().toISOString().slice(0, 10)}.csv`;

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: "CSV export completed successfully" };
  } catch (error) {
    console.error("CSV Export error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Export Contacts to VCF (Optimized with Database Function)
 */
export const exportContactsVCF = async (userId, filters = {}) => {
  try {
    const { category, selectedContactIds } = filters;
    let contacts = [];

    if (selectedContactIds && selectedContactIds.length > 0) {
      // Export only selected contacts
      const { data: selectedContacts, error } = await supabase
        .from('contact')
        .select('*')
        .eq('user_id', userId)
        .in('contact_id', selectedContactIds);

      if (error) {
        throw new Error(`Failed to fetch selected contacts: ${error.message}`);
      }
      contacts = selectedContacts || [];
    } else {
      // Use database function for efficient category filtering
      const { data: allContacts, error } = await supabase.rpc('get_contacts_by_category', {
        user_id_param: userId,
        category_filter: category || null  // Pass category ID or 'favourites' or null for all
      });
        
      if (error) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }
      contacts = allContacts || [];
    }
    
    if (!contacts.length) {
      throw new Error("No contacts found");
    }

    // Generate VCF content
    let vcfContent = '';
    for (const c of contacts) {
      vcfContent += 'BEGIN:VCARD\n';
      vcfContent += 'VERSION:3.0\n';
      if (c.name) vcfContent += `FN:${c.name}\n`;
      if (c.email) vcfContent += `EMAIL:${c.email}\n`;
      if (c.phone) vcfContent += `TEL:${c.phone}\n`;
      if (c.birthday) {
        const date = new Date(c.birthday);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        vcfContent += `BDAY:${year}${month}${day}\n`;
      }

      // Embed photo if available
      if (c.photo_url) {
        try {
          const response = await fetch(c.photo_url);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const type = c.photo_url.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
            vcfContent += `PHOTO;ENCODING=BASE64;TYPE=${type}:${base64}\n`;
          }
        } catch (photoError) {
          console.warn("Failed to embed photo for", c.name, photoError);
        }
      }

      vcfContent += 'END:VCARD\n';
    }

    // Create filename with timestamp
    const exportType = selectedContactIds && selectedContactIds.length > 0 ? 'selected' : 'filtered';
    const safeName = `contacts_${exportType}_${userId}_${new Date().toISOString().slice(0, 10)}.vcf`;

    // Create and download file
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: "VCF export completed successfully" };
  } catch (error) {
    console.error("VCF Export error:", error);
    return { success: false, error: error.message };
  }
};

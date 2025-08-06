import express from "express";
import multer from "multer";
import supabase from "../config/supabase.js";
import path from "path";
import { Buffer } from 'buffer'
import sharp from "sharp";
import vCardsJS from 'vcards-js';
import fetch from 'node-fetch';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


/**
 * Helper: Clean phone number (digits + optional leading '+')
 */
function cleanPhoneNumber(phone) {
  if (!phone) return null;
  const trimmed = phone.trim();
  // Keep leading '+' if present, else only digits
  const cleaned = trimmed.startsWith("+")
    ? "+" + trimmed.slice(1).replace(/\D/g, "")
    : trimmed.replace(/\D/g, "");
  return cleaned;
}

async function enhanceContactImage(base64Photo, options = {}) {
  if (!base64Photo) throw new Error("No photo provided");

  const imgBuffer = Buffer.from(base64Photo, 'base64');

  // Default processing options, overridable
  const {
    width = 300,
    height = 300,
    fit = "cover",
    quality = 85
  } = options;

  // Pipe through Sharp for refinement and enhancement
  return await sharp(imgBuffer)
    .resize(width, height, { fit }) // Crop to square for uniformity
    .modulate({ brightness: 1.05, contrast: 1.08, saturation: 1.1 }) // subtle clarity boost
    .sharpen() // enhance edge clarity
    //.normalize() // Uncomment if you want histogram balance; optional
    .jpeg({ quality }) // Set output format and quality
    .toBuffer();
}

/**
 * Helper: Sanitize string input (trim and normalize)
 */
function sanitizeString(str) {
  if (!str) return null;
  return str.trim();
}


/**
 * Parse VCF string to contact objects with sanitization
 */
function parseVcf(vcfString) {
  const contacts = [];
  // Split cards by `END:VCARD`
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
        // Base64 data often starts on PHOTO line after colon, then continues on subsequent lines until an empty or another property
        let base64Lines = [];
        let lineIndex = photoStartIndex;
        // Extract lines until next property or empty line
        while (++lineIndex < lines.length && lines[lineIndex] && !lines[lineIndex].includes(":")) {
          base64Lines.push(lines[lineIndex].trim());
        }
        // Combine first line data and subsequent lines
        photoBase64 = photoMatch[1].trim() + base64Lines.join("");
      }
    }

    // sanitize/clean phone, email etc. as needed

    if (nameRaw && phoneRaw) {
      contacts.push({
        name: nameRaw,
        phone: phoneRaw,
        email: emailRaw || null,
        photoBase64 // Include the base64 photo string to be handled later
      });
    }
  }
  return contacts;
}



/**
 * Add Contact with Optional Photo Upload
 */
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    console.log("➡️ POST /contacts called");
    console.log("Request Body:", req.body);
    console.log("User ID received:", req.body.user_id);
    console.log("➡️ POST /contacts called");
    console.log("Request Body:", req.body);
    console.log("User ID received:", req.body.user_id);
    const { name, email, phone, user_id, birthday, category_id } = req.body;

    // Sanitize inputs
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanPhone = cleanPhoneNumber(phone);
    const cleanCategoryId = category_id ? sanitizeString(category_id) : null;

    // Validate and format birthday
    let formattedBirthday = null;
    if (birthday && birthday.trim()) {
      const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (birthdayRegex.test(birthday.trim())) {
        const date = new Date(birthday.trim());
        if (!isNaN(date.getTime())) {
          formattedBirthday = birthday.trim();
        } else {
          return res.status(400).json({ error: "Invalid birthday date format" });
        }
      } else {
        return res.status(400).json({ error: "Birthday must be in YYYY-MM-DD format" });
      }
    }

    let photoUrl = null;

    if (req.file) {
      // Get user's name from the users table
      const { data: userData, error: userError } = await supabase
        .from("user_profile")
        .select("name")
        .eq("u_id", user_id)
        .single();

      if (userError) {
        console.log("User Fetch Error:", userError);
        return res.status(500).json({ error: "Failed to fetch user data", details: userError.message });
      }

      console.log("✅ Found user:", userData);
      const userName = userData.name;
      const ext = req.file.originalname.split(".").pop();
      const fileName = `${cleanName}.${ext}`;
      const filePath = `users/${userName}/${cleanName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("contact-images")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        return res.status(500).json({ error: "Upload failed", details: uploadError.message });
      }

      const { data: publicData } = supabase.storage
        .from("contact-images")
        .getPublicUrl(filePath);

      photoUrl = publicData.publicUrl;
    }

    const { data: insertData, error: insertError } = await supabase
      .from("contact")
      .insert([{
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        photo_url: photoUrl,
        user_id,
        birthday: formattedBirthday,
        category_id: cleanCategoryId ? String(cleanCategoryId) : null
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Insert Error:", insertError); // ✅ Log the full error
      return res.status(500).json({ error: "Failed to add contact", details: insertError.message });
    }

    res.status(201).json({ message: "Contact added successfully.", data: insertData });
  } catch (err) {
    console.error("Add Contact Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * Get All Contacts for a User
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("contact")
    .select("*")
    .eq("user_id", userId)
    .order("contact_id", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
  }

  res.status(200).json(data);
});


/**
 * Update Contact (with optional new image)
 */
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, user_id, birthday, category_id } = req.body;

    // Sanitize inputs
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanPhone = cleanPhoneNumber(phone);
    const cleanCategoryId = category_id ? sanitizeString(category_id) : null;

    // Validate and format birthday
    let formattedBirthday = null;
    if (birthday && birthday.trim()) {
      const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (birthdayRegex.test(birthday.trim())) {
        const date = new Date(birthday.trim());
        if (!isNaN(date.getTime())) {
          formattedBirthday = birthday.trim();
        } else {
          return res.status(400).json({ error: "Invalid birthday date format" });
        }
      } else {
        return res.status(400).json({ error: "Birthday must be in YYYY-MM-DD format" });
      }
    } else if (birthday === '') {
      // Handle empty string as null
      formattedBirthday = null;
    }

    let photoUrl = null;

    if (req.file) {
      const { data: oldContact, error: fetchError } = await supabase
        .from("contact")
        .select("photo_url")
        .eq("contact_id", id)
        .eq("user_id", user_id)
        .single();

      if (fetchError) {
        return res.status(500).json({ error: "Failed to fetch old contact", details: fetchError.message });
      }

      // Get user's name from the user_profile table
      const { data: userData, error: userError } = await supabase
        .from("user_profile")
        .select("name")
        .eq("u_id", user_id)
        .single();

      if (userError) {
        return res.status(500).json({ error: "Failed to fetch user data", details: userError.message });
      }

      const userName = userData.name;

      // Delete old photo if exists
      if (oldContact?.photo_url) {
        const fullPath = new URL(oldContact.photo_url).pathname;
        const pathToDelete = decodeURIComponent(
          fullPath.replace("/storage/v1/object/public/contact-images/", "")
        );

        if (pathToDelete) {
          const { error: deleteOldError } = await supabase.storage
            .from("contact-images")
            .remove([pathToDelete]);

          if (deleteOldError) {
            console.warn("Failed to delete old image:", deleteOldError.message);
          }
        }
      }

      const ext = req.file.originalname.split(".").pop();
      const fileName = `${cleanName}-${Date.now()}.${ext}`;
      const filePath = `users/${userName}/${cleanName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("contact-images")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        return res.status(500).json({ error: "Upload failed", details: uploadError.message });
      }

      const { data: publicData } = supabase.storage
        .from("contact-images")
        .getPublicUrl(filePath);

      photoUrl = publicData.publicUrl;
    }

    // Build update object with sanitized data
    const updateFields = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      category_id: cleanCategoryId ? String(cleanCategoryId) : null,
    };

    // Handle birthday separately
    if (formattedBirthday !== null) {
      updateFields.birthday = formattedBirthday;
    } else {
      updateFields.birthday = null;
    }

    if (photoUrl) updateFields.photo_url = photoUrl;

    // Debug logging
    // Try to update with explicit date casting if birthday is present
    const { data: updatedData, error: updateError } = await supabase
      .from("contact")
      .update(updateFields)
      .eq("contact_id", id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      console.error("Update error code:", updateError.code);
      console.error("Update error message:", updateError.message);
      console.error("Update error details:", updateError.details);
      return res.status(500).json({ error: "Update failed", details: updateError.message });
    }

    res.status(200).json({ message: "Contact updated successfully.", data: updatedData });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * Delete Contact
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Fetch contact to get photo URL
  const { data: contactData, error: fetchError } = await supabase
    .from("contact")
    .select("photo_url")
    .eq("contact_id", id)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: "Failed to fetch contact", details: fetchError.message });
  }

  // If contact had a photo, delete it from Supabase storage
  if (contactData?.photo_url) {
    const fullPath = new URL(contactData.photo_url).pathname;
    const pathToDelete = decodeURIComponent(
      fullPath.replace("/storage/v1/object/public/contact-images/", "")
    );

    if (pathToDelete) {
      const { error: deleteError } = await supabase.storage
        .from("contact-images")
        .remove([pathToDelete]);

      if (deleteError) {
        console.warn("Failed to delete image:", deleteError.message);
      }
    }
  }

  // Delete contact from DB
  const { error: deleteDbError } = await supabase
    .from("contact")
    .delete()
    .eq("contact_id", id);

  if (deleteDbError) {
    return res.status(500).json({ error: "Delete failed", details: deleteDbError.message });
  }

  res.status(200).json({ message: "Contact and image deleted successfully." });
});



/**
 * Import Contacts (CSV or VCF)
 */
router.post("/import", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const ext = path.extname(file.originalname).toLowerCase();
  const fileBuffer = file.buffer.toString("utf-8");
  let contacts = [];

  try {
    if (ext === ".csv") {
      const lines = fileBuffer.split("\n").filter(line => line.trim() !== "");
      const headers = lines[0].split(",").map(h => h.trim());

      const { user_id: postedUserId } = req.body;
      if (!postedUserId) {
        return res.status(400).json({ error: "user_id is required in form-data" });
      }

      // Fetch user's name from the user_profile table for CSV imports too
      const { data: userData, error: userError } = await supabase
        .from("user_profile")
        .select("name")
        .eq("u_id", postedUserId)
        .single();

      if (userError) {
        return res.status(500).json({ error: "Failed to fetch user data", details: userError.message });
      }

      const userName = userData.name;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        if (values.length !== headers.length) continue;

        const contact = {};
        for (let j = 0; j < headers.length; j++) {
          contact[headers[j]] = values[j];
        }

        // If contact's user_id is missing or empty, assign posted user_id
        if (!contact.user_id) {
          contact.user_id = postedUserId;
        }

        // Add userName for potential future photo handling
        contact.userName = userName;
        
        contacts.push(contact);
      }
    } else if (ext === ".vcf") {
      contacts = parseVcf(fileBuffer);

      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
      }

      // Fetch user's name from the user_profile table
      const { data: userData, error: userError } = await supabase
        .from("user_profile")
        .select("name")
        .eq("u_id", user_id)
        .single();

      if (userError) {
        return res.status(500).json({ error: "Failed to fetch user data", details: userError.message });
      }

      const userName = userData.name;

      contacts = contacts.map(c => ({ ...c, user_id }));
      for (const contact of contacts) {
        if (contact.photoBase64) {
          let base64String = contact.photoBase64.replace(/^data:image\/\w+;base64,/, "");
          const imgBuffer = await enhanceContactImage(base64String);
          const fileName = `${contact.name.replace(/\s+/g, '_')}-${Date.now()}.jpg`;

          const filePath = `users/${userName}/${contact.name}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("contact-images")
            .upload(filePath, imgBuffer, {
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
        }
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Filter + format for Supabase
    const validContacts = contacts.filter(c => c.name && c.phone && c.user_id);
    if (validContacts.length === 0) {
      return res.status(400).json({ error: "No valid contacts found to import." });
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
      return res.status(500).json({ error: "Failed to insert contacts", details: insertError.message });
    }

    res.status(201).json({ message: "Contacts imported", count: insertedData.length });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: "Failed to import contacts" });
  }
});

// CSV Export Route
router.get("/export/csv/:userId", async (req, res) => {
  const { userId } = req.params;
  const { search = '', category, hasBirthday, filename } = req.query;

  // Base query: user’s contacts
  let query = supabase
    .from("contact")
    .select("*")
    .eq("user_id", userId);

  if (category) {
    query = query.eq("category_id", category);
  }

  const { data: contacts, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  if (!contacts.length) return res.status(404).json({ error: "No contacts found" });

  // In-memory filters
  let filtered = contacts;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c =>
      (c.name?.toLowerCase().includes(s)) ||
      (c.email?.toLowerCase().includes(s)) ||
      (c.phone?.includes(s))
    );
  }
  if (hasBirthday === '1') {
    filtered = filtered.filter(c => !!c.birthday);
  }

  // Define CSV fields
  const fields = ["name","phone","email","birthday","category_id","photo_url"];
  const lines = [fields.join(',')];
  filtered.forEach(c => {
    lines.push(
      fields.map(f => `"${(c[f] ?? '').toString().replace(/"/g,'""')}"`).join(',')
    );
  });
  const csv = lines.join('\n');

  // Sanitize or default filename
  const safeName = filename?.trim()
    ? filename.trim().replace(/[^a-z0-9_\-\.]/gi,'_')
    : `contacts_${userId}_${new Date().toISOString().slice(0,10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.send(csv);
});


// VCF Export Route with Photo Embedding
router.get("/export/vcf/:userId", async (req, res) => {
  const { userId } = req.params;
  const { search = '', category, hasBirthday, filename } = req.query;

  // Base query
  let query = supabase
    .from("contact")
    .select("*")
    .eq("user_id", userId);
  if (category) query = query.eq("category_id", category);

  const { data: contacts, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  if (!contacts.length) return res.status(404).json({ error: "No contacts found" });

  // In-memory filters
  let filtered = contacts;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c =>
      (c.name?.toLowerCase().includes(s)) ||
      (c.email?.toLowerCase().includes(s)) ||
      (c.phone?.includes(s))
    );
  }
  if (hasBirthday === '1') {
    filtered = filtered.filter(c => !!c.birthday);
  }

  // Generate VCF content
  let vcfContent = '';
  for (const c of filtered) {
    const vCard = vCardsJS();
    vCard.firstName = c.name || '';
    if (c.email) vCard.email = c.email;
    if (c.phone) vCard.cellPhone = c.phone;
    if (c.birthday) vCard.birthday = new Date(c.birthday);

    // Embed photo if available
    if (c.photo_url) {
      try {
        const resp = await fetch(c.photo_url);
        if (resp.ok) {
          const buf = Buffer.from(await resp.arrayBuffer());
          const type = /\.png$/i.test(c.photo_url) ? 'PNG' : 'JPEG';
          vCard.photo.embedFromBuffer(buf, type);
        }
      } catch {
        // skip on error
      }
    }

    vcfContent += vCard.getFormattedString() + "\n";
  }

  // Sanitize or default filename
  const safeName = filename?.trim()
    ? filename.trim().replace(/[^a-z0-9_\-\.]/gi,'_')
    : `contacts_${userId}_${new Date().toISOString().slice(0,10)}.vcf`;

  res.setHeader('Content-Type', 'text/vcard');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.send(vcfContent);
});



export default router;

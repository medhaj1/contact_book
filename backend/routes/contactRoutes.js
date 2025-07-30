import express from "express";
import multer from "multer";
import supabase from "../config/supabase.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Add Contact with Optional Photo Upload
 */
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, phone, user_id, birthday, category_id } = req.body;
    
    // Validate and format birthday
    let formattedBirthday = null;
    if (birthday && birthday.trim()) {
      // Ensure the birthday is in YYYY-MM-DD format for the database
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
        return res.status(500).json({ error: "Failed to fetch user data", details: userError.message });
      }

      const userName = userData.name;
      const ext = req.file.originalname.split(".").pop();
      const fileName = `${name}.${ext}`;
      const filePath = `users/${userName}/${name}/${fileName}`;

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

    const { data:insertData, error: insertError } = await supabase
      .from("contact")
      .insert([{ 
        name, 
        email, 
        phone, 
        photo_url: photoUrl, 
        user_id: user_id,
        birthday: formattedBirthday,
        category_id: category_id ? String(category_id) : null
      }])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: "Failed to add contact", details: insertError.message });
    }

    res.status(201).json({ message: "Contact added successfully.",data:insertData });
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
    
    // Debug incoming data
    console.log("Incoming request body:", req.body);
    console.log("Birthday value:", birthday, "Type:", typeof birthday);
    
    // Validate and format birthday
    let formattedBirthday = null;
    if (birthday && birthday.trim()) {
      // Ensure the birthday is in YYYY-MM-DD format for the database
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

      // 👇 Delete old photo if exists
    console.log(oldContact)
    if (oldContact?.photo_url) {
    const fullPath = new URL(oldContact.photo_url).pathname; // gives /storage/v1/object/public/contact-images/users/1/Virat%20Kohli/Virat%20Kohli.jpg
    const pathToDelete = decodeURIComponent(
       fullPath.replace("/storage/v1/object/public/contact-images/", "")
      );
    console.log("Old photo path to delete:", pathToDelete);


    if (pathToDelete) {
      const { error: deleteOldError } = await supabase.storage
        .from("contact-images")
        .remove([pathToDelete]);

      if (deleteOldError) {
        console.warn("Failed to delete old image:", deleteOldError.message);
      }
      else{
        console.log("Old image deleted successfully")
      }
    }
  }
      const ext = req.file.originalname.split(".").pop();
      const fileName = `${name}-${Date.now()}.${ext}`;
      const filePath = `users/${userName}/${name}/${fileName}`;

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

    // Build update object with proper type handling
    const updateFields = {
      name,
      email,
      phone,
      category_id: category_id ? String(category_id) : null
    };
    
    // Handle birthday separately to ensure proper date type
    if (formattedBirthday !== null) {
      updateFields.birthday = formattedBirthday;
    } else {
      updateFields.birthday = null;
    }
    
    if (photoUrl) updateFields.photo_url = photoUrl;

    // Debug logging
    console.log("Update fields:", updateFields);
    console.log("Birthday type:", typeof formattedBirthday, "Value:", formattedBirthday);

    // Try to update with explicit date casting if birthday is present
    let query = supabase
      .from("contact")
      .update(updateFields)
      .eq("contact_id", id)
      .eq("user_id", user_id)
      .select()
      .single();

    const { data:updatedData, error: updateError } = await query;

    if (updateError) {
      console.error("Supabase update error:", updateError);
      console.error("Update error code:", updateError.code);
      console.error("Update error message:", updateError.message);
      console.error("Update error details:", updateError.details);
      return res.status(500).json({ error: "Update failed", details: updateError.message });
    }

    res.status(200).json({ message: "Contact updated successfully.",data:updatedData });
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
        const fullPath = new URL(contactData.photo_url).pathname; // gives /storage/v1/object/public/contact-images/users/1/Virat%20Kohli/Virat%20Kohli.jpg
        const pathToDelete = decodeURIComponent(
        fullPath.replace("/storage/v1/object/public/contact-images/", "")
      );
    console.log("Old photo path to delete:", pathToDelete);

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


export default router;

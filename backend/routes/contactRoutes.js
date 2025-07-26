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
    const { name, email, phone, user_id } = req.body;
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
      .insert([{ name, email, phone, photo_url: photoUrl, user_id: user_id }])
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
    const { name, email, phone, user_id } = req.body;
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

    const updateFields = {
      name,
      email,
      phone,
    };
    if (photoUrl) updateFields.photo_url = photoUrl;

    const { data:updatedData,error: updateError } = await supabase
      .from("contact")
      .update(updateFields)
      .eq("contact_id", id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (updateError) {
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

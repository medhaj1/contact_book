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
    const { name, email, phone, userId } = req.body;
    let photoUrl = null;

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `users/${userId}/${fileName}`;

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

    const { error: insertError } = await supabase
      .from("contacts")
      .insert([{ name, email, phone, photo_url: photoUrl, user_id: userId }]);

    if (insertError) {
      return res.status(500).json({ error: "Failed to add contact", details: insertError.message });
    }

    res.status(201).json({ message: "Contact added successfully." });
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
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });

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
    const { name, email, phone, userId } = req.body;
    let photoUrl = null;

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `users/${userId}/${fileName}`;

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

    const { error: updateError } = await supabase
      .from("contacts")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      return res.status(500).json({ error: "Update failed", details: updateError.message });
    }

    res.status(200).json({ message: "Contact updated successfully." });
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

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Delete failed", details: error.message });
  }

  res.status(200).json({ message: "Contact deleted successfully." });
});

export default router;

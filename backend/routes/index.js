import express from "express";
import multer from "multer";
import supabase from "../config/supabase.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const userId = "guest"; // or req.user?.id if using auth
    const file = req.file;
    const ext = file.originalname.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `users/${userId}/${fileName}`;



    const { error: uploadError } = await supabase.storage
      .from("contact-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: "Upload failed", details: uploadError.message });
    }

    const { data: publicData } = supabase.storage
      .from("contact-images")
      .getPublicUrl(filePath);

    res.status(200).json({
      imageUrl: publicData.publicUrl,
      path: filePath,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

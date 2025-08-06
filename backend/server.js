import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use("/contacts", contactRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send("Server error");
});

app.listen(5050, () => console.log("Server running on port 5050"));
console.log('Using Supabase Key:', process.env.SUPABASE_KEY);

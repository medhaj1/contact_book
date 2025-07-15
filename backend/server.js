import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import uploadRouter from "./routes/index.js"; // ✅ Import the route



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static frontend (upload.html)
app.use(express.static(path.join(__dirname, "public")));

// Use your upload route
app.use("/", uploadRouter); // or app.use("/api", uploadRouter)

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});

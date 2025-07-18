import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/users", userRoutes);
app.use("/contacts", contactRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));

import express from "express";
import bodyParser from "body-parser";

import contactRoutes from "./routes/contactRoutes.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/contacts", contactRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));

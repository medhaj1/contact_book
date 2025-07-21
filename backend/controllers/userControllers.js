import supabase from "../config/supabase.js"; // make sure file extension is added if using ES Modules

export const addUser = async (req, res) => {
  const { name, phone, email, address } = req.body;

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, phone, email, address }]);

  if (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: "User added successfully", user: data });
};

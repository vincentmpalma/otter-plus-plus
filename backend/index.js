require("dotenv").config(); // load env vars

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    // Try to list auth providers as a quick check
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    res.json({
      ok: !error,
      supabaseStatus: error ? error.message : "connected"
    });
  } catch (err) {
    res.json({ ok: false, supabaseStatus: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

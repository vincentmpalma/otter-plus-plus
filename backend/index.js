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


// middlewear functiuon -- will move to its own file
async function requireUser(req, res, next){ //req is the incoming requestm, res will be response object, and next is fo the middlewear
  const auth = req.headers.authorization || ""; // getting auth jwt token from request, if doesnt exist put an empty string
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null; // pull out token from Bearer type
  if (!token) return res.status(401).json({ error: "Missing token" }); // if no token return from middlewear with 401

  const { data, error } = await supabase.auth.getUser(token); // use supabase's api to get repsonse object with either the user or error
  if (error || !data?.user) return res.status(401).json({ error: "Invalid token" }); // if error or no user token is invalid

  req.user = data.user; // put user data in request object so we can use it in the route
  next();
}

app.get("/api/me", requireUser, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});


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

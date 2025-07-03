const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Routes = require("./routes/route.ts");

const app = express();
const PORT = 5000; // Use your port directly

// 👇 Hardcoded MongoDB connection string
const MONGO_URL = "mongodb+srv://Farhan555:Farhan555@school.mpetrpe.mongodb.net/SchoolDB?retryWrites=true&w=majority";

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Connect to MongoDB directly
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Use your routes
app.use("/", Routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

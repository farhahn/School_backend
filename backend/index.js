const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const app = express();

const Routes = require("./routes/route.ts");

const PORT = process.env.PORT || 5000;

// ✅ 1. Use built-in JSON and CORS
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// ✅ 2. Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 3. Create uploads folder if not exists
const uploadsDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ 4. Hardcoded MONGO_URL
const MONGO_URL = "mongodb+srv://Farhan555:Farhan555@school.mpetrpe.mongodb.net/";

// ✅ 5. Correct then() usage
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // ✅ Start server only after DB connects
    app.use("/", Routes);

    app.listen(PORT, () => {
      console.log(`✅ Server started at port no. ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ NOT CONNECTED TO MONGODB", err);
  });

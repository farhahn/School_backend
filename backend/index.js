const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
const fs = require("fs");

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(UploadsDir);
}

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://Farhan555:Farhan555@school.mpetrpe.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// Routes
// Adjust the path based on whether route.js is JavaScript or TypeScript
const Routes = require("./routes/route"); // Changed .ts to .js (see notes below)

app.use("/", Routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
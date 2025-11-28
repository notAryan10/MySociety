import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
connectDB();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    dbName: "mydatabase",
  }).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.status(200).json({"message": "API is working"});
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

import mongoose from "mongoose";

const URI = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.HOST}:27017`

export const connectDB = async () => {
  try {
    if (!URI) throw Error("No Mongo URI from env");
    await mongoose.connect(URI, { dbName: process.env.MONGODB_DB });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
    console.log("error", err);
    process.exit(1);
  }
};

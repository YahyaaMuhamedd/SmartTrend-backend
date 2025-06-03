// dbConnection.js
import mongoose from "mongoose";

export const dbConnection = async () => {
   try {
      const conn = await mongoose.connect(process.env.URL_CONNECTION_DB_ONLINE_ATLAS);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
   } catch (error) {
      console.error("❌ MongoDB Connection Error:", error.message);
      process.exit(1);
   }
};

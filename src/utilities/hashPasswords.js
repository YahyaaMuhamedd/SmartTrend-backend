import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

const dbName = "dbFekrah-New";
const collectionName = "branches";

const MONGO_URI = "mongodb+srv://SMART_TREND:Smart12345@cluster0.jseauuy.mongodb.net/dbFekrah-New"

async function hashPasswords() {
    try {

        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(" Connected to MongoDB");

        const collection = mongoose.connection.collection(collectionName);

        const users = await collection.find({ password: "Pwd@1234" }).toArray();

        for (const user of users) {
            const hashedPassword = await bcrypt.hash("Pwd@1234", 8);

            await collection.updateOne(
                { _id: user._id },
                { $set: { password: hashedPassword } }
            );

            console.log(` Hashed password for user with ID: ${user._id}`);
        }

        console.log(" All passwords hashed.");
    } catch (err) {
        console.error(" Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

hashPasswords();

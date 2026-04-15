import mongoose from 'mongoose';
import { userModel } from './DataBase/models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.URL_CONNECTION_DB_ONLINE_ATLAS);
console.log('✅ Connected to MongoDB\n');

// Find an admin user
const admin = await userModel.findOne({ role: 'admin' });

if (!admin) {
   console.log('❌ No admin user found in database');
   console.log('Please create an admin user first or provide admin credentials');
   process.exit(1);
}

console.log('📋 Admin User Found:');
console.log('-------------------');
console.log('ID:', admin._id);
console.log('Name:', admin.name);
console.log('Email:', admin.email);
console.log('Role:', admin.role);
console.log('');

// Generate JWT token using the correct SECRET_KEY and format
const jwtToken = jwt.sign(
   {
      _id: admin._id,
      name: admin.name,
      gender: admin.gender,
      phone: admin.phone,
      email: admin.email,
      role: admin.role,
      birthDay: admin.birthDay,
      age: admin.age,
      imgCover: admin.imgCover
   },
   process.env.SECRET_KEY,
   { expiresIn: '30d' }
);

// Format: BEARER_TOKEN + space + JWT
const fullToken = `${process.env.BEARER_TOKEN} ${jwtToken}`;

console.log('🔑 Generated Token (Valid for 30 days):');
console.log('======================================');
console.log(fullToken);
console.log('');
console.log('📋 IMPORTANT - Postman Configuration:');
console.log('1. Go to Headers tab (NOT Authorization tab)');
console.log('2. Add a header with key: token');
console.log('3. Paste the full token above as the value');

await mongoose.connection.close();
process.exit(0);

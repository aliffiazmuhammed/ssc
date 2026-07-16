import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log('Skipping seed.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@ssc.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin user seeded successfully!');
    console.log(`  Name:     ${admin.name}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: admin123`);
    console.log(`  Role:     ${admin.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

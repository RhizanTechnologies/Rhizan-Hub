import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Client } from '../models/Client';
import { TimeEntry } from '../models/TimeEntry';
import { Activity } from '../models/Activity';
import { Standup } from '../models/Standup';
import { Approach } from '../models/Approach';
import { Niche } from '../models/Niche';
import { connectDB } from '../config/db';

const seedDatabase = async () => {
  try {
    await connectDB();
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Failed to connect to primary or local MongoDB.');
    }
    console.log('🌱 Connected to MongoDB for seeding...');

    // 0. Clear all existing collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Client.deleteMany({});
    await TimeEntry.deleteMany({});
    await Activity.deleteMany({});
    await Standup.deleteMany({});
    await Approach.deleteMany({});
    await Niche.deleteMany({});

    console.log('🧹 Cleared all existing data from all collections.');

    // 1. Create Demo Admin User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('zizu@rhizan_21', salt);

    const demoUser = await User.create({
      name: 'Abdulaziz',
      email: 'abdulazizisa579@gmail.com',
      password: passwordHash,
      role: 'CEO',
      title: 'CEO & Founder',
      weeklyCapacityHours: 48,
      status: 'ACTIVE',
      mustChangePassword: false,
    });

    console.log(`👤 Created Demo Admin User: ${demoUser.name} (${demoUser.email}) as ${demoUser.role}`);

    console.log('\n======================================================');
    console.log('✨ DATABASE CLEARED & DEMO USER SEEDED SUCCESSFULLY');
    console.log('======================================================');
    console.log('Login credentials:');
    console.log('  Email:    abdulazizisa579@gmail.com');
    console.log('  Password: zizu@rhizan_21');
    console.log('  Role:     CEO');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

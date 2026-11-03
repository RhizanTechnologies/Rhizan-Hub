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

    // 1. Create Core Founder & CEO User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('zizu@rhizan_21', salt);

    const demoUser = await User.create({
      name: 'Abdulaziz',
      email: 'abdulazizisa579@gmail.com',
      password: passwordHash,
      role: 'CEO',
      title: 'Founder & CEO',
      weeklyCapacityHours: 48,
      status: 'ACTIVE',
      mustChangePassword: false,
    });

    console.log(`👤 Created Founder: ${demoUser.name} (${demoUser.email}) as ${demoUser.role}`);

    // Dates for reference
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 2. Create 1 Single Client
    const client = await Client.create({
      name: 'ABC Bakery Ltd',
      contactPerson: 'Dawit Mengistu',
      phone: '+251 91 123 4567',
      email: 'dawit@abcbakery.com',
      status: 'ACTIVE',
      serviceInterested: 'Custom ERP & POS Terminal System',
      assignedTo: demoUser._id,
      lastContactDate: yesterday,
      nextFollowUpDate: todayMorning,
      dealValue: 5000,
      paidAmount: 2500,
      currency: 'USD',
      notes: 'Phase 1 deployed to staging. Active sprint for recipe costing and inventory deduction.',
      meetings: [
        {
          title: 'Sprint 2 Milestone Signoff',
          date: todayMorning,
          time: '10:00 AM',
          linkOrLocation: 'ABC Bakery HQ - Addis Ababa',
          status: 'SCHEDULED',
          notes: 'Review recipe costing logic and batch inventory deduction with manager.',
        },
      ],
      payments: [
        {
          invoiceNumber: 'INV-2026-001',
          title: 'Initial Deposit (50%)',
          amount: 2500,
          status: 'PAID',
          paidDate: twoWeeksAgo,
        },
        {
          invoiceNumber: 'INV-2026-002',
          title: 'Phase 2 Milestone',
          amount: 2500,
          status: 'PENDING',
          dueDate: nextWeek,
        },
      ],
      links: [
        {
          title: 'Project Requirements Document',
          url: 'https://docs.google.com',
          category: 'DOCS',
        },
      ],
    });

    console.log(`🤝 Created 1 Client: ${client.name} ($${client.dealValue} contract)`);

    // 3. Create 1 Single Project
    const project = await Project.create({
      name: 'Bakery ERP & POS',
      clientName: client.name,
      clientId: client._id,
      description: 'Enterprise bakery management system covering ingredient recipe costing, batch production deduction, and offline-ready POS terminals.',
      lead: demoUser._id,
      members: [demoUser._id],
      techStack: ['Next.js 14', 'TypeScript', 'Node.js', 'MongoDB', 'TailwindCSS'],
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      progress: 75,
      startDate: twoWeeksAgo,
      deadline: nextWeek,
      budget: 5000,
      notes: 'Active development sprint. Preparing Phase 2 deployment to staging.',
      links: [
        { title: 'GitHub Repository', url: 'https://github.com/RhizanTechnologies', category: 'GITHUB' },
        { title: 'Figma Design System', url: 'https://figma.com', category: 'FIGMA' },
        { title: 'Staging Environment', url: 'http://localhost:3001', category: 'STAGING' },
      ],
      milestones: [
        {
          title: 'Milestone 1: Core System Architecture & Authentication',
          description: 'Database schema, JWT auth, and role-based permissions.',
          dueDate: twoWeeksAgo,
          status: 'COMPLETED',
          completedAt: twoWeeksAgo,
          deliverables: [
            { title: 'Schema definitions and MongoDB connection', completed: true },
            { title: 'JWT login, tokens & session handling', completed: true },
          ],
        },
        {
          title: 'Milestone 2: Recipe Costing & Inventory Engine',
          description: 'Automated ingredient deductions based on baking recipes.',
          dueDate: nextWeek,
          status: 'IN_PROGRESS',
          deliverables: [
            { title: 'Recipe formulation and batch math calculator', completed: true },
            { title: 'Low stock alerts and automatic supplier notifications', completed: false },
          ],
        },
      ],
    });

    // Link project to client
    client.projects = [project._id as any];
    await client.save();

    console.log(`📁 Created 1 Project: ${project.name} (75% completed)`);

    // 4. Create 1 Single Task
    const task = await Task.create({
      title: 'Implement Recipe Costing Engine',
      description: 'Build backend formula calculations to automatically deduct flour, sugar, and butter quantities per batch output.',
      project: project._id,
      assignedTo: demoUser._id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: nextWeek,
      estimatedHours: 8,
      actualHours: 3.5,
      subtasks: [
        { title: 'Unit conversion logic (kg, g, liters)', completed: true },
        { title: 'Recipe batch yield multiplier', completed: true },
        { title: 'Stock deduction transactional rollback on error', completed: false },
      ],
      comments: [
        {
          author: demoUser._id,
          text: 'Core conversion math completed and verified. Testing edge cases for decimals.',
          createdAt: new Date(),
        },
      ],
    });

    console.log(`✅ Created 1 Task: ${task.title} (HIGH priority, IN_PROGRESS)`);

    // 5. Create 1 Single Time Entry
    const timeEntry = await TimeEntry.create({
      user: demoUser._id,
      project: project._id,
      task: task._id,
      date: now,
      hours: 3,
      minutes: 30,
      description: 'Developed batch recipe deduction logic and unit conversion algorithms.',
      isBillable: true,
    });

    console.log(`⏱️ Created 1 Time Entry: ${timeEntry.hours}h ${timeEntry.minutes}m logged today`);

    // 6. Create 1 Activity Event
    await Activity.create({
      user: demoUser._id,
      userName: demoUser.name,
      action: 'logged 3.5h progress',
      entityType: 'TASK',
      entityTitle: task.title,
    });

    // 7. Create 1 Single Client Outreach Target (Approach)
    const niche = await Niche.create({
      name: 'Retail & Supermarket',
      description: 'Supermarkets, department stores, and retail outlets',
      color: '#10b981',
    });

    const approach = await Approach.create({
      businessName: 'Fresh Corner Supermarket',
      niche: niche.name,
      contactPerson: 'Kidus Tadesse',
      phone: '+251 91 198 7654',
      email: 'kidus@freshcornermarket.et',
      location: 'Bole Atlas, Addis Ababa',
      status: 'IN_DISCUSSION',
      notes: 'Interested in modernizing POS terminals and barcode-based inventory tracking. Follow-up demo scheduled.',
      assignedTo: demoUser._id,
      lastContactDate: yesterday,
      nextFollowUpDate: todayMorning,
      contactHistory: [
        {
          date: yesterday,
          channel: 'MEETING',
          notes: 'Discovery meeting held at main branch. Outlined inventory shrinkage issues and discussed ERP integration.',
          nextFollowUpDate: todayMorning,
          loggedBy: demoUser._id,
        },
      ],
    });

    console.log(`🎯 Created 1 Client Outreach Target: ${approach.businessName} (${approach.status})`);

    console.log('\n======================================================');
    console.log('✨ DATABASE RE-SEEDED WITH 1 CLEAN CONNECTED RECORD SET');
    console.log('======================================================');
    console.log('  👤 Founder:    abdulazizisa579@gmail.com / zizu@rhizan_21 (CEO)');
    console.log(`  🤝 Client:     ${client.name} (Active, $5,000 deal)`);
    console.log(`  📁 Project:    ${project.name} (75% progress)`);
    console.log(`  ✅ Task:       ${task.title} (In Progress)`);
    console.log(`  ⏱️ Time Log:   ${timeEntry.hours}h ${timeEntry.minutes}m logged today`);
    console.log(`  🎯 Outreach:   ${approach.businessName} (${approach.status} - ${approach.niche})`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

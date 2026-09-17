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

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rhizan_hub';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Client.deleteMany({});
    await TimeEntry.deleteMany({});
    await Activity.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const abdulaziz = await User.create({
      name: 'Abdulaziz',
      email: 'abdulaziz@rhizan.com',
      password: passwordHash,
      role: 'ADMIN',
      title: 'Development',
      weeklyCapacityHours: 40,
      status: 'ACTIVE',
    });

    const nebiyu = await User.create({
      name: 'Nebiyu',
      email: 'nebiyu@rhizan.com',
      password: passwordHash,
      role: 'MEMBER',
      title: 'Business / Client',
      weeklyCapacityHours: 40,
      status: 'ACTIVE',
    });

    const sadam = await User.create({
      name: 'Sadam',
      email: 'sadam@rhizan.com',
      password: passwordHash,
      role: 'MEMBER',
      title: 'Operations / Product',
      weeklyCapacityHours: 40,
      status: 'ACTIVE',
    });

    console.log('👥 Created 3 core Rhizan team members (Abdulaziz, Nebiyu, Sadam)');

    // 2. Create Projects
    const bakeryERP = await Project.create({
      name: 'Bakery ERP',
      clientName: 'ABC Bakery',
      description: 'Comprehensive ERP system for bakery production, inventory, and sales.',
      members: [abdulaziz._id, nebiyu._id, sadam._id],
      status: 'IN_PROGRESS',
      progress: 80,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      budget: 5000,
    });

    const rhizanWebsite = await Project.create({
      name: 'RHIZAN Website',
      clientName: 'Internal',
      description: 'Brand website and public showcase for RHIZAN services.',
      members: [abdulaziz._id, sadam._id],
      status: 'IN_PROGRESS',
      progress: 50,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      budget: 1500,
    });

    const clientSearch = await Project.create({
      name: 'Client Acquisition Q4',
      clientName: 'Internal',
      description: 'Outreach campaign targeting local retail and F&B businesses.',
      members: [nebiyu._id],
      status: 'IN_PROGRESS',
      progress: 25,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 1000,
    });

    console.log('🚀 Created 3 active projects');

    // 3. Create Tasks
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Fix ERP login authentication',
        description: 'Resolve session expiry issue and token refresh on mobile web.',
        assignedTo: abdulaziz._id,
        project: bakeryERP._id,
        priority: 'HIGH',
        status: 'TODO',
        dueDate: today,
        createdBy: sadam._id,
        estimatedHours: 3,
      },
      {
        title: 'Deploy backend to production VPS',
        description: 'Set up PM2 and Nginx reverse proxy with SSL certificate.',
        assignedTo: abdulaziz._id,
        project: bakeryERP._id,
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: tomorrow,
        createdBy: abdulaziz._id,
        estimatedHours: 4,
      },
      {
        title: 'Follow up with ABC Bakery on invoice',
        description: 'Verify 2nd milestone payment transfer.',
        assignedTo: nebiyu._id,
        project: bakeryERP._id,
        priority: 'HIGH',
        status: 'TODO',
        dueDate: today,
        createdBy: nebiyu._id,
        estimatedHours: 1,
      },
      {
        title: 'Client pitch presentation for XYZ Bistro',
        description: 'Prepare demo slide deck and ERP module preview.',
        assignedTo: nebiyu._id,
        project: clientSearch._id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: tomorrow,
        createdBy: nebiyu._id,
        estimatedHours: 5,
      },
      {
        title: 'Update portfolio case studies',
        description: 'Add bakery ERP screenshots and client testimonial quote.',
        assignedTo: sadam._id,
        project: rhizanWebsite._id,
        priority: 'MEDIUM',
        status: 'REVIEW',
        dueDate: tomorrow,
        createdBy: sadam._id,
        estimatedHours: 4,
      },
      {
        title: 'Landing page responsive design check',
        description: 'Verify mobile navigation drawer and hero banner typography.',
        assignedTo: sadam._id,
        project: rhizanWebsite._id,
        priority: 'LOW',
        status: 'DONE',
        dueDate: yesterday,
        createdBy: sadam._id,
        estimatedHours: 2,
      },
      {
        title: 'Test bakery payment integration',
        description: 'Run sandbox checkout transactions and receipt generation.',
        assignedTo: abdulaziz._id,
        project: bakeryERP._id,
        priority: 'HIGH',
        status: 'REVIEW',
        dueDate: tomorrow,
        createdBy: abdulaziz._id,
        estimatedHours: 3,
      },
      {
        title: 'Prepare Client X proposal document',
        description: 'Scope out deliverables, timeline, and pricing tiers.',
        assignedTo: nebiyu._id,
        project: clientSearch._id,
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: yesterday, // Overdue task for testing alert
        createdBy: nebiyu._id,
        estimatedHours: 3,
      },
    ]);

    console.log('📋 Created tasks across Kanban columns');

    // 4. Create Clients & CRM Pipeline
    await Client.create([
      {
        name: 'ABC Bakery',
        contactPerson: 'Dawit Mengistu',
        phone: '+251 91 123 4567',
        email: 'dawit@abcbakery.com',
        status: 'ACTIVE',
        serviceInterested: 'Custom ERP & POS',
        assignedTo: nebiyu._id,
        dealValue: 5000,
        notes: 'Signed contract. Currently testing phase 1.',
      },
      {
        name: 'Skyline Cafe & Roastery',
        contactPerson: 'Hana Kebede',
        phone: '+251 92 345 6789',
        email: 'hana@skyline.et',
        status: 'PROPOSAL',
        serviceInterested: 'Inventory & Ordering System',
        assignedTo: nebiyu._id,
        dealValue: 3500,
        notes: 'Sent proposal document on Monday. Awaiting feedback.',
      },
      {
        name: 'Blue Nile Logistics',
        contactPerson: 'Yonas T.',
        phone: '+251 93 456 7890',
        email: 'yonas@bluenile.com',
        status: 'MEETING',
        serviceInterested: 'Fleet Tracking & Dispatch Portal',
        assignedTo: nebiyu._id,
        dealValue: 6200,
        notes: 'Meeting scheduled for Thursday 2 PM.',
      },
      {
        name: 'Fresh Market Grocers',
        contactPerson: 'Samson B.',
        phone: '+251 94 567 8901',
        email: 'samson@freshmarket.com',
        status: 'CONTACTED',
        serviceInterested: 'POS Integration',
        assignedTo: nebiyu._id,
        dealValue: 2400,
        notes: 'Introductory call completed. Interested in seeing demo.',
      },
      {
        name: 'Apex Printing Press',
        contactPerson: 'Blen Assefa',
        phone: '+251 95 678 9012',
        email: 'blen@apexprint.et',
        status: 'LEAD',
        serviceInterested: 'Internal Workflow Management',
        assignedTo: nebiyu._id,
        dealValue: 3000,
        notes: 'Identified via business directory referral.',
      },
    ]);

    console.log('🤝 Created clients and CRM pipeline leads');

    // 5. Create Time Tracking Entries (This week)
    await TimeEntry.create([
      {
        user: abdulaziz._id,
        project: bakeryERP._id,
        description: 'Database schema modeling & API route design',
        hours: 18,
        minutes: 30,
        date: today,
      },
      {
        user: abdulaziz._id,
        project: rhizanWebsite._id,
        description: 'Next.js frontend setup and UI styling',
        hours: 8,
        minutes: 30,
        date: today,
      },
      {
        user: nebiyu._id,
        project: clientSearch._id,
        description: 'Client calls and outreach meetings',
        hours: 16,
        minutes: 0,
        date: today,
      },
      {
        user: nebiyu._id,
        project: bakeryERP._id,
        description: 'Client requirement sync with ABC Bakery team',
        hours: 8,
        minutes: 0,
        date: today,
      },
      {
        user: sadam._id,
        project: rhizanWebsite._id,
        description: 'Website copy and feature breakdown',
        hours: 12,
        minutes: 0,
        date: today,
      },
      {
        user: sadam._id,
        project: bakeryERP._id,
        description: 'QA testing inventory flow and bug reports',
        hours: 9,
        minutes: 0,
        date: today,
      },
    ]);

    console.log('⏱️ Created time tracking entries');

    // 6. Create Recent Activities
    await Activity.create([
      {
        user: abdulaziz._id,
        userName: 'Abdulaziz',
        action: 'moved task to Review',
        entityType: 'TASK',
        entityTitle: 'Test bakery payment integration',
      },
      {
        user: nebiyu._id,
        userName: 'Nebiyu',
        action: 'added new lead / client',
        entityType: 'CLIENT',
        entityTitle: 'Apex Printing Press',
      },
      {
        user: sadam._id,
        userName: 'Sadam',
        action: 'completed task',
        entityType: 'TASK',
        entityTitle: 'Landing page responsive design check',
      },
      {
        user: abdulaziz._id,
        userName: 'Abdulaziz',
        action: 'logged 4h 30m on',
        entityType: 'TIME',
        entityTitle: 'Bakery ERP',
      },
    ]);

    console.log('🔔 Created initial activity feed');
    console.log('\n✨ Database seeding completed successfully!');
    console.log('Credentials to test login:');
    console.log('  Admin:      abdulaziz@rhizan.com / password123');
    console.log('  Member:     nebiyu@rhizan.com    / password123');
    console.log('  Member:     sadam@rhizan.com     / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

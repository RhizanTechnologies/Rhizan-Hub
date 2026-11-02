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

    console.log('🧹 Cleared all existing data from collections.');

    // 1. Create Core Rhizan Team Members
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const abdulaziz = await User.create({
      name: 'Abdulaziz',
      email: 'abdulazizisa579@gmail.com',
      password: passwordHash,
      role: 'ADMIN',
      title: 'Lead Full-Stack Engineer',
      weeklyCapacityHours: 48,
      status: 'ACTIVE',
    });

    const nebiyu = await User.create({
      name: 'Nebiyu',
      email: 'nebiyu@rhizan.com',
      password: passwordHash,
      role: 'MEMBER',
      title: 'Client Relations & Growth Lead',
      weeklyCapacityHours: 48,
      status: 'ACTIVE',
    });

    const sadam = await User.create({
      name: 'Sadam',
      email: 'sadam@rhizan.com',
      password: passwordHash,
      role: 'MEMBER',
      title: 'Operations & Product Strategy',
      weeklyCapacityHours: 48,
      status: 'ACTIVE',
    });

    console.log('👥 Created 3 core team members (Abdulaziz, Nebiyu, Sadam) with 48h weekly capacity');

    // 2. Create Clients & CRM Outreach Pipeline (with Overdue & Today follow-up alerts)
    const now = new Date();
    const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const clientAbcBakery = await Client.create({
      name: 'ABC Bakery Ltd',
      contactPerson: 'Dawit Mengistu',
      phone: '+251 91 123 4567',
      email: 'dawit@abcbakery.com',
      status: 'ACTIVE',
      serviceInterested: 'Custom ERP & POS Terminal System',
      assignedTo: nebiyu._id,
      lastContactDate: yesterday,
      nextFollowUpDate: todayMorning, // Follow up today alert
      dealValue: 5000,
      paidAmount: 2500,
      currency: 'USD',
      notes: 'Phase 1 deployed to staging. Testing recipe costing and POS scanner hardware.',
      meetings: [
        {
          title: 'Sprint 2 Milestone Signoff',
          date: todayMorning,
          time: '10:00 AM',
          linkOrLocation: 'ABC Bakery HQ - Addis Ababa',
          status: 'SCHEDULED',
          notes: 'Review inventory deduction accuracy with finance manager.',
        },
      ],
      payments: [
        {
          invoiceNumber: 'INV-2026-001',
          title: 'Initial Deposit (50%)',
          amount: 2500,
          status: 'PAID',
          paidDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
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
        { title: 'Project Brief Doc', url: 'https://docs.google.com/document/d/sample', category: 'DOCS' },
      ],
    });

    const clientSkyline = await Client.create({
      name: 'Skyline Cafe & Roastery',
      contactPerson: 'Hana Kebede',
      phone: '+251 92 345 6789',
      email: 'hana@skyline.et',
      status: 'PROPOSAL',
      serviceInterested: 'Inventory & Table Ordering System',
      assignedTo: nebiyu._id,
      lastContactDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: todayMorning, // Follow up today alert
      dealValue: 3500,
      paidAmount: 0,
      currency: 'USD',
      notes: 'Proposal sent Monday. Follow up today regarding table ordering hardware options.',
      meetings: [
        {
          title: 'Proposal Review Call',
          date: todayMorning,
          time: '3:00 PM',
          linkOrLocation: 'Google Meet',
          status: 'SCHEDULED',
        },
      ],
    });

    const clientBlueNile = await Client.create({
      name: 'Blue Nile Logistics',
      contactPerson: 'Yonas Tesfaye',
      phone: '+251 93 456 7890',
      email: 'yonas@bluenile.com',
      status: 'MEETING',
      serviceInterested: 'Fleet Tracking & Dispatch Portal',
      assignedTo: nebiyu._id,
      lastContactDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: yesterday, // Overdue follow-up alert!
      dealValue: 6200,
      paidAmount: 0,
      currency: 'USD',
      notes: 'Missed scheduled sync yesterday. Need to re-confirm dispatch requirements ASAP.',
    });

    const clientFreshMarket = await Client.create({
      name: 'Fresh Market Supermarkets',
      contactPerson: 'Samson Bekele',
      phone: '+251 94 567 8901',
      email: 'samson@freshmarket.com',
      status: 'CONTACTED',
      serviceInterested: 'Multi-Branch POS Integration',
      assignedTo: nebiyu._id,
      lastContactDate: yesterday,
      nextFollowUpDate: inThreeDays,
      dealValue: 4800,
      paidAmount: 0,
      currency: 'USD',
      notes: 'Initial discovery call went well. Preparing presentation for the board.',
    });

    const clientApex = await Client.create({
      name: 'Apex Printing Press',
      contactPerson: 'Blen Assefa',
      phone: '+251 95 678 9012',
      email: 'blen@apexprint.et',
      status: 'LEAD',
      serviceInterested: 'Production Workflow & Job Quoting Tool',
      assignedTo: nebiyu._id,
      lastContactDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: nextWeek,
      dealValue: 3000,
      paidAmount: 0,
      currency: 'USD',
      notes: 'Lead from business directory referral. Reached out via email.',
    });

    const clientSummit = await Client.create({
      name: 'Summit Healthcare Center',
      contactPerson: 'Dr. Michael Haile',
      phone: '+251 96 789 0123',
      email: 'michael@summitmed.et',
      status: 'ACTIVE',
      serviceInterested: 'Patient Booking & E-Prescription Portal',
      assignedTo: sadam._id,
      lastContactDate: yesterday,
      nextFollowUpDate: tomorrow,
      dealValue: 8500,
      paidAmount: 4250,
      currency: 'USD',
      notes: 'Phase 1 deployed. Active sprint for lab result uploads and doctor scheduling.',
    });

    console.log('🤝 Created 6 realistic clients & CRM pipeline leads (with overdue and today alerts)');

    // 2.1 Create Outreach Niches
    await Niche.create([
      { name: 'Bakery & F&B', description: 'Bakeries, cafes, restaurants, and food production', color: '#f59e0b' },
      { name: 'Healthcare & Clinics', description: 'Hospitals, specialty clinics, and medical centers', color: '#06b6d4' },
      { name: 'Logistics & Transport', description: 'Freight, vehicle fleets, and courier services', color: '#3b82f6' },
      { name: 'Retail & Supermarkets', description: 'Grocery chains, department stores, and POS outlets', color: '#10b981' },
      { name: 'Manufacturing & Printing', description: 'Commercial printing presses, packaging, and factories', color: '#8b5cf6' },
    ]);

    console.log('🏷️ Created 5 market niches for outreach');

    // 2.2 Create Outreach Leads (Approaches) with Overdue & Today Follow-Up Badges
    await Approach.create([
      {
        businessName: 'Blue Nile Logistics',
        niche: 'Logistics & Transport',
        contactPerson: 'Yonas Tesfaye',
        phone: '+251 93 456 7890',
        email: 'yonas@bluenile.com',
        location: 'Bole Medhanealem, Addis Ababa',
        status: 'IN_DISCUSSION',
        assignedTo: nebiyu._id,
        lastContactDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        nextFollowUpDate: yesterday, // OVERDUE FOLLOW-UP ALERT (Shows ⚠️ Overdue)
        notes: 'Fleet dispatch system. Missed scheduled sync yesterday; needs urgent follow-up call.',
        contactHistory: [
          {
            date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            channel: 'CALL',
            notes: 'Initial discovery call with operations manager. Expressed interest in live GPS fleet tracking.',
            loggedBy: nebiyu._id,
          },
          {
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            channel: 'WHATSAPP',
            notes: 'Sent PDF overview of vehicle tracking and fuel calculation modules.',
            loggedBy: nebiyu._id,
          },
        ],
      },
      {
        businessName: 'Skyline Cafe & Roastery',
        niche: 'Bakery & F&B',
        contactPerson: 'Hana Kebede',
        phone: '+251 92 345 6789',
        email: 'hana@skyline.et',
        location: 'Kazanchis, Addis Ababa',
        status: 'PITCHED',
        assignedTo: nebiyu._id,
        lastContactDate: yesterday,
        nextFollowUpDate: todayMorning, // TODAY FOLLOW-UP ALERT (Shows 🔔 Follow up today)
        notes: 'Live demo scheduled for 3:00 PM today. Reviewing table QR ordering and waiter notification screens.',
        contactHistory: [
          {
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            channel: 'CALL',
            notes: 'Intro call regarding peak hour order delays.',
            loggedBy: nebiyu._id,
          },
          {
            date: yesterday,
            channel: 'WHATSAPP',
            notes: 'Confirmed demo session for Kazanchis headquarters today at 3 PM.',
            loggedBy: nebiyu._id,
          },
        ],
      },
      {
        businessName: 'Habesha Bakeries & Pastry',
        niche: 'Bakery & F&B',
        contactPerson: 'Solomon Tadesse',
        phone: '+251 91 222 3344',
        email: 'solomon@habeshabakery.et',
        location: 'Piassa, Addis Ababa',
        status: 'CONTACTED',
        assignedTo: nebiyu._id,
        lastContactDate: yesterday,
        nextFollowUpDate: todayMorning, // TODAY FOLLOW-UP ALERT
        notes: 'Owner requested pricing breakdown for inventory recipe costing and wastage reduction.',
        contactHistory: [
          {
            date: yesterday,
            channel: 'CALL',
            notes: 'Detailed discussion about flour, yeast, and butter batch costing. Follow up with quotation today.',
            loggedBy: nebiyu._id,
          },
        ],
      },
      {
        businessName: 'Fresh Market Supermarkets',
        niche: 'Retail & Supermarkets',
        contactPerson: 'Samson Bekele',
        phone: '+251 94 567 8901',
        email: 'samson@freshmarket.com',
        location: 'Sarbet, Addis Ababa',
        status: 'CONTACTED',
        assignedTo: nebiyu._id,
        lastContactDate: yesterday,
        nextFollowUpDate: inThreeDays,
        notes: 'Multi-store barcode POS rollout across 3 supermarket locations. Preparing pitch deck for the board.',
        contactHistory: [
          {
            date: yesterday,
            channel: 'MEETING',
            notes: 'Met at Sarbet branch to inspect barcode scanner compatibility and POS receipt requirements.',
            loggedBy: nebiyu._id,
          },
        ],
      },
      {
        businessName: 'Medina Pharmacy Chain',
        niche: 'Healthcare & Clinics',
        contactPerson: 'Dr. Amina Yusuf',
        phone: '+251 91 555 7788',
        email: 'amina@medinapharm.com',
        location: 'Merkato, Addis Ababa',
        status: 'IN_DISCUSSION',
        assignedTo: sadam._id,
        lastContactDate: yesterday,
        nextFollowUpDate: tomorrow,
        notes: 'Batch expiry tracking and automated supplier purchase orders across 4 pharmacy branches.',
        contactHistory: [
          {
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            channel: 'CALL',
            notes: 'Discussed batch number and expiration date tracking compliance.',
            loggedBy: sadam._id,
          },
        ],
      },
      {
        businessName: 'Apex Printing & Packaging',
        niche: 'Manufacturing & Printing',
        contactPerson: 'Blen Assefa',
        phone: '+251 95 678 9012',
        email: 'blen@apexprint.et',
        location: 'Kera, Addis Ababa',
        status: 'PROSPECT',
        assignedTo: sadam._id,
        lastContactDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        nextFollowUpDate: nextWeek,
        notes: 'Inbound inquiry regarding production job scheduling and automated quote generation.',
      },
      {
        businessName: 'ABC Bakery Ltd',
        niche: 'Bakery & F&B',
        contactPerson: 'Dawit Mengistu',
        phone: '+251 91 123 4567',
        email: 'dawit@abcbakery.com',
        location: 'CMC, Addis Ababa',
        status: 'DEAL_WON',
        assignedTo: nebiyu._id,
        convertedClientId: clientAbcBakery._id,
        notes: 'Signed contract for custom ERP & POS platform. Active in sprint development.',
      },
      {
        businessName: 'Red Sea Freight Logistics',
        niche: 'Logistics & Transport',
        contactPerson: 'Mulugeta Zewde',
        phone: '+251 92 888 9900',
        email: 'mulugeta@redseafreight.et',
        location: 'Gotera, Addis Ababa',
        status: 'PROSPECT',
        assignedTo: nebiyu._id,
        nextFollowUpDate: inThreeDays,
        notes: 'Cold outreach lead; 18 heavy cargo trucks operating between Djibouti port and Addis Ababa.',
      },
    ]);

    console.log('🎯 Created 8 realistic outreach leads across all pipeline stages with follow-up alerts');

    // 3. Create Projects with Milestones, Deliverables & Resource Links
    const bakeryERP = await Project.create({
      name: 'Bakery ERP & POS',
      clientName: 'ABC Bakery Ltd',
      clientId: clientAbcBakery._id,
      description: 'Full-stack enterprise platform covering recipe costing, raw ingredient inventory, and offline POS terminal transactions.',
      lead: abdulaziz._id,
      members: [abdulaziz._id, nebiyu._id, sadam._id],
      techStack: ['Next.js 16', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      progress: 75,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      budget: 5000,
      notes: 'High priority client. Target delivery date is mid-month.',
      links: [
        { title: 'GitHub Repository', url: 'https://github.com/rhizan/bakery-erp', category: 'GITHUB' },
        { title: 'Figma UI Prototype', url: 'https://figma.com/file/bakery-erp-v1', category: 'FIGMA' },
        { title: 'Staging Environment', url: 'https://staging-bakery.rhizan.dev', category: 'STAGING' },
      ],
      milestones: [
        {
          title: 'Milestone 1: Database Schema & Authentication',
          description: 'Multi-tenant database schema, JWT auth, and role-based permissions.',
          dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          completedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          deliverables: [
            { title: 'Database migrations and schema definitions', completed: true },
            { title: 'JWT login, refresh tokens & session handling', completed: true },
            { title: 'User role management (Admin, Cashier, Baker)', completed: true },
          ],
        },
        {
          title: 'Milestone 2: Inventory & Recipe Costing Engine',
          description: 'Automated batch ingredient deduction based on recipe formulas.',
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          status: 'IN_PROGRESS',
          deliverables: [
            { title: 'Ingredient stock tracking & unit conversions', completed: true },
            { title: 'Batch baking yield & wastage calculator', completed: true },
            { title: 'Low stock notification and supplier re-ordering', completed: false },
          ],
        },
        {
          title: 'Milestone 3: POS Register & Receipt Printing',
          description: 'Offline-capable cashier register with barcode scanner and receipt generation.',
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          deliverables: [
            { title: 'Touchscreen POS interface and cart checkout', completed: false },
            { title: 'Thermal printer integration & daily z-report', completed: false },
          ],
        },
      ],
    });

    const summitPortal = await Project.create({
      name: 'Summit Patient Portal',
      clientName: 'Summit Healthcare Center',
      clientId: clientSummit._id,
      description: 'Modern patient appointment scheduling, digital medical history, and telehealth consultation portal.',
      lead: sadam._id,
      members: [abdulaziz._id, sadam._id],
      techStack: ['React', 'TypeScript', 'Express', 'MongoDB', 'Docker'],
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      progress: 45,
      startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      budget: 8500,
      links: [
        { title: 'Doctor Scheduling Specs', url: 'https://docs.rhizan.dev/summit/specs', category: 'DOCS' },
        { title: 'API Documentation', url: 'https://api-summit.rhizan.dev/docs', category: 'STAGING' },
      ],
      milestones: [
        {
          title: 'Milestone 1: Patient Self-Service Booking',
          description: 'Online doctor calendar scheduling and SMS confirmation alerts.',
          dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          deliverables: [
            { title: 'Interactive calendar time-slot selection', completed: true },
            { title: 'Automated SMS appointment reminder service', completed: true },
          ],
        },
        {
          title: 'Milestone 2: Electronic Health Records (EHR)',
          description: 'Secure consultation records and diagnostic lab result PDF uploads.',
          dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
          status: 'IN_PROGRESS',
          deliverables: [
            { title: 'Doctor prescription and diagnosis editor', completed: true },
            { title: 'Encrypted patient file upload and preview', completed: false },
          ],
        },
      ],
    });

    const rhizanHubV2 = await Project.create({
      name: 'Rhizan Hub Operations Platform',
      clientName: 'Internal',
      description: 'Unified internal operations management hub: real-time time tracking, task Kanban, CRM pipeline, executive reports, and asynchronous standups.',
      lead: abdulaziz._id,
      members: [abdulaziz._id, nebiyu._id, sadam._id],
      techStack: ['Next.js 16', 'TypeScript', 'Express', 'MongoDB', 'Turbopack'],
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      progress: 85,
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      budget: 3500,
      links: [
        { title: 'GitHub Repository', url: 'https://github.com/rhizan/rhizan-hub', category: 'GITHUB' },
      ],
      milestones: [
        {
          title: 'Milestone 1: Real-Time Time Tracking & Kanban',
          description: 'Live stopwatch, instant presets, daily capacity dial, and task board.',
          dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          deliverables: [
            { title: 'Live stopwatch with localStorage persistence', completed: true },
            { title: 'Kanban drag and drop task management', completed: true },
            { title: 'WIP capacity warning limits per member', completed: true },
          ],
        },
        {
          title: 'Milestone 2: Executive Reporting & EOD Standup',
          description: 'One-page weekly operations summary and asynchronous end-of-day check-in.',
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: 'IN_PROGRESS',
          deliverables: [
            { title: 'Executive weekly PDF/Print report generation', completed: true },
            { title: 'Daily EOD standup check-in feed and submission', completed: true },
            { title: 'Automated project deliverable progress sync', completed: true },
          ],
        },
      ],
    });

    // Link projects back to clients
    await Client.findByIdAndUpdate(clientAbcBakery._id, { $push: { projects: bakeryERP._id } });
    await Client.findByIdAndUpdate(clientSummit._id, { $push: { projects: summitPortal._id } });

    console.log('🚀 Created 3 active projects with real milestones and deliverables');

    // 4. Create Tasks across Kanban columns (TODO, IN_PROGRESS, REVIEW, DONE)
    const taskBatch = await Task.create([
      // Abdulaziz tasks
      {
        title: 'Implement recipe batch yield calculation in Bakery ERP',
        description: 'Calculate ingredient scaling factors based on target loaf output volume.',
        assignedTo: abdulaziz._id,
        project: bakeryERP._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: tomorrow,
        createdBy: sadam._id,
        estimatedHours: 4,
      },
      {
        title: 'Optimize aggregation pipeline for executive weekly report',
        description: 'Speed up weekly capacity and time log grouping queries on the server.',
        assignedTo: abdulaziz._id,
        project: rhizanHubV2._id,
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: todayMorning,
        createdBy: abdulaziz._id,
        estimatedHours: 3,
      },
      {
        title: 'Configure Nginx SSL reverse proxy and PM2 on VPS',
        description: 'Setup production deployment pipeline for automated updates.',
        assignedTo: abdulaziz._id,
        project: bakeryERP._id,
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: inThreeDays,
        createdBy: abdulaziz._id,
        estimatedHours: 2.5,
      },
      {
        title: 'Resolve JWT mobile token refresh race condition',
        description: 'Fixed session dropouts when switching tabs on mobile Safari.',
        assignedTo: abdulaziz._id,
        project: bakeryERP._id,
        priority: 'URGENT',
        status: 'DONE',
        dueDate: yesterday,
        createdBy: abdulaziz._id,
        estimatedHours: 2,
      },
      {
        title: 'Create encrypted PDF upload endpoint for lab results',
        description: 'Handle medical PDF storage with signed S3 URLs and virus scanning.',
        assignedTo: abdulaziz._id,
        project: summitPortal._id,
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: nextWeek,
        createdBy: sadam._id,
        estimatedHours: 4,
      },

      // Nebiyu tasks
      {
        title: 'Deliver interactive ordering demo to Skyline Cafe stakeholders',
        description: 'Demonstrate table QR ordering flow and waiter notification dashboard.',
        assignedTo: nebiyu._id,
        project: rhizanHubV2._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: todayMorning,
        createdBy: nebiyu._id,
        estimatedHours: 3,
      },
      {
        title: 'Follow up with ABC Bakery on milestone #2 invoice',
        description: 'Confirm wire transfer details with finance manager Dawit.',
        assignedTo: nebiyu._id,
        project: bakeryERP._id,
        priority: 'URGENT',
        status: 'TODO',
        dueDate: todayMorning,
        createdBy: nebiyu._id,
        estimatedHours: 1,
      },
      {
        title: 'Reschedule discovery session with Blue Nile Logistics',
        description: 'Address yesterday\'s missed meeting and present fleet portal specifications.',
        assignedTo: nebiyu._id,
        project: rhizanHubV2._id,
        priority: 'HIGH',
        status: 'TODO',
        dueDate: tomorrow,
        createdBy: nebiyu._id,
        estimatedHours: 2,
      },
      {
        title: 'Finalize customized pricing proposal for Fresh Market Supermarkets',
        description: 'Detail multi-store license fees and hardware support SLA tiers.',
        assignedTo: nebiyu._id,
        project: rhizanHubV2._id,
        priority: 'MEDIUM',
        status: 'DONE',
        dueDate: yesterday,
        createdBy: nebiyu._id,
        estimatedHours: 2.5,
      },

      // Sadam tasks
      {
        title: 'QA verify inventory stock deduction against physical bakery counts',
        description: 'Test flour, yeast, and sugar deduction triggers upon batch completion.',
        assignedTo: sadam._id,
        project: bakeryERP._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: todayMorning,
        createdBy: sadam._id,
        estimatedHours: 3.5,
      },
      {
        title: 'Review weekly agency delivery burndown and capacity',
        description: 'Verify 48h targets across all projects and identify potential bottlenecks.',
        assignedTo: sadam._id,
        project: rhizanHubV2._id,
        priority: 'MEDIUM',
        status: 'REVIEW',
        dueDate: tomorrow,
        createdBy: sadam._id,
        estimatedHours: 2,
      },
      {
        title: 'Audit timesheet logs and billable client hours for invoice generation',
        description: 'Cross-check logged hours with signed statement of work milestones.',
        assignedTo: sadam._id,
        project: summitPortal._id,
        priority: 'LOW',
        status: 'TODO',
        dueDate: inThreeDays,
        createdBy: sadam._id,
        estimatedHours: 2,
      },
      {
        title: 'Complete Summit Medical patient onboarding workflow documentation',
        description: 'Created step-by-step PDF manual for clinic reception staff.',
        assignedTo: sadam._id,
        project: summitPortal._id,
        priority: 'MEDIUM',
        status: 'DONE',
        dueDate: yesterday,
        createdBy: sadam._id,
        estimatedHours: 3,
      },
    ]);

    console.log(`📋 Created ${taskBatch.length} realistic tasks across Kanban states and priorities`);

    // 5. Create Time Tracking Entries (Today + Past days this week)
    // Dates for this week
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    await TimeEntry.create([
      // Abdulaziz - Today (5h 30m logged today -> 69% of 8h daily target)
      {
        user: abdulaziz._id,
        project: bakeryERP._id,
        task: taskBatch[0]._id,
        description: 'Batch formula scaling & recipe calculation service',
        hours: 3,
        minutes: 30,
        billable: true,
        tag: 'Development',
        date: todayMorning,
      },
      {
        user: abdulaziz._id,
        project: rhizanHubV2._id,
        task: taskBatch[1]._id,
        description: 'Weekly reporting aggregation query performance optimization',
        hours: 2,
        minutes: 0,
        billable: false,
        tag: 'Internal Operations',
        date: todayMorning,
      },

      // Abdulaziz - Earlier this week (26h total -> weekly total = 31.5h / 48h)
      {
        user: abdulaziz._id,
        project: bakeryERP._id,
        description: 'Role-based access control and JWT authentication setup',
        hours: 8,
        minutes: 0,
        billable: true,
        tag: 'Development',
        date: yesterday,
      },
      {
        user: abdulaziz._id,
        project: bakeryERP._id,
        description: 'PostgreSQL schema modeling and database migrations',
        hours: 7,
        minutes: 30,
        billable: true,
        tag: 'Architecture',
        date: twoDaysAgo,
      },
      {
        user: abdulaziz._id,
        project: summitPortal._id,
        description: 'Patient appointment slot booking API and SMS webhooks',
        hours: 6,
        minutes: 30,
        billable: true,
        tag: 'Development',
        date: threeDaysAgo,
      },
      {
        user: abdulaziz._id,
        project: rhizanHubV2._id,
        description: 'Live stopwatch and dashboard time tracking hub implementation',
        hours: 4,
        minutes: 0,
        billable: false,
        tag: 'Feature',
        date: fourDaysAgo,
      },

      // Nebiyu - Today (4h 30m logged today)
      {
        user: nebiyu._id,
        project: rhizanHubV2._id,
        task: taskBatch[5]._id,
        description: 'Interactive ordering demo preparation for Skyline Cafe',
        hours: 3,
        minutes: 0,
        billable: true,
        tag: 'Client Presentation',
        date: todayMorning,
      },
      {
        user: nebiyu._id,
        project: bakeryERP._id,
        task: taskBatch[6]._id,
        description: 'Finance review call with Dawit regarding invoice #2',
        hours: 1,
        minutes: 30,
        billable: true,
        tag: 'Client Relations',
        date: todayMorning,
      },

      // Nebiyu - Earlier this week (23h -> weekly total = 27.5h / 48h)
      {
        user: nebiyu._id,
        project: rhizanHubV2._id,
        description: 'Fresh Market proposal drafting and hardware costing',
        hours: 7,
        minutes: 0,
        billable: true,
        tag: 'Business Development',
        date: yesterday,
      },
      {
        user: nebiyu._id,
        project: bakeryERP._id,
        description: 'Gathering POS receipt layout specs from ABC Bakery team',
        hours: 6,
        minutes: 0,
        billable: true,
        tag: 'Requirements',
        date: twoDaysAgo,
      },
      {
        user: nebiyu._id,
        project: rhizanHubV2._id,
        description: 'Lead generation and cold outreach to local F&B businesses',
        hours: 6,
        minutes: 0,
        billable: false,
        tag: 'Outreach',
        date: threeDaysAgo,
      },
      {
        user: nebiyu._id,
        project: summitPortal._id,
        description: 'Client onboarding check-in with Dr. Michael Haile',
        hours: 4,
        minutes: 0,
        billable: true,
        tag: 'Account Management',
        date: fourDaysAgo,
      },

      // Sadam - Today (5h 00m logged today)
      {
        user: sadam._id,
        project: bakeryERP._id,
        task: taskBatch[9]._id,
        description: 'Inventory formula deduction testing and discrepancy checks',
        hours: 3,
        minutes: 0,
        billable: true,
        tag: 'Quality Assurance',
        date: todayMorning,
      },
      {
        user: sadam._id,
        project: rhizanHubV2._id,
        task: taskBatch[10]._id,
        description: 'Sprint delivery burndown audit and capacity review',
        hours: 2,
        minutes: 0,
        billable: false,
        tag: 'Operations',
        date: todayMorning,
      },

      // Sadam - Earlier this week (21h -> weekly total = 26h / 48h)
      {
        user: sadam._id,
        project: summitPortal._id,
        description: 'Staff training guide and clinic workflow mapping',
        hours: 7,
        minutes: 0,
        billable: true,
        tag: 'Product Strategy',
        date: yesterday,
      },
      {
        user: sadam._id,
        project: bakeryERP._id,
        description: 'Testing cashier touch interface usability & edge cases',
        hours: 6,
        minutes: 0,
        billable: true,
        tag: 'QA',
        date: twoDaysAgo,
      },
      {
        user: sadam._id,
        project: summitPortal._id,
        description: 'Reviewing doctor consultation notes feature specifications',
        hours: 5,
        minutes: 0,
        billable: true,
        tag: 'Product',
        date: threeDaysAgo,
      },
      {
        user: sadam._id,
        project: rhizanHubV2._id,
        description: 'WIP task limit validation and weekly report UI review',
        hours: 3,
        minutes: 0,
        billable: false,
        tag: 'Internal Review',
        date: fourDaysAgo,
      },
    ]);

    console.log('⏱️ Created realistic time entries for today and weekly 48h capacity tracking');

    // 6. Create Daily EOD Standup Entries (Nebiyu and Sadam already checked in today)
    await Standup.create([
      {
        user: nebiyu._id,
        userName: nebiyu.name,
        userRole: nebiyu.title,
        date: todayMorning,
        completedToday: '• Prepared interactive tablet ordering demo for Skyline Cafe.\n• Followed up with Dawit (ABC Bakery) on milestone invoice #2.',
        prioritiesTomorrow: '• Deliver live demo to Skyline Cafe stakeholders at 3 PM.\n• Follow up on overdue meeting with Blue Nile Logistics.',
        blockers: 'Waiting for approved pricing tier sheet for multi-branch discount.',
        hoursWorked: 4.5,
      },
      {
        user: sadam._id,
        userName: sadam.name,
        userRole: sadam.title,
        date: todayMorning,
        completedToday: '• QA verified inventory stock deduction triggers for bakery flour & yeast.\n• Audited sprint burndown and weekly capacity meters.',
        prioritiesTomorrow: '• Sync with Abdulaziz on recipe yield edge cases.\n• Review Summit Medical consultation notes UI with clinic staff.',
        blockers: '',
        hoursWorked: 5.0,
      },
    ]);

    console.log('🌙 Created 2 team standup check-ins for today (Abdulaziz can test checking in via UI)');

    // 7. Create Recent Operations Activities Feed
    await Activity.create([
      {
        user: nebiyu._id,
        userName: 'Nebiyu',
        action: 'scheduled meeting with',
        entityType: 'CLIENT',
        entityTitle: 'Skyline Cafe & Roastery',
      },
      {
        user: sadam._id,
        userName: 'Sadam',
        action: 'completed deliverable on',
        entityType: 'PROJECT',
        entityTitle: 'Bakery ERP & POS',
      },
      {
        user: abdulaziz._id,
        userName: 'Abdulaziz',
        action: 'moved task to In Progress',
        entityType: 'TASK',
        entityTitle: 'Implement recipe batch yield calculation',
      },
      {
        user: abdulaziz._id,
        userName: 'Abdulaziz',
        action: 'logged 3h 30m on',
        entityType: 'TIME',
        entityTitle: 'Bakery ERP & POS',
      },
      {
        user: nebiyu._id,
        userName: 'Nebiyu',
        action: 'submitted daily EOD check-in',
        entityType: 'TASK',
        entityTitle: 'Daily Standup',
      },
      {
        user: sadam._id,
        userName: 'Sadam',
        action: 'submitted daily EOD check-in',
        entityType: 'TASK',
        entityTitle: 'Daily Standup',
      },
    ]);

    console.log('🔔 Created initial operations feed events');

    console.log('\n======================================================');
    console.log('✨ DATABASE RE-SEEDED SUCCESSFULLY WITH PRODUCTION DATA');
    console.log('======================================================');
    console.log('Login credentials for testing:');
    console.log('  👨‍💻 Admin:      abdulazizisa579@gmail.com / password123');
    console.log('  💼 Growth:     nebiyu@rhizan.com         / password123');
    console.log('  🎯 Operations: sadam@rhizan.com          / password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

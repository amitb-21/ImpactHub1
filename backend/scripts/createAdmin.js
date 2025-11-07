import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../src/config/env.js';
import User from '../src/models/User.js';
import ImpactMetric from '../src/models/ImpactMetric.js';
import VolunteerPoints from '../src/models/VolunteerPoints.js';
import CommunityRewards from '../src/models/CommunityRewards.js';
import Activity from '../src/models/Activity.js';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

async function createAdmin() {
  try {
    log.header('🚀 ImpactHub Admin User Creation');

    // =====================
    // VALIDATE ARGUMENTS
    // =====================
    const args = process.argv.slice(2);

    if (args.length < 2) {
      log.error('Missing required arguments');
      console.log(`
${colors.bright}Usage:${colors.reset}
  node scripts/createAdmin.js <email> <password> [name]

${colors.bright}Example:${colors.reset}
  node scripts/createAdmin.js admin@impacthub.app AdminPass123 "Admin User"

${colors.bright}Arguments:${colors.reset}
  email      - Admin email address (required)
  password   - Admin password, min 6 characters (required)
  name       - Admin display name (optional, defaults to "Admin")
      `);
      process.exit(1);
    }

    const email = args[0].toLowerCase();
    const password = args[1];
    const name = args[2] || 'Admin';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log.error('Invalid email format');
      process.exit(1);
    }

    // Validate password length
    if (password.length < 6) {
      log.error('Password must be at least 6 characters');
      process.exit(1);
    }

    log.info(`Email: ${email}`);
    log.info(`Name: ${name}`);
    log.info(`Password: ${'*'.repeat(password.length)}`);

    // =====================
    // CONNECT TO DATABASE
    // =====================
    log.info('Connecting to MongoDB...');

    await mongoose.connect(config.MONGO_URI, {
      dbName: 'impacthub',
      serverSelectionTimeoutMS: 5000,
    });

    log.success('Connected to MongoDB');

    // =====================
    // CHECK IF USER EXISTS
    // =====================
    log.info(`Checking if user "${email}" already exists...`);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        log.warn(`User "${email}" already exists and is an admin`);
        log.info(`Admin Details:`);
        console.log(`
  • ID: ${existingUser._id}
  • Name: ${existingUser.name}
  • Email: ${existingUser.email}
  • Role: ${existingUser.role}
  • Points: ${existingUser.points}
  • Level: ${existingUser.level}
  • Created: ${existingUser.createdAt.toLocaleString()}
        `);
      } else {
        log.warn(`User "${email}" exists but is not an admin (Role: ${existingUser.role})`);
        log.info('Upgrading user to admin...');

        existingUser.role = 'admin';
        await existingUser.save();

        log.success(`User upgraded to admin role`);
        console.log(`
  • ID: ${existingUser._id}
  • Name: ${existingUser.name}
  • Email: ${existingUser.email}
  • Role: ${existingUser.role}
  • Points: ${existingUser.points}
  • Level: ${existingUser.level}
        `);
      }

      await mongoose.connection.close();
      log.success('Disconnected from MongoDB');
      process.exit(0);
    }

    // =====================
    // CREATE ADMIN USER
    // =====================
    log.info('Creating admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      points: 0,
      level: 1,
      isActive: true,
      profileImage: null,
      bio: null,
      location: null,
    });

    log.success(`Admin user created successfully`);

    // =====================
    // INITIALIZE RECORDS
    // =====================
    log.info('Initializing admin records...');

    // Create ImpactMetric
    await ImpactMetric.create({
      user: admin._id,
      totalPoints: 0,
      eventsParticipated: 0,
      eventsCreated: 0,
      communitiesJoined: 0,
      communitiesCreated: 0,
      hoursVolunteered: 0,
      level: 1,
    });

    log.success('ImpactMetric record created');

    // Create VolunteerPoints
    await VolunteerPoints.create({
      user: admin._id,
      totalPoints: 0,
      pointsBreakdown: {
        eventParticipation: 0,
        eventCreation: 0,
        communityCreation: 0,
        communityJoined: 0,
        hoursVolunteered: 0,
        ratings: 0,
        badges: 0,
        other: 0,
      },
      currentLevel: 1,
      currentRank: 'Beginner',
    });

    log.success('VolunteerPoints record created');

    // Create Activity log
    await Activity.create({
      user: admin._id,
      type: 'user_created',
      description: 'Admin user account created',
      relatedEntity: {
        entityType: 'User',
        entityId: admin._id,
      },
    });

    log.success('Activity record created');

    // =====================
    // DISPLAY SUMMARY
    // =====================
    log.header('✨ Admin User Created Successfully');

    console.log(`${colors.bright}Admin Details:${colors.reset}`);
    console.log(`
  • ID:        ${admin._id}
  • Name:      ${admin.name}
  • Email:     ${admin.email}
  • Role:      ${admin.role}
  • Points:    ${admin.points}
  • Level:     ${admin.level}
  • Active:    ${admin.isActive}
  • Created:   ${admin.createdAt.toLocaleString()}
    `);

    console.log(`${colors.bright}Next Steps:${colors.reset}`);
    console.log(`
  1. Start your ImpactHub server
  2. Login with:
     • Email: ${email}
     • Password: ${password}
  3. Access admin dashboard at: /admin

  4. Change your password immediately after first login
    `);

    // =====================
    // DISCONNECT
    // =====================
    await mongoose.connection.close();
    log.success('Disconnected from MongoDB');

    log.success('✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    log.error('Script failed with error:');
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }

    process.exit(1);
  }
}

// Run the script
createAdmin();
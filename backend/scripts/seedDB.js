import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../src/config/env.js';
import User from '../src/models/User.js';
import Community from '../src/models/Community.js';
import Event from '../src/models/Event.js';
import Participation from '../src/models/Participation.js';
import Activity from '../src/models/Activity.js';
import ImpactMetric from '../src/models/ImpactMetric.js';
import VolunteerPoints from '../src/models/VolunteerPoints.js';
import CommunityRewards from '../src/models/CommunityRewards.js';
import CommunityManagerApplication from '../src/models/CommunityManagerApplication.js';
import Rating from '../src/models/Rating.js';
import Resource from '../src/models/Resource.js';
import EventPhoto from '../src/models/EventPhoto.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Sample users - India based with roles
const mockUsers = [
  // COMMUNITY MANAGERS (Moderators)
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    password: 'password123',
    bio: 'Environmental activist and community organizer from Delhi',
    location: 'New Delhi, India',
    role: 'moderator',
    isActive: true,
    points: 2500,
    level: 5,
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    bio: 'Education advocate and social worker',
    location: 'Mumbai, India',
    role: 'moderator',
    isActive: true,
    points: 2800,
    level: 5,
  },
  {
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    password: 'password123',
    bio: 'Health coordinator and community leader',
    location: 'Bangalore, India',
    role: 'moderator',
    isActive: true,
    points: 2200,
    level: 4,
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    password: 'password123',
    bio: 'Environmental conservation specialist',
    location: 'Hyderabad, India',
    role: 'moderator',
    isActive: true,
    points: 3100,
    level: 6,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    password: 'password123',
    bio: 'Tech for social good advocate',
    location: 'Pune, India',
    role: 'moderator',
    isActive: true,
    points: 2600,
    level: 5,
  },

  // REGULAR USERS
  {
    name: 'Ananya Gupta',
    email: 'ananya@example.com',
    password: 'password123',
    bio: 'Student and volunteer',
    location: 'Delhi, India',
    role: 'user',
    isActive: true,
    points: 1200,
    level: 3,
  },
  {
    name: 'Rohan Desai',
    email: 'rohan@example.com',
    password: 'password123',
    bio: 'Software engineer volunteering for social causes',
    location: 'Bangalore, India',
    role: 'user',
    isActive: true,
    points: 1800,
    level: 4,
  },
  {
    name: 'Kavya Nair',
    email: 'kavya@example.com',
    password: 'password123',
    bio: 'Healthcare worker and community supporter',
    location: 'Kochi, India',
    role: 'user',
    isActive: true,
    points: 950,
    level: 2,
  },
  {
    name: 'Deepak Sharma',
    email: 'deepak@example.com',
    password: 'password123',
    bio: 'Retired teacher passionate about education',
    location: 'Jaipur, India',
    role: 'user',
    isActive: true,
    points: 1450,
    level: 3,
  },
  {
    name: 'Neha Verma',
    email: 'neha@example.com',
    password: 'password123',
    bio: 'Graphic designer and environmental activist',
    location: 'Kolkata, India',
    role: 'user',
    isActive: true,
    points: 1100,
    level: 3,
  },
  {
    name: 'Sanjay Nambiar',
    email: 'sanjay@example.com',
    password: 'password123',
    bio: 'Business professional contributing to community',
    location: 'Chennai, India',
    role: 'user',
    isActive: true,
    points: 1600,
    level: 3,
  },
  {
    name: 'Ritika Singh',
    email: 'ritika@example.com',
    password: 'password123',
    bio: 'NGO coordinator and social entrepreneur',
    location: 'Ahmedabad, India',
    role: 'user',
    isActive: true,
    points: 1700,
    level: 4,
  },
  {
    name: 'Amit Joshi',
    email: 'amit@example.com',
    password: 'password123',
    bio: 'Environmental scientist and researcher',
    location: 'Pune, India',
    role: 'user',
    isActive: true,
    points: 1350,
    level: 3,
  },
  {
    name: 'Divya Menon',
    email: 'divya@example.com',
    password: 'password123',
    bio: 'Content writer and awareness campaigner',
    location: 'Thiruvananthapuram, India',
    role: 'user',
    isActive: true,
    points: 980,
    level: 2,
  },

  // ADMIN
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    bio: 'Platform administrator',
    location: 'India',
    role: 'admin',
    isActive: true,
    points: 5000,
    level: 10,
  },
];

const mockCommunities = [
  {
    name: 'Delhi Clean Air Initiative',
    description: 'Fighting air pollution in Delhi NCR through community action, awareness campaigns, and tree plantation drives.',
    category: 'Environment',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      address: 'Nehru Park, New Delhi',
      coordinates: {
        type: 'Point',
        coordinates: [77.0595, 28.5921],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Clean+Air',
  },
  {
    name: 'Mumbai Coastal Cleanup Warriors',
    description: 'Protecting Mumbais beaches and marine life. Regular beach cleanups, ocean conservation, and plastic awareness.',
    category: 'Environment',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Marine Drive, Mumbai',
      coordinates: {
        type: 'Point',
        coordinates: [72.8285, 19.0176],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Coastal+Cleanup',
  },
  {
    name: 'Bangalore Tech For All',
    description: 'Digital literacy and tech education for underserved communities. Coding workshops, device donations, and online training.',
    category: 'Education',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Indiranagar Community Center, Bangalore',
      coordinates: {
        type: 'Point',
        coordinates: [77.6412, 13.0827],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Tech+For+All',
  },
  {
    name: 'Hyderabad Water Conservation Alliance',
    description: 'Addressing water scarcity through conservation, rainwater harvesting, and community education programs.',
    category: 'Environment',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Hussain Sagar Lake, Hyderabad',
      coordinates: {
        type: 'Point',
        coordinates: [78.4746, 17.3850],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Water+Conservation',
  },
  {
    name: 'Pune Community Health Network',
    description: 'Providing healthcare access, health awareness camps, and wellness programs to underserved populations.',
    category: 'Health',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Katraj Community Center, Pune',
      coordinates: {
        type: 'Point',
        coordinates: [73.8126, 18.5204],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Health+Network',
  },
  {
    name: 'Kolkata Education Empowerment',
    description: 'Quality education and mentorship for underprivileged children. Scholarship programs and skill development.',
    category: 'Education',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      address: 'South Kolkata Community Hall',
      coordinates: {
        type: 'Point',
        coordinates: [88.3639, 22.5726],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Education',
  },
  {
    name: 'Jaipur Green Spaces Initiative',
    description: 'Urban gardening, park restoration, and green belt development for a sustainable Jaipur.',
    category: 'Environment',
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Albert Hall Park, Jaipur',
      coordinates: {
        type: 'Point',
        coordinates: [75.8243, 26.9149],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Green+Spaces',
  },
  {
    name: 'Chennai Waste Warriors',
    description: 'Waste management, recycling initiatives, and zero-waste lifestyle promotion in Chennai.',
    category: 'Environment',
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: 'Marina Beach, Chennai',
      coordinates: {
        type: 'Point',
        coordinates: [80.2809, 13.0499],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Waste+Warriors',
  },
  {
    name: 'Ahmedabad Urban Development Corps',
    description: 'Community-led urban development, slum upgradation, and livelihood programs.',
    category: 'Social',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      address: 'Sabarmati Riverfront, Ahmedabad',
      coordinates: {
        type: 'Point',
        coordinates: [72.5454, 23.0225],
      },
    },
    image: 'https://via.placeholder.com/400x300?text=Urban+Dev',
  },
];

const mockEvents = [
  {
    title: 'Delhi Air Quality Awareness Walk',
    description: 'Join us for an awareness walk about air pollution and climate change. Learn about reducing carbon footprint.',
    category: 'Volunteering',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      address: 'Nehru Park Entry Gate',
      coordinates: {
        type: 'Point',
        coordinates: [77.0595, 28.5921],
      },
    },
    maxParticipants: 100,
  },
  {
    title: 'Marine Drive Beach Cleanup',
    description: 'Help clean up Marine Drive beach. Collect plastic waste, learn about ocean conservation.',
    category: 'Cleanup',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Marine Drive, Worli',
      coordinates: {
        type: 'Point',
        coordinates: [72.8285, 19.0176],
      },
    },
    maxParticipants: 80,
  },
  {
    title: 'Coding Workshop for Rural Youth',
    description: 'Free coding workshop teaching Python and web development to rural students.',
    category: 'Education',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Indiranagar Community Center',
      coordinates: {
        type: 'Point',
        coordinates: [77.6412, 13.0827],
      },
    },
    maxParticipants: 50,
  },
  {
    title: 'Rainwater Harvesting Installation Day',
    description: 'Install rainwater harvesting systems in community buildings. Training and materials provided.',
    category: 'Volunteering',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Hussain Sagar Lake Area',
      coordinates: {
        type: 'Point',
        coordinates: [78.4746, 17.3850],
      },
    },
    maxParticipants: 60,
  },
  {
    title: 'Free Health Camp - Pune',
    description: 'Free health checkup camp with doctors. Blood pressure, blood sugar, and general health screening.',
    category: 'Volunteering',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Katraj Community Center',
      coordinates: {
        type: 'Point',
        coordinates: [73.8126, 18.5204],
      },
    },
    maxParticipants: 150,
  },
  {
    title: 'Tree Plantation Drive - Kolkata',
    description: 'Plant 500 trees in Kolkata. Help green the city and combat air pollution.',
    category: 'Volunteering',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      address: 'South Kolkata Green Zone',
      coordinates: {
        type: 'Point',
        coordinates: [88.3639, 22.5726],
      },
    },
    maxParticipants: 120,
  },
  {
    title: 'Jaipur Urban Garden Workshop',
    description: 'Learn organic gardening and composting. Start your own rooftop or backyard garden.',
    category: 'Education',
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Albert Hall Park',
      coordinates: {
        type: 'Point',
        coordinates: [75.8243, 26.9149],
      },
    },
    maxParticipants: 75,
  },
  {
    title: 'Chennai Plastic Reduction Campaign',
    description: 'Learn about plastic reduction, participate in awareness activities, and receive eco-friendly alternatives.',
    category: 'Cleanup',
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: 'Marina Beach',
      coordinates: {
        type: 'Point',
        coordinates: [80.2809, 13.0499],
      },
    },
    maxParticipants: 90,
  },
  {
    title: 'Ahmedabad Slum Upgradation Volunteer Drive',
    description: 'Help improve living conditions in slum areas. Paint buildings, install solar lights, basic repairs.',
    category: 'Volunteering',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      address: 'Sabarmati Riverfront Slum Area',
      coordinates: {
        type: 'Point',
        coordinates: [72.5454, 23.0225],
      },
    },
    maxParticipants: 110,
  },
  {
    title: 'Digital Literacy for Senior Citizens',
    description: 'Teach senior citizens how to use smartphones, video calls, and online banking.',
    category: 'Education',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Indiranagar Senior Center',
      coordinates: {
        type: 'Point',
        coordinates: [77.6412, 13.0827],
      },
    },
    maxParticipants: 40,
  },
  {
    title: 'Delhi Water Conservation Awareness',
    description: 'Interactive session on water conservation techniques for homes and offices.',
    category: 'Education',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      address: 'Nehru Park Auditorium',
      coordinates: {
        type: 'Point',
        coordinates: [77.0595, 28.5921],
      },
    },
    maxParticipants: 70,
  },
  {
    title: 'Mumbai Women Empowerment Workshop',
    description: 'Skill development and entrepreneurship training for women from low-income backgrounds.',
    category: 'Education',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Bandra Community Center',
      coordinates: {
        type: 'Point',
        coordinates: [72.8306, 19.0596],
      },
    },
    maxParticipants: 60,
  },
];

const mockResources = [
  {
    title: 'Volunteering in India: A Beginners Guide',
    description: 'Comprehensive guide to starting your volunteering journey in India.',
    content: 'Volunteering is a powerful way to contribute to society and create positive change. This guide covers finding opportunities, understanding impact, and maximizing your contribution to Indian communities.',
    category: 'Community Building',
    type: 'article',
    difficulty: 'Beginner',
    tags: ['volunteering', 'getting-started', 'india'],
    isPublished: true,
  },
  {
    title: 'Climate Change and India',
    description: 'Understanding climate change impacts specific to India.',
    content: 'India faces unique climate challenges. This resource explores the impacts and solutions relevant to Indian geography and population.',
    category: 'Environmental Education',
    type: 'article',
    difficulty: 'Intermediate',
    tags: ['climate', 'environment', 'india'],
    isPublished: true,
  },
  {
    title: 'Water Conservation Techniques for Indian Homes',
    description: 'Practical water saving tips for households in India.',
    content: 'With water scarcity affecting many Indian regions, learn simple techniques to conserve water in your home and community.',
    category: 'Sustainability Tips',
    type: 'article',
    difficulty: 'Beginner',
    tags: ['water', 'conservation', 'india'],
    isPublished: true,
  },
];

async function seedDatabase() {
  try {
    log.header('🌱 ImpactHub India Database Seeding');

    log.info('Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI, {
      dbName: 'impacthub',
      serverSelectionTimeoutMS: 5000,
    });
    log.success('Connected to MongoDB');

    log.info('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Community.deleteMany({}),
      Event.deleteMany({}),
      Participation.deleteMany({}),
      Activity.deleteMany({}),
      ImpactMetric.deleteMany({}),
      VolunteerPoints.deleteMany({}),
      CommunityRewards.deleteMany({}),
      Rating.deleteMany({}),
      Resource.deleteMany({}),
      CommunityManagerApplication.deleteMany({}),
    ]);
    log.success('Cleared all collections');

    // Create users
    log.info('Creating users...');
    const hashedUsers = await Promise.all(
      mockUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        communitiesJoined: [],
        eventsParticipated: [],
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    log.success(`Created ${createdUsers.length} users`);

    // Identify community managers
    const communityManagers = createdUsers.filter((u) => u.role === 'moderator');
    log.warn(`Community Managers (${communityManagers.length}):`);
    communityManagers.forEach((u) => {
      console.log(`  👤 ${u.name} (${u.email}) - Location: ${u.location}`);
    });

    // Create communities with community managers as creators
    log.info('Creating communities...');
    const communitiesWithCreator = mockCommunities.map((community, index) => ({
      ...community,
      createdBy: communityManagers[index % communityManagers.length]._id,
      members: [communityManagers[index % communityManagers.length]._id],
      totalMembers: 1,
      verificationStatus: 'verified',
      avgRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      totalRatings: Math.floor(Math.random() * 30) + 5,
      isActive: true,
    }));

    const createdCommunities = await Community.insertMany(communitiesWithCreator);
    log.success(`Created ${createdCommunities.length} communities`);

    // Update community members (add some regular users)
    log.info('Adding members to communities...');
    const regularUsers = createdUsers.filter((u) => u.role === 'user');
    for (let i = 0; i < createdCommunities.length; i++) {
      const community = createdCommunities[i];
      const membersToAdd = regularUsers.slice(0, Math.floor(Math.random() * 4) + 2);
      community.members.push(...membersToAdd.map((u) => u._id));
      community.totalMembers = community.members.length;
      await community.save();

      membersToAdd.forEach((user) => {
        user.communitiesJoined.push(community._id);
      });
    }
    log.success('Added members to communities');

    // Create events
    log.info('Creating events...');
    const eventsWithDetails = mockEvents.map((event, index) => {
      const community = createdCommunities[index % createdCommunities.length];
      const creator = community.createdBy;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (index + 1));
      startDate.setHours(9, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 3);

      return {
        ...event,
        community: community._id,
        createdBy: creator,
        participants: [creator],
        startDate,
        endDate,
        status: 'Upcoming',
      };
    });

    const createdEvents = await Event.insertMany(eventsWithDetails);
    log.success(`Created ${createdEvents.length} events`);

    // Create participations
    log.info('Creating participations...');
    const participations = [];
    for (let i = 0; i < createdEvents.length; i++) {
      const event = createdEvents[i];
      const community = createdCommunities[i % createdCommunities.length];
      const participants = regularUsers.slice(0, Math.min(Math.floor(Math.random() * 6) + 2, regularUsers.length));

      for (const participant of participants) {
        participations.push({
          user: participant._id,
          event: event._id,
          community: event.community,
          status: Math.random() > 0.5 ? 'Attended' : 'Registered',
          hoursContributed: Math.random() > 0.4 ? Math.floor(Math.random() * 5) + 1 : 0,
          pointsEarned: Math.floor(Math.random() * 150) + 50,
          wishlist: {
            isSaved: Math.random() > 0.7,
            savedAt: new Date(),
          },
        });
      }
    }

    const createdParticipations = await Participation.insertMany(participations);
    log.success(`Created ${createdParticipations.length} participations`);

    // Create impact metrics
    log.info('Creating impact metrics...');
    const impactMetrics = createdUsers.map((user) => ({
      user: user._id,
      totalPoints: user.points,
      eventsParticipated: Math.floor(Math.random() * 15) + 2,
      eventsCreated: user.role === 'moderator' ? Math.floor(Math.random() * 8) + 2 : 0,
      communitiesJoined: user.communitiesJoined.length,
      communitiesCreated: user.role === 'moderator' ? 1 : 0,
      hoursVolunteered: Math.floor(Math.random() * 100) + 10,
      co2Reduced: Math.floor(Math.random() * 200),
      treesPlanted: Math.floor(Math.random() * 50),
      peopleHelped: Math.floor(Math.random() * 100),
      level: user.level,
    }));

    const createdMetrics = await ImpactMetric.insertMany(impactMetrics);
    log.success(`Created ${createdMetrics.length} impact metrics`);

    // Create volunteer points
    log.info('Creating volunteer points...');
    const volunteerPoints = createdUsers.map((user) => {
      let rank = 'Beginner';
      if (user.points > 500) rank = 'Contributor';
      if (user.points > 1500) rank = 'Leader';
      if (user.points > 3000) rank = 'Champion';
      if (user.points > 5000) rank = 'Legend';

      return {
        user: user._id,
        totalPoints: user.points,
        currentLevel: user.level,
        currentRank: rank,
        pointsBreakdown: {
          eventParticipation: Math.floor(user.points * 0.4),
          eventCreation: Math.floor(user.points * 0.2),
          communityCreation: Math.floor(user.points * 0.15),
          communityJoined: Math.floor(user.points * 0.1),
          hoursVolunteered: Math.floor(user.points * 0.15),
        },
      };
    });

    const createdVolunteerPoints = await VolunteerPoints.insertMany(volunteerPoints);
    log.success(`Created ${createdVolunteerPoints.length} volunteer points records`);

    // Create community rewards
    log.info('Creating community rewards...');
    const communityRewards = createdCommunities.map((community) => {
      let tier = 'Bronze';
      const points = Math.floor(Math.random() * 8000) + 1000;
      if (points > 1000) tier = 'Silver';
      if (points > 2500) tier = 'Gold';
      if (points > 5000) tier = 'Platinum';
      if (points > 10000) tier = 'Diamond';

      return {
        community: community._id,
        totalPoints: points,
        pointsBreakdown: {
          creationBonus: 150,
          memberJoined: Math.floor(Math.random() * 300),
          eventsCreated: Math.floor(Math.random() * 400),
          verificationBonus: 500,
        },
        communityTier: tier,
        totalMembers: community.members.length,
        totalEvents: Math.floor(Math.random() * 20) + 1,
        verificationStatus: 'verified',
        metrics: {
          avgRating: community.avgRating,
          totalRatings: community.totalRatings,
        },
      };
    });

    const createdCommunityRewards = await CommunityRewards.insertMany(communityRewards);
    log.success(`Created ${createdCommunityRewards.length} community rewards records`);

    // Create activities
    log.info('Creating activities...');
    const activities = [];
    for (let i = 0; i < createdUsers.length; i++) {
      activities.push(
        {
          user: createdUsers[i]._id,
          type: 'event_joined',
          description: `Joined ${createdEvents[i % createdEvents.length].title}`,
          relatedEntity: {
            entityType: 'Event',
            entityId: createdEvents[i % createdEvents.length]._id,
          },
        },
        {
          user: createdUsers[i]._id,
          type: 'community_joined',
          description: `Joined ${createdCommunities[i % createdCommunities.length].name}`,
          relatedEntity: {
            entityType: 'Community',
            entityId: createdCommunities[i % createdCommunities.length]._id,
          },
        },
        {
          user: createdUsers[i]._id,
          type: 'points_earned',
          description: `Earned ${Math.floor(Math.random() * 100) + 50} points`,
          metadata: {
            pointsEarned: Math.floor(Math.random() * 100) + 50,
          },
          relatedEntity: {
            entityType: 'User',
            entityId: createdUsers[i]._id,
          },
        }
      );
    }

    const createdActivities = await Activity.insertMany(activities);
    log.success(`Created ${createdActivities.length} activities`);

    // Create ratings - ensure no duplicates
    log.info('Creating ratings...');
    const ratings = [];
    const usedCombinations = new Map(); // Map of "userId-entityType-entityId"

    // Rate each community with different users (max 3 ratings per community)
    for (let i = 0; i < createdCommunities.length; i++) {
      const community = createdCommunities[i];
      const maxRatingsPerCommunity = 3;

      for (let j = 0; j < maxRatingsPerCommunity; j++) {
        const userIndex = (i * 3 + j) % regularUsers.length;
        const user = regularUsers[userIndex];
        const key = `${user._id.toString()}-Community-${community._id.toString()}`;

        // Skip if already used
        if (usedCombinations.has(key)) {
          continue;
        }

        ratings.push({
          ratedBy: user._id,
          ratedEntity: {
            entityType: 'Community',
            entityId: community._id,
          },
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          review: [
            'Great community with amazing volunteer opportunities!',
            'Very organized and impactful initiatives.',
            'Wonderful team and great community spirit!',
            'Making real difference in our society.',
            'Highly recommend joining this community!',
          ][Math.floor(Math.random() * 5)],
          isVerifiedParticipant: true,
        });
        usedCombinations.set(key, true);
      }
    }

    // Rate each event with different users (max 2 ratings per event)
    for (let i = 0; i < createdEvents.length; i++) {
      const event = createdEvents[i];
      const maxRatingsPerEvent = 2;

      for (let j = 0; j < maxRatingsPerEvent; j++) {
        const userIndex = (i * 2 + j) % regularUsers.length;
        const user = regularUsers[userIndex];
        const key = `${user._id.toString()}-Event-${event._id.toString()}`;

        // Skip if already used
        if (usedCombinations.has(key)) {
          continue;
        }

        ratings.push({
          ratedBy: user._id,
          ratedEntity: {
            entityType: 'Event',
            entityId: event._id,
          },
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          review: 'Excellent event, well organized and impactful!',
          isVerifiedParticipant: true,
        });
        usedCombinations.set(key, true);
      }
    }

    const createdRatings = await Rating.insertMany(ratings);
    log.success(`Created ${createdRatings.length} ratings`);

    // Create resources
    log.info('Creating resources...');
    const resourcesWithAuthor = mockResources.map((resource, index) => ({
      ...resource,
      author: communityManagers[index % communityManagers.length]._id,
      views: Math.floor(Math.random() * 500),
      likes: Math.floor(Math.random() * 100),
      estimatedReadTime: Math.floor(Math.random() * 10) + 3,
    }));

    const createdResources = await Resource.insertMany(resourcesWithAuthor);
    log.success(`Created ${createdResources.length} resources`);

    // Create community manager applications (some approved)
    log.info('Creating community manager applications...');
    const applications = [
      {
        applicant: regularUsers[0]._id,
        status: 'approved',
        communityDetails: {
          name: 'Sambalpur Environmental Action Group',
          description: 'Fighting environmental degradation in Sambalpur region',
          category: 'Environment',
          contactEmail: 'sambalpur-env@example.com',
          location: {
            city: 'Sambalpur',
            state: 'Odisha',
            coordinates: {
              lat: 21.5614,
              lng: 83.9879,
            },
          },
        },
        organizationDetails: {
          registrationNumber: 'ODISHA-ENV-2024-001',
          foundedYear: 2022,
          totalMembers: 150,
          activeMembers: 85,
          pastEventsOrganized: 12,
          organizationType: 'NGO',
        },
        managerExperience: {
          yearsOfExperience: 5,
          previousRoles: 'Environmental activist and community organizer for 5 years, led multiple tree plantation and cleanup drives',
          motivation: 'Passionate about protecting our environment and engaging communities in sustainable practices',
          goals: 'To build a strong community focused on environmental conservation in Sambalpur',
        },
        adminReview: {
          reviewedBy: createdUsers.find((u) => u.role === 'admin')._id,
          reviewedAt: new Date(),
          approvalNotes: 'Strong application with good track record',
        },
        communicationPreference: {
          email: true,
          inApp: true,
        },
      },
      {
        applicant: regularUsers[1]._id,
        status: 'pending',
        communityDetails: {
          name: 'Rural Education Initiative - Odisha',
          description: 'Providing quality education and digital literacy to rural areas',
          category: 'Education',
          contactEmail: 'rural-edu@example.com',
          location: {
            city: 'Cuttack',
            state: 'Odisha',
            coordinates: {
              lat: 20.4625,
              lng: 85.8830,
            },
          },
        },
        organizationDetails: {
          registrationNumber: 'ODISHA-EDU-2023-045',
          foundedYear: 2020,
          totalMembers: 200,
          activeMembers: 120,
          pastEventsOrganized: 25,
          organizationType: 'Non-Profit',
        },
        managerExperience: {
          yearsOfExperience: 8,
          previousRoles: 'Education coordinator and volunteer trainer in various NGOs across Odisha',
          motivation: 'Committed to bridging the education gap in rural Odisha through community-led initiatives',
          goals: 'Establish digital literacy centers and provide skill training in all villages within Cuttack district',
        },
        communicationPreference: {
          email: true,
          inApp: true,
        },
      },
      {
        applicant: regularUsers[2]._id,
        status: 'pending',
        communityDetails: {
          name: 'Odisha Health Alliance',
          description: 'Community health awareness and preventive healthcare programs',
          category: 'Health',
          contactEmail: 'odisha-health@example.com',
          location: {
            city: 'Bhubaneswar',
            state: 'Odisha',
            coordinates: {
              lat: 20.2961,
              lng: 85.8245,
            },
          },
        },
        organizationDetails: {
          registrationNumber: 'ODISHA-HEALTH-2024-002',
          foundedYear: 2021,
          totalMembers: 175,
          activeMembers: 95,
          pastEventsOrganized: 18,
          organizationType: 'NGO',
        },
        managerExperience: {
          yearsOfExperience: 6,
          previousRoles: 'Healthcare worker and community health educator',
          motivation: 'Improving health outcomes in underserved communities through awareness and access programs',
          goals: 'Conduct monthly health camps in 10 different villages and provide basic health education',
        },
        communicationPreference: {
          email: true,
          inApp: false,
        },
      },
    ];

    const createdApplications = await CommunityManagerApplication.insertMany(applications);
    log.success(`Created ${createdApplications.length} community manager applications`);

    // Create approved community from application
    const approvedApp = createdApplications.find((app) => app.status === 'approved');
    if (approvedApp) {
      const approvedCommunity = await Community.create({
        name: approvedApp.communityDetails.name,
        description: approvedApp.communityDetails.description,
        category: approvedApp.communityDetails.category,
        location: {
          city: approvedApp.communityDetails.location.city,
          state: approvedApp.communityDetails.location.state,
          coordinates: {
            type: 'Point',
            coordinates: [
              approvedApp.communityDetails.location.coordinates.lng,
              approvedApp.communityDetails.location.coordinates.lat,
            ],
          },
        },
        createdBy: approvedApp.applicant,
        members: [approvedApp.applicant],
        totalMembers: 1,
        verificationStatus: 'verified',
        isActive: true,
      });

      approvedApp.communityCreated = approvedCommunity._id;
      await approvedApp.save();

      // Promote user to moderator if approved
      await User.findByIdAndUpdate(approvedApp.applicant, { role: 'moderator' });

      log.success(`Created community from approved application: ${approvedCommunity.name}`);
    }

    // Final summary
    log.header('✨ Database Seeding Complete!');

    console.log(`
${colors.bright}${colors.cyan}📊 SUMMARY:${colors.reset}
  ✅ Users: ${createdUsers.length}
  ✅ Communities: ${createdCommunities.length}
  ✅ Events: ${createdEvents.length}
  ✅ Participations: ${createdParticipations.length}
  ✅ Impact Metrics: ${createdMetrics.length}
  ✅ Volunteer Points: ${createdVolunteerPoints.length}
  ✅ Community Rewards: ${createdCommunityRewards.length}
  ✅ Activities: ${createdActivities.length}
  ✅ Ratings: ${createdRatings.length}
  ✅ Resources: ${createdResources.length}
  ✅ CM Applications: ${createdApplications.length}
    `);

    console.log(`
${colors.bright}${colors.green}👥 COMMUNITY MANAGERS (Role: Moderator):${colors.reset}`);
    communityManagers.forEach((cm, index) => {
      const managedCommunity = createdCommunities[index % createdCommunities.length];
      console.log(`  ${index + 1}. ${cm.name}`);
      console.log(`     📧 Email: ${cm.email}`);
      console.log(`     📍 Location: ${cm.location}`);
      console.log(`     🏢 Manages: ${managedCommunity.name}`);
      console.log(`     ⭐ Points: ${cm.points} | Level: ${cm.level}\n`);
    });

    console.log(`
${colors.bright}${colors.blue}🔑 TEST CREDENTIALS:${colors.reset}`);
    mockUsers.slice(0, 5).forEach((user) => {
      console.log(`  📧 ${user.email}`);
    });
    console.log(`  🔐 Password: password123 (for all users)`);

    console.log(`
${colors.bright}${colors.yellow}📍 REGIONS COVERED:${colors.reset}
  • Delhi - Air Quality & Water Conservation
  • Mumbai - Coastal Cleanup & Women Empowerment
  • Bangalore - Tech Education & Digital Literacy
  • Hyderabad - Water Conservation
  • Pune - Health & Environment
  • Kolkata - Education & Environment
  • Jaipur - Green Spaces
  • Chennai - Waste Management
  • Ahmedabad - Urban Development
  • Sambalpur - Environmental Action (from CM Application)
    `);

    await mongoose.connection.close();
    log.success('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }
    process.exit(1);
  }
}

seedDatabase();
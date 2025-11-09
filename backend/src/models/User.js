import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
      select: false,
      minlength: 6,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    // ✅ ADD THIS FIELD IF MISSING
    points: {
      type: Number,
      default: 0,
      description: 'Total volunteer points',
    },
    level: {
      type: Number,
      default: 1,
      description: 'User level based on points',
    },
    communitiesJoined: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],
    eventsParticipated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Add indexes - googleId with sparse only (no index: true)
userSchema.index({ googleId: 1, sparse: true });
userSchema.index({ points: -1 }); // ✅ NEW: For leaderboard queries
userSchema.index({ level: -1 }); // ✅ NEW: For level-based queries

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateJWT = function () {
  const payload = { id: this._id, email: this.email };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.googleId;
  delete obj.password;
  return obj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
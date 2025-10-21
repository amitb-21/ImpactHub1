import { z } from 'zod';

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Zod schemas for forms

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Register schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  location: z.string().optional()
});

// Event schema
export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }),
  category: z.string().min(1, 'Category is required'),
  maxParticipants: z.number().optional()
});

// Community schema
export const communitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }),
  category: z.string().min(1, 'Category is required'),
  organizationDetails: z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    foundedYear: z.number().min(1900).max(new Date().getFullYear()),
    memberCount: z.number().min(1),
    pastEventsCount: z.number().min(0)
  })
});

// Rating schema
export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional()
});
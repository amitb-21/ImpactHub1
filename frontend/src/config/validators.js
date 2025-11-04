import { z } from 'zod';

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\n]+@[^\n]+\\.[^\n]+$/;
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
  // rating is handled by component state (stars)
  rating: z.number().min(0).max(5).optional(), // Not strictly required by form, but by submit logic
  review: z.string().max(500, "Review must be 500 characters or less").optional()
});

// --- NEW RESOURCE SCHEMA --- 
export const resourceSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be 200 characters or less"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be 500 characters or less"),
  content: z.string()
    .min(50, "Content must be at least 50 characters"),
  category: z.string()
    .min(1, "Category is required"),
  type: z.enum(['article', 'video', 'pdf', 'template', 'infographic'], { required_error: "Type is required" }),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced'], { required_error: "Difficulty is required" }),
  tags: z.string().optional(), // Comma-separated string
  estimatedReadTime: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number()
      .min(1, "Must be at least 1 minute")
      .max(120, "Must be 120 minutes or less")
      .optional()
  ),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal(''))
  ,
  downloadUrl: z.string().url("Must be a valid URL").optional().or(z.literal(''))
});
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
      description: 'Full article content (supports markdown)',
    },
    category: {
      type: String,
      enum: [
        'Event Planning',
        'Sustainability Tips',
        'Recycling Guides',
        'Energy Conservation',
        'Community Building',
        'Environmental Education',
        'DIY Projects',
        'Local Resources',
        'Templates',
        'Other',
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ['article', 'video', 'pdf', 'template', 'infographic'],
      default: 'article',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    thumbnailImage: {
      type: String,
      default: null,
      description: 'Cover image URL',
    },
    downloadUrl: {
      type: String,
      default: null,
      description: 'URL for downloadable PDFs/templates',
    },
    videoUrl: {
      type: String,
      default: null,
      description: 'YouTube or video URL',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'User who created the resource',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      description: 'Featured resources appear at top',
    },
    isPublished: {
      type: Boolean,
      default: true,
      description: 'Unpublished resources are hidden',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    estimatedReadTime: {
      type: Number,
      default: 5,
      description: 'Estimated minutes to read',
    },
    relatedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
resourceSchema.index({ category: 1, isPublished: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ isFeatured: -1, views: -1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ title: 'text', description: 'text', content: 'text' });

// Increment view count
resourceSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
export default Resource;